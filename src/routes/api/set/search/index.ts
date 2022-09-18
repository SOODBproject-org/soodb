import type { MaybeError } from '$lib/functions/response'
import { searchSetsByName } from '$lib/mongo'
import type { PacketSet } from '$lib/types'
import type { RequestHandler } from './__types/index.d'

export const GET: RequestHandler<MaybeError<PacketSet[]>> = async function({ url }) {
    const setName = url.searchParams.get('setName') as string
    const results = setName
        ? await searchSetsByName(setName)
        : []
    return {
        body: results
    }
}