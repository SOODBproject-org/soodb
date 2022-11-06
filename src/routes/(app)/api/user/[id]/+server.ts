import { json } from '@sveltejs/kit';
import { error } from "$lib/functions/response"
import { getUserByIDSafe } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async function ({ params }) {
    const { id } = params

    const result = await getUserByIDSafe(id)
    if (result) {
        return json(result)
    } else {
        return error(404, "User not found")
    }
}
