import { error, type MaybeError } from "$lib/functions/response"
import { getUserByIDSafe, type DatabaseUserSafe } from "$lib/mongo"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler<MaybeError<DatabaseUserSafe>> = async function ({ params }) {
    const { id } = params

    const result = await getUserByIDSafe(id)
    if (result) {
        return {
            status: 200,
            body: result,
        }
    } else {
        return error(404, "User not found")
    }
}
