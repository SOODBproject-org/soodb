import { getQuestionByID, type McqQuestion, type SaQuestion } from "$lib/mongo"
import type { RequestHandler } from './__types/[id].d'

export const GET: RequestHandler<SaQuestion | McqQuestion> = async function({ params, locals }) {
    const { id } = params

    if (!locals.userData) {
        return {
            status: 401,
        }
    }

    const result = await getQuestionByID(id)
    if (result) {
        return {
            status: 200,
            body: result,
        }
    } else {
        return {
            status: 404,
        }
    }
}
