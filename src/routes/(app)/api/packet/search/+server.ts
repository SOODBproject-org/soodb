import { json } from '@sveltejs/kit';
import { searchPacketsByName } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async function ({ url }) {
    const packetName = url.searchParams.get("packetName") as string
    const results = packetName ? await searchPacketsByName(packetName) : []
    return json(results)
}
