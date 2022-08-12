import { getQuestions, getUserByID, type Category, type McqQuestion, type SaQuestion } from "$lib/mongo"
import type { RequestHandler } from "./__types/questions.d"

export const GET: RequestHandler<(SaQuestion | McqQuestion)[]> = async function ({ url }) {
    const authorName = url.searchParams.get("authorName") ?? undefined
    const authorId = url.searchParams.get("authorId") ?? undefined
    const keywords = url.searchParams.get("keywords") ?? undefined
    const categories = <Category[]>url.searchParams.get("categories")?.split(",")
    const types = <("MCQ" | "SA")[]>url.searchParams.get("types")?.split(",")
    const startDate = url.searchParams.get("start") ? new Date(url.searchParams.get("start") as string) : undefined
    const endDate = url.searchParams.get("end") ? new Date(url.searchParams.get("end") as string) : undefined

    const includeAuthor = url.searchParams.get("includeAuthor") === "true"

    const result = await getQuestions({
        authorId,
        authorName,
        keywords,
        categories,
        types,
        timeRange: { startDate, endDate },
    })

    if (includeAuthor) {
        return {
            status: 200,
            body: await Promise.all(
                result.map(async (x) => ({
                    ...x,
                    authorName: x.authorId ? (await getUserByID(x.authorId))?.username : undefined,
                }))
            ),
        }
    } else {
        return {
            status: 200,
            body: result,
        }
    }
}
