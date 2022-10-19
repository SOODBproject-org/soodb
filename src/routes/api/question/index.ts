import { env } from "$env/dynamic/private"
import { error, type MaybeError } from "$lib/functions/response"
import { auth } from "$lib/lucia"
import { addQuestion, getQuestions, getSetByID, getUserByID, type NewQuestionData } from "$lib/mongo"
import { questionSchema } from "$lib/schemas/question"
import type { Category, PacketSet, Question } from "$lib/types"
import { removeUndefined } from "$lib/utils"
import fetch from "node-fetch"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler<MaybeError<Question[]>> = async function ({ request, url }) {
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
    const keywords = url.searchParams.get("keywords") ?? undefined
    const packetIds = url.searchParams.get("packetIds")?.split(",") ?? undefined
    const categories = url.searchParams.get("categories")?.split(",") as string[]
    const types = url.searchParams.get("types")?.split(",") as ("MCQ" | "SA")[]
    const startDate = url.searchParams.get("start") ? new Date(url.searchParams.get("start") as string) : undefined
    const endDate = url.searchParams.get("end") ? new Date(url.searchParams.get("end") as string) : undefined

    const includeAuthor = url.searchParams.get("includeAuthor") === "true"
    const page = Number(url.searchParams.get("page")) || 1
    const limit = Number(url.searchParams.get("limit")) || 96

    const setIds = url.searchParams.get("setIds")?.split(",")
    const sets = setIds && await Promise.all(
        setIds.map(x => getSetByID(x))
    )
    const packetsFromSets = sets
        ? sets.filter((x): x is PacketSet  => x !== null).flatMap(s => s.packetIds)
        : undefined
    let totalPackets
    if (packetsFromSets && packetIds) {
        totalPackets = packetIds.filter(x => packetsFromSets.includes(x))
    } else {
        totalPackets = packetIds || packetsFromSets
    }

    let result
    if (keywords || cookieQuery.keywords) {
        // TODO: fix this
        const params = new URLSearchParams({
            ...removeUndefined(cookieQuery),
            ...Object.fromEntries(url.searchParams.entries()),
            ...(totalPackets ? { packetIds: totalPackets.join(",") } : {}),
            secret: env.ATLAS_ENDPOINT_KEY,
        })
        const res = await fetch(
            "https://data.mongodb-api.com/app/data-rcsaw/endpoint/findQuestion?" + params.toString()
        )
        result = res.ok ? ((await res.json()) as Question[]) : []
    } else {
        result = await getQuestions({
            ...removeUndefined(cookieQuery),
            ...removeUndefined({
                authorId,
                packetIds: totalPackets,
                categories,
                types,
                timeRange: { startDate, endDate },
                page,
                limit,
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

export const POST: RequestHandler = async function ({ request }) {
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
            return error(401, "Unauthorized")
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
        return error(400, "Invalid question data")
    }

    const parseResult = questionSchema.safeParse(question)

    if (!parseResult.success) {
        return error(400, "Invalid question data")
    }

    const { id } = await addQuestion(parseResult.data)

    return {
        status: 201,
        headers: {
            Location: `/api/question/${id}`,
        },
    }
}
