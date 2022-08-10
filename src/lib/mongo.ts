export type Category = "earth" | "bio" | "chem" | "physics" | "math" | "energy"
export interface McqBase {
    type: "MCQ"
    isBonus: boolean
    category: Category
    questionText: string
    source: string
    authorId?: string
    authorName?: string
    choices: {
        W: string
        X: string
        Y: string
        Z: string
    }
    correctAnswer: "W" | "X" | "Y" | "Z"
}

export interface SaBase {
    type: "SA"
    isBonus: boolean
    category: Category
    questionText: string
    source: string
    authorId?: string
    authorName?: string
    correctAnswer: string
}

export interface McqQuestion extends McqBase {
    id: string
    pairID?: string
    date: Date
}
export interface SaQuestion extends SaBase {
    id: string
    pairID?: string
    date: Date
}

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
import { createMongoDBDataAPI } from "mongodb-data-api"

function createID() {
    const time = Date.now()
    const time1 = time.toString(16).slice(0, 4)
    const time2 = time.toString(16).slice(4, 8)
    const random1 = Math.floor(Math.random() * 16).toString(16)
    const random2 = Math.floor(Math.random() * 16).toString(16)
    const id = time2 + random1 + time1 + random2
    return id
}

console.log(env.DATABASE_KEY)
console.log(env.DATABASE_URL)

const api = createMongoDBDataAPI({
    apiKey: env.DATABASE_KEY,
    urlEndpoint: env.DATABASE_URL,
})
const database = api.$database("ScibowlOpenDB")
const collections = {
    questions: database.$collection<SaQuestion | McqQuestion>("questions"),
    users: database.$collection<User>("users"),
    userSettings: database.$collection<UserSettings>("userSettings"),
}

export async function addQuestion(question: SaBase | McqBase) {
    let searchString = question.questionText + " " + question.correctAnswer
    if (question.type === "MCQ") {
        searchString +=
            " " + question.choices.W + " " + question.choices.X + " " + question.choices.Y + " " + question.choices.Z
    }
    await collections.questions.insertOne({
        document: {
            id: createID(),
            ...question,
            searchString,
            date: new Date(),
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
    date?: {
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
        mongoQuery.date = {}
        if (timeRange.startDate) mongoQuery.date.$gte = timeRange.startDate
        if (timeRange.endDate) mongoQuery.date.$lt = timeRange.endDate
    }
    const questions = await collections.questions.find({
        filter: mongoQuery,
    })
    return questions.documents
}

export async function editQuestion(newQuestion: Partial<SaQuestion | McqQuestion>) {
    let searchString = newQuestion.questionText + " " + newQuestion.correctAnswer
    if (newQuestion.type === "MCQ") {
        searchString +=
            " " +
            (newQuestion.choices?.W ?? "") +
            " " +
            (newQuestion.choices?.X ?? "") +
            " " +
            (newQuestion.choices?.Y ?? "") +
            " " +
            (newQuestion.choices?.Z ?? "")
    }
    await collections.questions.updateOne({
        filter: { id: newQuestion.id },
        update: {
            $set: {
                ...newQuestion,
                searchString,
            },
        },
    })
}

export async function getQuestionByID(id: string) {
    const { document } = await collections.questions.findOne({ id })
    return document || null
}

export async function getUserByID(id: string) {
    const { document } = await collections.users.findOne({ id })
    return document || null
}

export async function getUserFromID(id: string): Promise<User | null> {
    const { document } = await collections.users.findOne({ id })
    return document
        ? {
              id: document.id,
              username: document.username,
              avatarHash: document.avatarHash,
          }
        : null
}

export async function updateUser(id: string, data: Partial<User>) {
    return await collections.users.updateOne({
        filter: { id },
        update: { $set: data },
    })
}

export async function updateNameOnQuestions(authorId: string, authorName: string) {
    return await collections.questions.updateMany({
        filter: { authorId },
        update: { $set: { authorName } },
    })
}

export async function getUserSettings(id: string): Promise<UserSettings | null> {
    const { document } = await collections.userSettings.findOne({ id })
    return document ?? null
}

export async function updateAvatarHash(id: string, avatarHash: string) {
    return await collections.users.updateOne({
        filter: { id },
        update: {
            $set: {
                avatarHash,
            },
        },
    })
}

export async function getRandomQuestionId() {
    const questions = await getQuestions({})
    if (!(questions.length === 0)) {
        return questions[Math.floor(Math.random() * questions.length)].id
    } else {
        return null
    }
}
