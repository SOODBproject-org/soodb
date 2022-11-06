import { json } from '@sveltejs/kit';
import { error } from "$lib/functions/response"
import { getRandom } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"
import { removeUndefined } from "$lib/utils"

export const GET: RequestHandler = async function ({ request, url }) {
    const checkCookies = url.searchParams.get("checkCookies") === "true"
    let cookieQuery: Record<string, string | string[]> = {}
    try {
        const parsed: Record<string, string> = checkCookies
            ? JSON.parse(
                  decodeURIComponent(
                      request.headers
                          .get("cookie")
                          ?.split("; ")
                          .find((x) => x.split("=")[0] === "previousQuery")
                          ?.split("=")[1] ?? "{}"
                  )
              )
            : {}
        cookieQuery = {
            ...parsed,
            categories: parsed.categories,
            types: parsed.types,
        }
        // eslint-disable-next-line no-empty
    } catch (e) {}

    const authorId = url.searchParams.get("authorId") ?? undefined
    //const keywords = url.searchParams.get("keywords") ?? undefined
    const setName = url.searchParams.get("setName") ?? undefined
    const round = url.searchParams.get("round") ?? undefined
    const categories = url.searchParams.get("categories")?.split(",") as string[]
    const types = url.searchParams.get("types")?.split(",") as ("MCQ" | "SA")[]
    const startDate = url.searchParams.get("start") ? new Date(url.searchParams.get("start") as string) : undefined
    const endDate = url.searchParams.get("end") ? new Date(url.searchParams.get("end") as string) : undefined

    const result = await getRandom({
        ...removeUndefined(cookieQuery),
        ...removeUndefined({
            authorId,
            setName,
            round,
            categories,
            types,
            timeRange: { startDate, endDate },
        }),
    })

    if (!result) {
        return error(404, "No questions found")
    } else {
        return json(result)
    }
}
