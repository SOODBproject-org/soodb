import { json } from '@sveltejs/kit';
import { getPacketByID } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async function ({ params }) {
    const { id } = params

    const result = await getPacketByID(id)
    if (result) {
        return json(result);
    } else {
        return new Response(null, { status: 404 })
    }
}
