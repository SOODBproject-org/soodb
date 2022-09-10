export type InternalQuestionKey = "id" | "created" | "modified"

export type RefreshToken = {
    refresh_token: string,
    user_id: string
}

import { env } from "$env/dynamic/private"
import MongoDataAPI from "atlas-data-api"
import type { DatabaseUser } from "lucia-sveltekit/types"
import { escapeRegex } from "./functions/databaseUtils"
import type { Category, Question, UserData, set } from "./types"
import { removePrivateFields, type DistributiveOmit } from "./utils"

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
export const collections = {
    questions: database.collection<Question>("questions"),
    users: database.collection<DatabaseUser<UserData>>("users"),
    sets: database.collection<set>("sets"),
    refreshTokens: database.collection<RefreshToken>("refreshTokens")
}

export type NewQuestionData = DistributiveOmit<Question, InternalQuestionKey>
export async function addQuestion(question: NewQuestionData) {
    const date = new Date()
    const newID = createID()
    return {
        response: collections.questions.insertOne({
            document: {
                ...question,
                id: newID,
                created: date,
                modified: date,
            },
        }),
        id: newID
    }
}

// TODO: make more robust?
export async function addPacket(questions: NewQuestionData[], created: Date) {
    const date = new Date()
    const ids = []
    const questionOBJ: (Question)[] = []
    for (let i = 0; i < Math.floor(questions.length / 2); i++) {
        const tossupID =  createID()
        const bonusID = createID()
        questionOBJ.push({
            ...questions[i * 2],
            id: tossupID,
            pairId: bonusID,
            created,
            modified: date
        })
        questionOBJ.push({
            ...questions[i * 2 + 1],
            id: bonusID,
            pairId: tossupID,
            created,
            modified: date
        })
        ids.push(tossupID)
        ids.push(bonusID)
    }
    if (questions.length % 2 === 1) {
        questionOBJ.push({
            ...questions[questions.length - 1],
            id: createID(),
            created,
            modified: date 
        })
    }
    const currentSet = await (await collections.sets.findOne({filter:{setName:questions[0].set}})).document
    const setName : string = questions[0].set as string
    const round : string = questions[0].round as string  
    if (currentSet) {
        console.dir(currentSet)
        currentSet.packets[questions[0].round as string] = ids
        collections.sets.updateOne({
            filter:{setName:questions[0].set},
            update:{
                $set:{
                    packets:currentSet.packets
                }
            }

        })
    } else {
        collections.sets.insertOne({document:{
            setName,
            packets:{
                [round]: ids
            }
        }})
    }
    return collections.questions.insertMany({documents: questionOBJ}) 
    
}

type QuestionQuery = {
    authorName?: string
    authorId?: string
    keywords?: string
    source?: string
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
    source?: string
    category?: { $in: Category[] }
    type?: { $in: ("SA" | "MCQ")[] }
    created?: {
        $lt?: Date
        $gte?: Date
    }
}

export async function getQuestions({ authorName, authorId, keywords, source, categories, types, timeRange }: QuestionQuery) {
    const mongoQuery: MongoQuestionQuery = {}
    if (authorName) mongoQuery.authorName = authorName
    if (authorId) mongoQuery.authorId = authorId
    if (keywords) mongoQuery.$text = { $search: keywords }
    if (source) mongoQuery.source = source
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

export async function getPackets(){
    const { documents } = await collections.sets.find({filter:{}})
    return documents
}


export async function editQuestion(id: string, newQuestion: Partial<NewQuestionData>) {
    return collections.questions.updateOne({
        filter: { id },
        update: {
            $set: {
                ...newQuestion,
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

export type DatabaseUserSafe = Omit<DatabaseUser<UserData>, 'hashed_password' | 'identifier_token'>

export async function getUserByIDSafe(id: string) {
    const { document } = await collections.users.findOne({ filter: { id } })
    return document ? removePrivateFields(document) : null
}

export async function getUserByUsernameSafe(username: string) {
    const { document } = await collections.users.findOne({ filter: { username } })
    return document ? removePrivateFields(document) : null
}

export async function searchUserByUsernameSafe(username: string) {
    const { documents } = await collections.users.find({
        filter: { username: { $regex: escapeRegex(username), $options: 'i' } },
        limit: 15
    })
    return documents.map(removePrivateFields)
}

export async function updateUser(id: string, data: Partial<UserData>) {
    return collections.users.updateOne({
        filter: { id },
        update: { $set: data },
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