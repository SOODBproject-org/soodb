/* eslint-disable camelcase */
import { adapterGetUpdateData } from "lucia-sveltekit"
import type { DatabaseUser } from "lucia-sveltekit/types"
import { collections } from "./mongo"
import type { UserData } from "./types"

export default class AdapterMongo {
    async getUserByRefreshToken(refreshToken: string) {
        const { document: tokenDoc } = await collections.refreshTokens.findOne({
            filter: { refresh_token: refreshToken },
        })
        if (!tokenDoc) return null
        const { document: result } = await collections.users.findOne({
            filter: { id: tokenDoc.user_id },
        })
        return result
    }

    async getUserByIdentifierToken(identifierToken: string) {
        const { document: user } = await collections.users.findOne({
            filter: { identifier_token: identifierToken },
        })
        return user
    }

    async setUser(
        userId: string,
        data: {
            hashed_password: string | null
            identifier_token: string
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            user_data: Record<string, any>
        }
    ) {
        await collections.users.insertOne({
            document: {
                id: userId,
                hashed_password: data.hashed_password,
                identifier_token: data.identifier_token,
                ...(data.user_data as UserData),
            },
        })
    }

    async deleteUser(userId: string) {
        await collections.users.deleteOne({
            filter: {
                id: userId,
            },
        })
    }

    async setRefreshToken(refreshToken: string, userId: string) {
        await collections.refreshTokens.insertOne({
            document: {
                refresh_token: refreshToken,
                user_id: userId,
            },
        })
    }

    async deleteRefreshToken(refreshToken: string) {
        await collections.refreshTokens.deleteOne({
            filter: {
                refresh_token: refreshToken,
            },
        })
    }

    async deleteUserRefreshTokens(userId: string) {
        await collections.refreshTokens.deleteOne({
            filter: {
                user_id: userId,
            },
        })
    }

    async getUserById(userId: string) {
        const { document } = await collections.users.findOne({
            filter: {
                id: userId,
            },
        })
        return document
    }

    async updateUser(
        userId: string,
        newData: {
            identifier_token?: string | null
            hashed_password?: string | null
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            user_data?: Record<string, any>
        }
    ) {
        const updateDoc = adapterGetUpdateData(newData)
        await collections.users.updateOne({
            filter: {
                id: userId,
            },
            update: updateDoc,
        })
        const { document: result } = await collections.users.findOne({
            filter: {
                id: userId,
            },
        })
        return result as DatabaseUser<UserData>
    }
}
