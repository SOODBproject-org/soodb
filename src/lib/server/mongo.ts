import { env } from "$env/dynamic/private"
import MongoDataAPI from "atlas-data-api"
import type { Session, UserSchema } from "lucia-auth/types"
import { escapeRegex } from "../functions/databaseUtils"
import type { Category, Question, UserData, DatabaseQuestion, DatabaseUser, DatabasePacketSet, DatabasePacket, InternalQuestionKey, Packet, PacketSet, UserSafe } from "../types"
import { convertId, removePrivateFields, type DistributiveOmit } from "../utils"
import ShortUniqueId from "short-unique-id"

const uid = new ShortUniqueId({ dictionary: "alphanum", length: 10 })

const api = new MongoDataAPI({
    key: env.DATABASE_KEY,
    id: env.DATABASE_APP_ID,
})
const database = api.cluster("SOODB").database("Development")
export const collections = {
    questions: database.collection<DatabaseQuestion>("questions"),
    users: database.collection<DatabaseUser>("users"),
    packets: database.collection<DatabasePacket>("packets"),
    sets: database.collection<DatabasePacketSet>("sets"),
    sessions: database.collection<Session>("sessions"),
}

export type NewQuestionData = DistributiveOmit<Question, InternalQuestionKey>
export async function addQuestion(question: NewQuestionData) {
    const date = new Date()
    const newID = uid()
    return {
        response: await collections.questions.insertOne({
            document: {
                ...question,
                _id: newID,
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
        _id: uid(),
        created: date,
        modified: date,
        packetId,
        packetName: name,
    }))
    if(!setId && setName){
        collections.sets.insertOne({
            document:{
                id:newSetId,
                name: setName,
                packetIds: packetId,
            }
        })
    }
    collections.sets.updateOne({
        filter: {
            _id: setId,
        },
        update: {
            $push: {
                packetIds: packetId,
            },
            $setOnInsert: {
                _id: newSetId,
                name: setName,
            },
        },
        upsert: true,
    })
    collections.packets.insertOne({
        document: {
            _id: packetId,
            name,
            setId: setId || newSetId,
            created,
            questionIds: questionsData.map((q) => q._id),
        },
    })
    collections.questions.insertMany({
        documents: questionsData,
    })

    return { id: packetId }
}

export async function getPackets() {
    const { documents } = await collections.sets.find({ filter: {} })
    return documents.map(d => convertId(d)) as Packet[]
}

export async function getPacketByID(id: string) {
    const { document } = await collections.packets.findOne({
        filter: {
            _id: id,
        },
    })
    return convertId(document) as Packet | null
}

export async function searchPacketsByName(name: string) {
    const { documents } = await collections.packets.find({
        filter: {
            name: { $regex: escapeRegex(name), $options: "i" },
        },
        limit: 90,
    })
    return documents.map(d => convertId(d)) as Packet[]
}

export async function getSets() {
    const { documents } = await collections.sets.find({ filter: {} })
    return documents.map(d => convertId(d)) as PacketSet[]
}

export async function getSetByID(id: string) {
    const { document } = await collections.sets.findOne({
        filter: {
            _id: id,
        },
    })
    return convertId(document) as PacketSet | null
}

export async function searchSetsByName(name: string) {
    const { documents } = await collections.sets.find({
        filter: {
            name: { $regex: escapeRegex(name), $options: "i" },
        },
        limit: 15,
    })
    return documents.map(d => convertId(d)) as PacketSet[]
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
    limit = 5000,
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
    return documents.map(d => convertId(d)) as Question[]
}

// TODO: cleanup
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
    return convertId(documents[0]) as Question | null
}




export async function editQuestion(id: string, newQuestion: Partial<NewQuestionData>) {
    return collections.questions.updateOne({
        filter: { _id: id },
        update: {
            $set: {
                ...newQuestion,
                modified: new Date(),
            },
        },
    })
}

export async function getQuestionByID(id: string) {
    const { document } = await collections.questions.findOne({ filter: { _id: id } })
    return convertId(document) as Question | null
}

export async function getUserByID(id: string) {
    const { document } = await collections.users.findOne({ filter: { _id: id } })
    return convertId(document) as UserSchema | null
}

export type DatabaseUserSafe = Omit<DatabaseUser, "hashed_password" | "identifier_token">

export async function getUserByIDSafe(id: string) {
    const { document } = await collections.users.findOne({ filter: { _id: id } })
    return convertId(document ? removePrivateFields(document) : null) as UserSafe | null
}

export async function getUserByUsernameSafe(username: string) {
    const { document } = await collections.users.findOne({ filter: { username } })
    return convertId(document ? removePrivateFields(document) : null) as UserSchema | null
}

export async function searchUsersByUsernameSafe(username: string) {
    const { documents } = await collections.users.find({
        filter: { username: { $regex: escapeRegex(username), $options: "i" } },
        limit: 15,
    })
    return documents.map(removePrivateFields).map(convertId) as UserSchema[]
}

export async function updateUser(id: string, data: Partial<UserData>) {
    return collections.users.updateOne({
        filter: { _id: id },
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