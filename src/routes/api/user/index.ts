import { auth } from "$lib/lucia"
import { getUserByIDSafe, getUserByUsernameSafe, updateUser, type UserData } from "$lib/mongo"
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

    if (!/[\S]{6,30}/.test(username)) {
        return {
            status: 400,
            body: JSON.stringify({
                message: "Invalid username"
            })
        }
    }

    try {
        const user = await auth.validateRequest(request)

        const existingUser = await getUserByUsernameSafe(username)

        if (existingUser && existingUser.id !== user.user_id) {
            return {
                status: 400,
                body: JSON.stringify({
                    message: "Username taken"
                })
            }
        }

        await updateUser(user.user_id, { username: username })
        return {
            status: 200,
            body: {
                user: {
                    id: user.user_id,
                    username: username,
                } as Partial<DatabaseUser<UserData>>,
            },
        }
    } catch {
        return {
            status: 401
        }
    }
}
