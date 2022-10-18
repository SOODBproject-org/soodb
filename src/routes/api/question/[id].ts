import { error, type MaybeError } from "$lib/functions/response"
import { getQuestionByID, getUserByID } from "$lib/mongo"
import type { Question } from "$lib/types"
import type { RequestHandler } from "./__types/[id].d"

export const GET: RequestHandler<MaybeError<Question>> = async function ({ params, url }) {
    const { id } = params
    const includeAuthor = url.searchParams.get("includeAuthor") === "true"

    const time = Date.now()
    const result = await getQuestionByID(id)
    console.log(Date.now() - time)
    if (result) {
        if (includeAuthor) {
            const user = result.authorId ? await getUserByID(result.authorId) : null
            return {
                status: 200,
                body: {
                    ...result,
                    authorName: user?.username,
                },
            }
        } else {
            return {
                status: 200,
                body: result,
            }
        }
    } else {
        return error(404, "Question with specified ID does not exist")
    }
}
