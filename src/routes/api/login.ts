import { auth } from "$lib/lucia"
import type { RequestHandler } from "./__types/login.d"

export const POST: RequestHandler = async function({ request }) {
    const data = await request.formData()
    const username = data.get("username") as string
    const password = data.get("password") as string
    const authenticateUser = await auth.authenticateUser(
        "username",
        username,
        password
    )

    return {
        status: 302,
        headers: {
            "Set-Cookie": authenticateUser.cookies,
            "Location": "/account"
        }
    }
}