import { error } from "$lib/functions/response"
import { auth } from "$lib/server/lucia"
import type { LuciaError } from "lucia-auth"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async function ({ request }) {
    const data = await request.formData()
    const username = data.get("username") as string
    const password = data.get("password") as string
    try {
        const user = await auth.authenticateUser("username", username, password)

        const session = await auth.createSession(user.id)
        const serializedSessionCookies = auth.createSessionCookies(session)

        return new Response(null, {
            status: 302,
            headers: {
                "Set-Cookie": serializedSessionCookies.join(),
                "Location": "/account",
            },
        })
    } catch (e) {
        let err = e as LuciaError
        if (err.message === "AUTH_INVALID_USER_ID") {
            return error(401, "Authentication failed")
        } else if (err.message === "AUTH_INVALID_PASSWORD") {
            return error(401, "Authentication failed")
        } else {
            return error(500, "An unknown error occurred")
        }
    }
}
