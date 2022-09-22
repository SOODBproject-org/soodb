export type InternalQuestionKey = "id" | "created" | "modified"

export type RefreshToken = {
    refresh_token: string
    user_id: string
}

import { env } from "$env/dynamic/private"
import MongoDataAPI from "atlas-data-api"
import type { DatabaseUser } from "lucia-sveltekit/types"
import { escapeRegex } from "./functions/databaseUtils"
import type { Category, Question, UserData, PacketSet, Packet } from "./types"
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
    packets: database.collection<Packet>("packets"),
    sets: database.collection<PacketSet>("sets"),
    refreshTokens: database.collection<RefreshToken>("refreshTokens"),
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
        id: newID,
    }
}

type PacketInfo = {
    created: Date
    name: string
    setId?: string
    setName?: string
}

// TODO: make more robust?
export async function addPacket(questions: NewQuestionData[], { name, setId, setName, created }: PacketInfo) {
    const date = new Date()
    const packetId = createID()
    const newSetId = createID()
    const questionsData = questions.map((q) => ({
        ...q,
        id: createID(),
        created: date,
        modified: date,
        packetId,
        packetName: name
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
    setName?: string
    keywords?: string
    round?: string
    categories?: Category[]
    types?: ("SA" | "MCQ")[]
    timeRange?: {
        startDate?: Date
        endDate?: Date
    },
    page?: number,
    limit?: number
}
type MongoQuestionQuery = {
    authorName?: string
    authorId?: string
    $text?: { $search: string }
    set?: string
    round?: string
    category?: { $in: Category[] }
    type?: { $in: ("SA" | "MCQ")[] }
    created?: {
        $lt?: Date
        $gte?: Date
    }
}

export async function getQuestions({
    authorName,
    authorId,
    keywords,
    setName,
    round,
    categories,
    types,
    timeRange,
    page = 0,
    limit = 96
}: QuestionQuery) {
    const mongoQuery: MongoQuestionQuery = {}
    if (authorName) mongoQuery.authorName = authorName
    if (authorId) mongoQuery.authorId = authorId
    if (keywords) mongoQuery.$text = { $search: keywords }
    if (setName) mongoQuery.set = setName
    if (round) mongoQuery.round = round
    if (categories?.length) mongoQuery.category = { $in: categories }
    if (types?.length) mongoQuery.type = { $in: types }
    if (timeRange && (timeRange.startDate || timeRange.endDate)) {
        mongoQuery.created = {}
        if (timeRange.startDate) mongoQuery.created.$gte = timeRange.startDate
        if (timeRange.endDate) mongoQuery.created.$lt = timeRange.endDate
    }

    const { documents } = await collections.questions.find({
        filter: mongoQuery,
        skip: page * 24,
        limit,
    })
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
