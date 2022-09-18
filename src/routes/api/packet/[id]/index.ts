import type { MaybeError } from "$lib/functions/response"
import { getPacketByID } from "$lib/mongo"
import type { Packet } from "$lib/types"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler<MaybeError<Packet>> = async function ({ params }) {
    const { id } = params

    const result = await getPacketByID(id)
    if (result) {
        return {
            status: 200,
            body: result,
        }
    } else {
        return {
            status: 404,
        }
    }
}
