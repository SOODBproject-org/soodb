import type { MaybeError } from "$lib/functions/response"
import { getSetByID } from "$lib/mongo"
import type { PacketSet } from "$lib/types"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler<MaybeError<PacketSet>> = async function ({ params }) {
    const { id } = params

    const result = await getSetByID(id)
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
