import { auth } from "$lib/lucia"
import { getUserByIDSafe, updateUser, type UserData } from "$lib/mongo"
import type { DatabaseUser } from "lucia-sveltekit/types"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler = async function({ request }) {
    try {
        const user = await auth.validateRequest(request)
        const userData = await getUserByIDSafe(user.user_id)
        return {
            status: 200,
            body: userData
        }
    } catch {
        return {
            status: 401
        }
    }
}

export const PATCH: RequestHandler = async function ({ request }) {
    const formData = await request.formData()
    const username = formData.get("username") as string

    try {
        const user = await auth.validateRequest(request)
        await updateUser(user.user_id, { username: username.trim() })
        return {
            status: 200,
            body: {
                user: {
                    id: user.user_id,
                    username: username.trim(),
                } as Partial<DatabaseUser<UserData>>,
            },
        }
    } catch {
        return {
            status: 401
        }
    }
}
