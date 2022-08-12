import { getQuestionByID, getUserByID, type McqQuestion, type SaQuestion } from "$lib/mongo"
import type { RequestHandler } from "./__types/[id].d"

export const GET: RequestHandler<SaQuestion | McqQuestion> = async function ({ params, url }) {
    const { id } = params
    const includeAuthor = url.searchParams.get("includeAuthor") === "true"

    const result = await getQuestionByID(id)
    if (result) {
        if (includeAuthor) {
            return {
                status: 200,
                body: {
                    ...result,
                    authorName: result.authorId ? (await getUserByID(result.authorId))?.username : undefined,
                },
            }
        } else {
            return {
                status: 200,
                body: result,
            }
        }
    } else {
        return {
            status: 404,
        }
    }
}
