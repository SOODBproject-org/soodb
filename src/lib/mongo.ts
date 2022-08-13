export type Category = "earth" | "bio" | "chem" | "physics" | "math" | "energy"

interface QuestionBase {
    id: string
    authorId?: string
    bonus: boolean
    category: Category
    questionText: string
    pairId?: string
    source?: string
    searchString: string
    created: Date
    modified: Date
}

export interface McqQuestion extends QuestionBase {
    type: "MCQ"
    choices: {
        W: string
        X: string
        Y: string
        Z: string
    }
    correctAnswer: "W" | "X" | "Y" | "Z"
}

export type InternalQuestionKey = "id" | "searchString" | "created" | "modified"

export interface SaQuestion extends QuestionBase {
    type: "SA"
    correctAnswer: string
}

export type Question = McqQuestion | SaQuestion

export interface User {
    id: string
    username: string
    avatarHash?: string
}

export interface UserSettings {
    id: string
    colors: string[]
    imgUrl?: string
}

import { env } from "$env/dynamic/private"
import MongoDataAPI from "atlas-data-api"
import { createSearchString } from "./functions/databaseUtils"
import type { DistributiveOmit } from "./utils"

function createID() {
    const time = Date.now()
    const time1 = time.toString(16).slice(0, 4)
    const time2 = time.toString(16).slice(4, 8)
    const random1 = Math.floor(Math.random() * 16).toString(16)
    const random2 = Math.floor(Math.random() * 16).toString(16)
    const id = time2 + random1 + time1 + random2
    return id
}

const api = new MongoDataAPI({
    key: env.DATABASE_KEY,
    id: env.DATABASE_APP_ID,
})
const database = api.cluster("SOODB").database("ScibowlOpenDB")
const collections = {
    questions: database.collection<SaQuestion | McqQuestion>("questions"),
    users: database.collection<User>("users"),
    userSettings: database.collection<UserSettings>("userSettings"),
}

export type NewQuestionData = DistributiveOmit<Question, InternalQuestionKey>
export async function addQuestion(question: NewQuestionData) {
    const date = new Date()
    return collections.questions.insertOne({
        document: {
            ...question,
            id: createID(),
            searchString: createSearchString(question),
            created: date,
            modified: date,
        },
    })
}

type QuestionQuery = {
    authorName?: string
    authorId?: string
    keywords?: string
    categories?: Category[]
    types?: ("SA" | "MCQ")[]
    timeRange?: {
        startDate?: Date
        endDate?: Date
    }
}
type MongoQuestionQuery = {
    authorName?: string
    authorId?: string
    $text?: { $search: string }
    category?: { $in: Category[] }
    type?: { $in: ("SA" | "MCQ")[] }
    created?: {
        $lt?: Date
        $gte?: Date
    }
}

export async function getQuestions({ authorName, authorId, keywords, categories, types, timeRange }: QuestionQuery) {
    const mongoQuery: MongoQuestionQuery = {}
    if (authorName) mongoQuery.authorName = authorName
    if (authorId) mongoQuery.authorId = authorId
    if (keywords) mongoQuery.$text = { $search: keywords }
    if (categories?.length) mongoQuery.category = { $in: categories }
    if (types?.length) mongoQuery.type = { $in: types }
    if (timeRange && (timeRange.startDate || timeRange.endDate)) {
        mongoQuery.created = {}
        if (timeRange.startDate) mongoQuery.created.$gte = timeRange.startDate
        if (timeRange.endDate) mongoQuery.created.$lt = timeRange.endDate
    }
    const { documents } = await collections.questions.find({
        filter: mongoQuery,
    })
    return documents
}

export async function editQuestion(id: string, newQuestion: Partial<NewQuestionData>) {
    return collections.questions.updateOne({
        filter: { id },
        update: {
            $set: {
                ...newQuestion,
                searchString: createSearchString(newQuestion),
                modified: new Date(),
            },
        },
    })
}

export async function getQuestionByID(id: string) {
    const { document } = await collections.questions.findOne({ filter: { id } })
    return document
}

export async function getUserByID(id: string) {
    const { document } = await collections.users.findOne({ filter: { id } })
    return document
}

export async function updateUser(id: string, data: Partial<User>) {
    return collections.users.updateOne({
        filter: { id },
        update: { $set: data },
    })
}

export async function getUserSettings(id: string): Promise<UserSettings | null> {
    const { document } = await collections.userSettings.findOne({ filter: { id } })
    return document
}

export async function updateAvatarHash(id: string, avatarHash: string) {
    return collections.users.updateOne({
        filter: { id },
        update: {
            $set: {
                avatarHash,
            },
        },
    })
}

export async function getRandomQuestion() {
    const questions = await getQuestions({})
    if (!(questions.length === 0)) {
        return questions[Math.floor(Math.random() * questions.length)]
    } else {
        return null
    }
}
