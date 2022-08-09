import { getQuestions, type Category, type McqQuestion, type SaQuestion } from "$lib/mongo"
import type { RequestHandler } from './__types/random.d'

export const GET: RequestHandler<SaQuestion | McqQuestion> = async function({ url }) {
    const authorName = url.searchParams.get("authorName") ?? undefined
    const authorId = url.searchParams.get("authorId") ?? undefined
    const keywords = url.searchParams.get("keywords") ?? undefined
    const categories = <Category[]>url.searchParams.get("categories")?.split(",")
    const types = <("MCQ" | "SA")[]>url.searchParams.get("types")?.split(",")
    const startDate = url.searchParams.get("start") ? new Date(url.searchParams.get("start") as string) : undefined
    const endDate = url.searchParams.get("end") ? new Date(url.searchParams.get("end") as string) : undefined
    
    const questions = await getQuestions({
        authorId,
        authorName,
        keywords,
        categories,
        types,
        timeRange: { startDate, endDate },
    })
    if (questions.length === 0) {
        return {
            status: 404,
        }
    } else {
        return {
            status: 200,
            body: questions[Math.floor(Math.random() * questions.length)],
        }
    }
}
