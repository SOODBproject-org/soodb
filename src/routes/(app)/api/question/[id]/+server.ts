import { json } from '@sveltejs/kit';
import { error } from "$lib/functions/response"
import { getQuestionByID, getUserByID } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async function ({ params, url }) {
    const { id } = params
    const includeAuthor = url.searchParams.get("includeAuthor") === "true"

    const result = await getQuestionByID(id)
    if (result) {
        if (includeAuthor) {
            const user = result.authorId ? await getUserByID(result.authorId) : null
            return json({
    ...result,
    authorName: user?.username,
})
        } else {
            return json(result)
        }
    } else {
        return error(404, "Question with specified ID does not exist")
    }
}
