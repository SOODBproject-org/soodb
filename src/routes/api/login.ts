import { error } from "$lib/functions/response"
import { auth } from "$lib/lucia"
import type { Error } from "lucia-sveltekit"
import type { RequestHandler } from "./__types/login.d"

export const POST: RequestHandler = async function({ request }) {
    const data = await request.formData()
    const username = data.get("username") as string
    const password = data.get("password") as string
    try {
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
    } catch (e) {
        const err = e as Error
        if (err.message === "AUTH_INVALID_IDENTIFIER_TOKEN") {
            return error(401, "Authentication failed")
        } else if (err.message === "AUTH_INVALID_PASSWORD") {
            return error(401, "Authentication failed")
        } else {
            return error(500, "An unknown error occurred")
        }
    }
}