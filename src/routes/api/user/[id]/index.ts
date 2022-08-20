import { getUserByIDSafe, type DatabaseUserSafe } from "$lib/mongo"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler<DatabaseUserSafe> = async function ({ params }) {
    const { id } = params

    const result = await getUserByIDSafe(id)
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
