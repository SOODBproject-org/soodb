import { json } from '@sveltejs/kit';
import { searchSetsByName } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async function ({ url }) {
    const setNameParam = url.searchParams.get("setName")
    const setName = setNameParam ? setNameParam : ""  as string
    const results = await searchSetsByName(setName)
    return json(results)
}
