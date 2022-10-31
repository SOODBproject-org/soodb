export type InternalQuestionKey = "id" | "created" | "modified"

export type RefreshToken = {
    refresh_token: string
    user_id: string
}

import { env } from "$env/static/private"
import MongoDataAPI from "atlas-data-api"
import type { DatabaseUser } from "lucia-sveltekit/types"
import { escapeRegex } from "./functions/databaseUtils"
import type { Category, Question, UserData, PacketSet, Packet } from "./types"
import { removePrivateFields, type DistributiveOmit } from "./utils"
import ShortUniqueId from "short-unique-id"

// TODO: _id migration

const uid = new ShortUniqueId({ dictionary: "alphanum", length: 10 })

const api = new MongoDataAPI({
    key: env.DATABASE_KEY,
    id: env.DATABASE_APP_ID,
})
const database = api.cluster("SOODB").database("ScibowlOpenDB")
export const collections = {
    questions: database.collection<Question>("questions"),
    users: database.collection<DatabaseUser<UserData>>("users"),
    packets: database.collection<Packet>("packets"),
    sets: database.collection<PacketSet>("sets"),
    refreshTokens: database.collection<RefreshToken>("refreshTokens"),
}

export type NewQuestionData = DistributiveOmit<Question, InternalQuestionKey>
export async function addQuestion(question: NewQuestionData) {
    const date = new Date()
    const newID = uid()
    return {
        response: collections.questions.insertOne({
            document: {
                ...question,
                id: newID,
                created: date,
                modified: date,
            },
        }),
        id: newID,
    }
}

type PacketInfo = {
    created: Date
    name: string
    setId?: string
    setName?: string
}

export async function addPacket(questions: NewQuestionData[], { name, setId, setName, created }: PacketInfo) {
    const date = new Date()
    const packetId = uid()
    const newSetId = uid()
    const questionsData = questions.map((q) => ({
        ...q,
        id: uid(),
        created: date,
        modified: date,
        packetId,
        packetName: name,
    }))

    collections.sets.updateOne({
        filter: {
            id: setId,
        },
        update: {
            $push: {
                packetIds: packetId,
            },
            $setOnInsert: {
                id: newSetId,
                name: setName,
            },
        },
        upsert: true,
    })
    collections.packets.insertOne({
        document: {
            id: packetId,
            name,
            setId: setId || newSetId,
            created,
            questionIds: questionsData.map((q) => q.id),
        },
    })
    collections.questions.insertMany({
        documents: questionsData,
    })

    return { id: packetId }
}

export async function getPackets() {
    const { documents } = await collections.sets.find({ filter: {} })
    return documents
}

export async function getPacketByID(id: string) {
    const { document } = await collections.packets.findOne({
        filter: {
            id,
        },
    })
    return document
}

export async function searchPacketsByName(name: string) {
    const { documents } = await collections.packets.find({
        filter: {
            name: { $regex: escapeRegex(name), $options: "i" },
        },
        limit: 15,
    })
    return documents
}

export async function getSets() {
    const { documents } = await collections.sets.find({ filter: {} })
    return documents
}

export async function getSetByID(id: string) {
    const { document } = await collections.sets.findOne({
        filter: {
            id,
        },
    })
    return document
}

export async function searchSetsByName(name: string) {
    const { documents } = await collections.sets.find({
        filter: {
            name: { $regex: escapeRegex(name), $options: "i" },
        },
        limit: 15,
    })
    return documents
}

type QuestionQuery = {
    authorName?: string
    authorId?: string
    packetIds?: string[]
    packetName?: string
    keywords?: string
    categories?: Category[]
    types?: ("SA" | "MCQ")[]
    timeRange?: {
        startDate?: Date
        endDate?: Date
    }
    page?: number
    limit?: number
}
type MongoQuestionQuery = {
    authorId?: string
    $text?: { $search: string }
    packetId?: { $in: string[] }
    packetName?: { $regex: string, $options: string }
    category?: { $in: Category[] }
    type?: { $in: ("SA" | "MCQ")[] }
    created?: {
        $lt?: Date
        $gte?: Date
    }
}

