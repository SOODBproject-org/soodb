import { getPackets } from "$lib/mongo"
import type { set } from "$lib/types"
import type { RequestHandler } from "./__types/index.d"
import type { MaybeError } from "$lib/functions/response"

export const GET: RequestHandler<MaybeError<set[]>> = async function (){
    const result  = await getPackets()
    return {
        status: 200,
        body: result,
    }
}
