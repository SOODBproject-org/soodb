import { error, type MaybeError } from "$lib/functions/response"
import { auth } from "$lib/lucia"
import { getUserByIDSafe, getUserByUsernameSafe, updateUser, type DatabaseUserSafe } from "$lib/mongo"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler = async function ({ request }) {
    try {
        const user = await auth.validateRequest(request)
        const userData = await getUserByIDSafe(user.user_id)
        if (userData) {
            return {
                status: 200,
                body: userData,
            }
        } else {
            return error(401, "User data not found")
        }
    } catch {
        return error(401, "Unauthorized")
    }
}

type PatchResponseBody = {
    user: Partial<DatabaseUserSafe>
}
export const PATCH: RequestHandler<MaybeError<PatchResponseBody>> = async function ({ request }) {
    const formData = await request.formData()
    const username = formData.get("username") as string

    if (!/[\S]{6,30}/.test(username)) {
        return error(400, "Invalid username")
    }

    try {
        const user = await auth.validateRequest(request)

        const existingUser = await getUserByUsernameSafe(username)

        if (existingUser && existingUser.id !== user.user_id) {
            return error(400, "Username taken")
        }

        await updateUser(user.user_id, { username: username })
        return {
            status: 200,
            body: {
                user: {
                    id: user.user_id,
                    username: username,
                } as Partial<DatabaseUserSafe>,
            },
        }
    } catch {
        return error(401, "Unauthorized")
    }
}
