import { json } from '@sveltejs/kit';
import { error } from "$lib/functions/response"
import { auth } from "$lib/server/lucia"
import { getUserByIDSafe, getUserByUsernameSafe, updateUser, type DatabaseUserSafe } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async function ({ locals }) {
    const { user } = await locals.getSessionUser()

    if (!user) return error(401, "Unauthorized")

    const userData = await getUserByIDSafe(user.id)
    if (userData) {
        return json(userData)
    } else {
        return error(401, "User data not found")
    }
}

export const PATCH: RequestHandler = async function ({ request, locals }) {
    const formData = await request.formData()
    const username = formData.get("username") as string

    if (!/[\S]{6,30}/.test(username)) {
        return error(400, "Invalid username")
    }

        const { user } = await locals.getSessionUser()

        if (!user) return error(401, "Unauthorized")

        const existingUser = await getUserByUsernameSafe(username)

        if (existingUser && existingUser.id !== user.id) {
            return error(400, "Username taken")
        }

        await updateUser(user.id, { username: username })
        return json({
            user: {
                id: user.id,
                username: username,
            } as Partial<DatabaseUserSafe>,
        })
}
