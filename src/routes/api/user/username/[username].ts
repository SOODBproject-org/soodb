import { getUserByUsernameSafe } from '$lib/mongo'
import type { RequestHandler } from './__types/[username].d'

export const GET: RequestHandler = async function({ params }) {
    const user = await getUserByUsernameSafe(params.username)
    return {
        body: user
    }
}