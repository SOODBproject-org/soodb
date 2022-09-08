import { error, type MaybeError } from '$lib/functions/response'
import { getUserByUsernameSafe, type DatabaseUserSafe } from '$lib/mongo'
import type { RequestHandler } from './__types/[username].d'

export const GET: RequestHandler<MaybeError<DatabaseUserSafe>> = async function({ params }) {
    const user = await getUserByUsernameSafe(params.username)
    if (user) {
        return {
            status: 200,
            body: user
        }
    } else {
        return error(404, "User not found")
    }
}