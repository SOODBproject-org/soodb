import type { Action } from "@sveltejs/kit"
import { redirect } from "$lib/functions/response"
import { getUserByUsernameSafe, updateUser } from "$lib/server/mongo"
import { userSettingsSchema } from "$lib/schemas/user"

export const POST: Action = async function ({ request, locals }) {
    const formData = await request.formData()
    const username = formData.get("username") as string

    const { user } = await locals.getSessionUser()

    if (!user) {
        return redirect("/account")
    }

    const parseResult = userSettingsSchema.safeParse({
        username,
    })

    if (!parseResult.success) {
        return redirect("/account")
    }

    if (parseResult.data.username) {
        const existingUser = await getUserByUsernameSafe(parseResult.data.username)
        if (existingUser && existingUser.id !== user.id) {
            return redirect("/account")
        }
    }

    await updateUser(user.id, parseResult.data)
    return redirect("/account")
}
