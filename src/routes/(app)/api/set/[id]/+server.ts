import { json } from '@sveltejs/kit';
import { getSetByID } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async function ({ params }) {
    const { id } = params

    const result = await getSetByID(id)
    if (result) {
        return json(result)
    } else {
        return new Response(undefined, { status: 404 })
    }
}
