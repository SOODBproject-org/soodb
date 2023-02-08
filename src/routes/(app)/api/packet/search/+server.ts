import { json } from '@sveltejs/kit';
import { searchPacketsByName } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async function ({ url }) {
    const packetNameParam = url.searchParams.get("packetName") 
    const packetName = packetNameParam ? "" : packetNameParam as string
    const results = await searchPacketsByName(packetName)
    return json(results)
}
