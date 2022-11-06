import { json } from '@sveltejs/kit';
import { error } from "$lib/functions/response"
import { getUserByUsernameSafe } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async function ({ params }) {
    const user = await getUserByUsernameSafe(params.username)
    if (user) {
        return json(user)
    } else {
        return error(404, "User not found")
    }
}
