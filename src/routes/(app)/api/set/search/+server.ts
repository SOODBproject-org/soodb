import { json } from '@sveltejs/kit';
import { searchSetsByName } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async function ({ url }) {
    const setName = url.searchParams.get("setName") as string
    const results = setName ? await searchSetsByName(setName) : []
    return json(results)
}
