import { auth } from "$lib/lucia"
import { updateUser, type UserData } from "$lib/mongo"
import type { User } from "lucia-sveltekit/types"
import type { RequestHandler } from "./__types/account.d"

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
                } as Partial<User<UserData>>,
            },
        }
    } catch {
        return {
            status: 401
        }
    }
}
