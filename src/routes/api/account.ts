import { updateNameOnQuestions, updateUser, type User } from "$lib/mongo"
import type { RequestHandler } from "./__types/account.d"

export const PATCH: RequestHandler<{ user: Partial<User> }> = async function ({ request, locals }) {
    const formData = await request.formData()
    const username = formData.get("username") as string

    if (!locals.userData) {
        return {
            status: 401,
        }
    } else if (!username) {
        return {
            status: 400,
        }
    } else {
        await updateUser(locals.userData.id, { username: username.trim() })
        await updateNameOnQuestions(locals.userData.id, username.trim())

        return {
            status: 200,
            body: {
                user: {
                    id: locals.userData.id,
                    username: username.trim(),
                } as Partial<User>,
            },
        }
    }
}
