/* eslint-disable camelcase */
import type Collection from "atlas-data-api/lib/Collection";
import { LuciaError, type SessionSchema, type UserSchema } from "lucia-auth";
import { getUpdateData } from "lucia-auth/adapter";
import type { DatabaseUser, DatabaseSession } from "$lib/types"
import { convertId } from "$lib/utils";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId({ dictionary: "alphanum", length: 10 })

export default (collections: {
    users: Collection<DatabaseUser>,
    sessions: Collection<DatabaseSession>
}) => ({
    async getUser(userId: string) {
        const { document } = await collections.users.findOne({
            filter: {
                _id: userId,
            },
        })
        return convertId(document) as UserSchema
    },

    async getUserByProviderId(providerId: string) {
        console.log("providerId", providerId)
        const { document } = await collections.users.findOne({
            filter: {
                provider_id: providerId
            }
        })
        return convertId(document) as UserSchema
    },

    async getSessionAndUserBySessionId(sessionId: string) {
        const { document: session } = await collections.sessions.findOne({
            filter: {
                _id: sessionId
            }
        })
        if (!session) return null

        const { document: user } = await collections.users.findOne({
            filter: {
                _id: session.user_id
            }
        })
        if (!user) return null

        return {
            user: convertId(user) as UserSchema,
            session: convertId(session) as SessionSchema
        }
    },

    async getSession(sessionId: string) {
        const { document } = await collections.sessions.findOne({
            filter: {
                _id: sessionId
            }
        })
        return convertId(document) as SessionSchema ?? null
    },

    async getSessionsByUserId(userId: string) {
        const { documents } = await collections.sessions.find({
            filter: {
                user_id: userId
            }
        })
        return documents.map(d => convertId(d) as SessionSchema)
    },

    async setUser(
        userId: string | null,
        data: {
            providerId?: string | null
			hashedPassword: string | null
			attributes: Record<string, unknown>
        }
    ) {
        const newUser = {
            _id: userId ?? uid(),
            hashed_password: data.hashedPassword,
            provider_id: data.providerId,
            ...data.attributes,
        }

        await collections.users.insertOne({
            document: newUser,
        })
        return convertId(newUser) as UserSchema
    },

    async deleteUser(userId: string) {
        await collections.users.deleteOne({
            filter: {
                _id: userId,
            },
        })
    },

    async setSession(sessionId: string, data: {
        userId: string;
        expires: number;
        idlePeriodExpires: number;
    }) {
        const user = await collections.users.findOne({
            filter: {
                _id: data.userId
            }
        })

        if (!user) throw new LuciaError("AUTH_INVALID_USER_ID")

        await collections.sessions.insertOne({
            document: {
                _id: sessionId,
                user_id: data.userId,
                expires: data.expires,
                idle_expires: data.idlePeriodExpires
            }
        })
    },

    async deleteSession(...sessionIds: string[]) {
        collections.sessions.deleteOne({
            filter: {
                _id: { $in: sessionIds }
            }
        })
    },

    async deleteSessionsByUserId(userId: string) {
        collections.sessions.deleteMany({
            filter: {
                user_id: userId
            }
        })
    },

    async updateUser(
        userId: string,
        newData: {
            providerId?: string | null
			hashedPassword?: string | null
			attributes?: Record<string, unknown>
        }
    ) {
        const updateDoc = getUpdateData(newData)
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
        return convertId(result) as UserSchema
    }
})