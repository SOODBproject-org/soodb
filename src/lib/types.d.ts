import type { SessionSchema, UserSchema } from "lucia-auth"

export type Category = "earth" | "bio" | "chem" | "physics" | "math" | "energy"

interface QuestionBase {
    id: string
    authorId?: string
    bonus: boolean
    category: Category | "custom"
    customCategory?: string
    questionText: string
    pairId?: string
    packetId?: string
    packetName?: string
    visual?: string
    created: Date
    modified?: Date
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

export interface SaQuestion extends QuestionBase {
    type: "SA"
    correctAnswer: string
}

export type Question = McqQuestion | SaQuestion

export interface UserData {
    username: string
    email?: string
    discordId?: string
    googleId?: string
    packetSubmitter?: boolean
}
export type UserSafe = Omit<UserSchema, 'hashed_password' | 'provider_id'>

export interface Packet {
    id: string
    name: string
    created: Date
    questionIds: string[]
    setId?: string
}

export interface PacketSet {
    id: string
    name: string
    packetIds: string[]
}

export type InternalQuestionKey = "id" | "created" | "modified"

export type DatabaseSession = Rename<SessionSchema, "id", "_id">

export type DatabaseUser = Rename<UserSchema, "id", "_id">
export type DatabaseQuestion = Rename<Question, "id", "_id">
export type DatabasePacket = Rename<Packet, "id", "_id">
export type DatabasePacketSet = Rename<PacketSet, "id", "_id">