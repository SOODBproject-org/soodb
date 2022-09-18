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
    username: string,
    email?: string,
    discordId?: string,
    googleId?: string
}

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