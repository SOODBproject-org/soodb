import { getUserByID, type User } from "$lib/mongo"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler<User> = async function({ params, locals }) {
    const { id } = params

    if (!locals.userData) {
        return {
            status: 401,
        }
    }

    const result = await getUserByID(id)
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
