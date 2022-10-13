import { error, type MaybeError } from "$lib/functions/response"
import { getRandom } from "$lib/mongo"
import type { Question } from "$lib/types"
import type { RequestHandler } from "./__types/random.d"
import { removeUndefined } from "$lib/utils"

export const GET: RequestHandler<MaybeError<Question>> = async function ({ request, url }) {
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

    const result : Question = await getRandom({
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
    console.dir(result)

    if (!result) {
        return error(404, "No questions found")
    } else {
        return {
            status: 200,
            body: result,
        }
    }
}
