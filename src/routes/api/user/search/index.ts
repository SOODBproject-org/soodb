import { searchUserByUsernameSafe } from '$lib/mongo'
import type { RequestHandler } from './__types/index.d'

export const GET: RequestHandler = async function({ url }) {
    const username = url.searchParams.get("username")

    const users = username ? await searchUserByUsernameSafe(username) : []
    return {
        body: users
    }
}