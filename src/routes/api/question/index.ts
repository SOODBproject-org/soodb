import { auth } from "$lib/lucia"
import { addQuestion, getQuestions, getUserByID, type Category, type NewQuestionData, type Question } from "$lib/mongo"
import { removeUndefined } from "$lib/utils"
import fetch from "node-fetch"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler<Question[]> = async function ({ request, url }) {
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

    const authorName = url.searchParams.get("authorName") ?? undefined
    const authorId = url.searchParams.get("authorId") ?? undefined
    const keywords = url.searchParams.get("keywords") ?? undefined
    const categories = url.searchParams.get("categories")?.split(",") as Category[]
    const types = url.searchParams.get("types")?.split(",") as ("MCQ" | "SA")[]
    const startDate = url.searchParams.get("start") ? new Date(url.searchParams.get("start") as string) : undefined
    const endDate = url.searchParams.get("end") ? new Date(url.searchParams.get("end") as string) : undefined

    const includeAuthor = url.searchParams.get("includeAuthor") === "true"

    let result
    if (keywords) {
        const res = await fetch(
            "https://data.mongodb-api.com/app/data-rcsaw/endpoint/findQuestion?" + url.searchParams.toString(),
            {
                headers: {
                    Authorization: "jtQcg6CqX8pQcAvAWfewpEXpWS7XzZ",
                },
            }
        )
        result = (await res.json()) as Question[]
    } else {
        result = await getQuestions({
            ...removeUndefined(cookieQuery),
            ...removeUndefined({
                authorId,
                authorName,
                categories,
                types,
                timeRange: { startDate, endDate },
            }),
        })
    }

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

export const POST: RequestHandler = async function({ request }) {
    try {
        const formData = await request.formData()
        const type = formData.get("type") as "MCQ" | "SA"
        const category = formData.get("category") as Category
        const questionText = formData.get("question-text") as string
        const bonus = formData.get("bonus") === "checked"

        const choices = {
            W: formData.get("W") as string,
            X: formData.get("X") as string,
            Y: formData.get("Y") as string,
            Z: formData.get("Z") as string,
        }
        const correctAnswer = formData.get("correct-answer") as "W" | "X" | "Y" | "Z"
        const answer = formData.get("answer") as string

        const anonymous = formData.get("anonymous") === "true"

        let authorId: string | undefined = undefined
        if (!anonymous) {
            try {
                const user = await auth.validateRequest(request)
                authorId = user.user_id
            } catch {
                return {
                    status: 401
                }
            }
        }

        let question: NewQuestionData
        if (type === "MCQ") {
            question = {
                authorId,
                bonus,
                type,
                category,
                questionText: questionText,
                choices,
                correctAnswer,
            }
        } else if (type === "SA") {
            question = {
                authorId,
                bonus,
                type,
                category,
                questionText: questionText,
                correctAnswer: answer,
            }
        } else {
            return {
                status: 400
            }
        }

        await addQuestion(question)

        return {
            status: 200
        }
    } catch (e) {
        console.error(e)
        return {
            status: 500
        }
    }
}