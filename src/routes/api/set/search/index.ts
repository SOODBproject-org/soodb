import type { MaybeError } from "$lib/functions/response"
import { searchSetsByName } from "$lib/mongo"
import type { PacketSet } from "$lib/types"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler<MaybeError<PacketSet[]>> = async function ({ url }) {
    const setNameParam = url.searchParams.get("setName") 
    console.log(setNameParam)
    const setName = setNameParam ? setNameParam : ""  as string
    console.log(setName)
    const results = await searchSetsByName(setName)
    return {
        body: results,
    }
}
