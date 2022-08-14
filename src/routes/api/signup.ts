import { redirectTo } from "$lib/functions/redirectTo"
import { auth } from "$lib/lucia"
import type { UserData } from "$lib/mongo"
import type { RequestHandler } from "./__types/signup.d"

export const POST: RequestHandler = async function({ request }) {
    const data = await request.formData()
    const username = data.get("username") as string
    const password = data.get("password") as string
    const confirmPassword = data.get("confirm-password") as string
    
    if (password !== confirmPassword) return redirectTo('signup')

    const createdUser = await auth.createUser(
        "username",
        username,
        {
            password,
            user_data: {
                username
            } as UserData
        }
    )

    return {
        status: 302,
        headers: {
            "Set-Cookie": createdUser.cookies,
            "Location": "/account"
        }
    }
}