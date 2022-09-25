import { auth } from "$lib/lucia"
import type { RequestHandler } from "@sveltejs/kit"
import { redirect } from "$lib/functions/response"
import { getUserByUsernameSafe, updateUser } from "$lib/mongo"
import { userSettingsSchema } from "$lib/schemas/user"

export const POST: RequestHandler = async function ({ request }) {
    const formData = await request.formData()
    const username = formData.get("username") as string

    try {
        const user = await auth.validateRequest(request)

        const parseResult = userSettingsSchema.safeParse({
            username
        })

        if (!parseResult.success) return redirect("/account")

        if (parseResult.data.username) {
            const existingUser = await getUserByUsernameSafe(parseResult.data.username)
            if (existingUser && existingUser.id !== user.user_id) {
                return redirect("/account")
            }
        }

        await updateUser(user.user_id, parseResult.data)
        return redirect("/account")
    } catch (e) {
        return redirect("/account")
    }
}
