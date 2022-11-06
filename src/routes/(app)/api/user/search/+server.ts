import { json } from '@sveltejs/kit';
import { searchUsersByUsernameSafe } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async function ({ url }) {
    const username = url.searchParams.get("username")

    const users = username ? await searchUsersByUsernameSafe(username) : []
    return json(users)
}
