import type { MaybeError } from "$lib/functions/response"
import { searchPacketsByName } from "$lib/mongo"
import type { Packet } from "$lib/types"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler<MaybeError<Packet[]>> = async function ({ url }) {
    const packetNameParam = url.searchParams.get("packetName") 
    const packetName = packetNameParam ? packetNameParam : "" as string
    const results = await searchPacketsByName(packetName)
    return {
        body: results,
    }
}
