import { error, redirect } from "$lib/functions/response"
import { auth } from "$lib/server/lucia"
import { newUserSchema } from "$lib/schemas/user"
import type { UserData } from "$lib/types"
import type { RequestHandler } from "./$types"
import type { LuciaError } from "lucia-auth"

export const POST: RequestHandler = async function ({ request }) {
    const data = await request.formData()
    const username = data.get("username") as string
    const password = data.get("password") as string
    const confirmPassword = data.get("confirm-password") as string

    const parseResult = newUserSchema.safeParse({
        username,
        password,
        confirmPassword,
    })

    if (!parseResult.success || password !== confirmPassword) {
        return redirect("/signup")
    }

    try {
        const createdUser = await auth.createUser("username", username, {
            password,
            attributes: {
                username,
            } as UserData,
        })

        const session = await auth.createSession(createdUser.id)
        const serializedSessionCookies = auth.createSessionCookies(session)

        return new Response(null, {
            status: 302,
            headers: {
                "Set-Cookie": serializedSessionCookies.join(),
                "Location": "/account",
            },
        })
    } catch (e) {
        const err = e as LuciaError
        if (err.message === "AUTH_DUPLICATE_PROVIDER_ID") {
            return error(400, "ID is already in use")
        } else {
            return error(500, "An unknown error occurred")
        }
    }
}