export async function getQuestions({
    authorId,
    packetIds,
    packetName,
    categories,
    types,
    timeRange,
    page = 0,
    limit = 96,
}: QuestionQuery) {
    const mongoQuery: MongoQuestionQuery = {}
    if (authorId) mongoQuery.authorId = authorId
    if (packetIds) mongoQuery.packetId = { $in: packetIds }
    if (packetName) mongoQuery.packetName = { $regex: escapeRegex(packetName), $options: "i" }
    if (categories?.length) mongoQuery.category = { $in: categories }
    if (types?.length) mongoQuery.type = { $in: types }
    if (timeRange && (timeRange.startDate || timeRange.endDate)) {
        mongoQuery.created = {}
        if (timeRange.startDate) mongoQuery.created.$gte = timeRange.startDate
        if (timeRange.endDate) mongoQuery.created.$lt = timeRange.endDate
    }

    const { documents } = await collections.questions.find({
        filter: mongoQuery,
        skip: (page - 1) * 24,
        limit,
    })
    return documents
}


export async function getNumQuestions({
    authorId,
    packetIds,
    packetName,
    categories,
    types,
    timeRange,
    page = 0,
    limit = 96,
}: QuestionQuery){
    const mongoQuery: MongoQuestionQuery = {}
    if (authorId) mongoQuery.authorId = authorId
    if (packetIds) mongoQuery.packetId = { $in: packetIds }
    if (packetName) mongoQuery.packetName = { $regex: escapeRegex(packetName), $options: "i" }
    if (categories?.length) mongoQuery.category = { $in: categories }
    if (types?.length) mongoQuery.type = { $in: types }
    if (timeRange && (timeRange.startDate || timeRange.endDate)) {
        mongoQuery.created = {}
        if (timeRange.startDate) mongoQuery.created.$gte = timeRange.startDate
        if (timeRange.endDate) mongoQuery.created.$lt = timeRange.endDate
    }
    let k = 30000
    let highk = k
    let lowk = 0
    const iterations = []
    for (let i=0;i<Math.log2(k)+1;i++){
        iterations.push(0)
    }
    for await (const i of iterations){
        if(!((await collections.questions.find({
            filter: mongoQuery,
            skip: k,
            limit: 1,
        })).documents.length)) {
            highk = k
            k=(k+lowk)/2  
        }
        else {
            lowk = k
            k = (k+highk)/2 
        }   
    }
    return k 
}

export async function getRandom({
    authorId,
    packetIds,
    packetName,
    categories,
    types,
    timeRange,
}: QuestionQuery) {

    const mongoQuery: MongoQuestionQuery = {}
    if (authorId) mongoQuery.authorId = authorId
    if (packetIds) mongoQuery.packetId = { $in: packetIds }
    if (packetName) mongoQuery.packetName = { $regex: escapeRegex(packetName), $options: "i" }
    if (categories?.length) mongoQuery.category = { $in: categories }
    if (types?.length) mongoQuery.type = { $in: types }
    if (timeRange && (timeRange.startDate || timeRange.endDate)) {
        mongoQuery.created = {}
        if (timeRange.startDate) mongoQuery.created.$gte = timeRange.startDate
        if (timeRange.endDate) mongoQuery.created.$lt = timeRange.endDate
    }

    const { documents } = await collections.questions.aggregate({
        pipeline:[ 
            { $match: mongoQuery },
            { $sample: { size: 1 } } 
        ]
    })
    return documents[0] as Question
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

export type DatabaseUserSafe = Omit<DatabaseUser<UserData>, "hashed_password" | "identifier_token">

export async function getUserByIDSafe(id: string) {
    const { document } = await collections.users.findOne({ filter: { id } })
    return document ? removePrivateFields(document) : null
}

export async function getUserByUsernameSafe(username: string) {
    const { document } = await collections.users.findOne({ filter: { username } })
    return document ? removePrivateFields(document) : null
}

export async function searchUsersByUsernameSafe(username: string) {
    const { documents } = await collections.users.find({
        filter: { username: { $regex: escapeRegex(username), $options: "i" } },
        limit: 15,
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
