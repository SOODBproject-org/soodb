import { error, redirect } from "$lib/functions/response"
import { auth } from "$lib/lucia"
import { newUserSchema } from "$lib/schemas/user"
import type { UserData } from "$lib/types"
import type { Error } from "lucia-sveltekit"
import type { RequestHandler } from "./__types/signup.d"

export const POST: RequestHandler = async function ({ request }) {
    const data = await request.formData()
    const username = data.get("username") as string
    const password = data.get("password") as string
    const confirmPassword = data.get("confirm-password") as string

    const parseResult = newUserSchema.safeParse({
        username,
        password,
        confirmPassword
    })
    
    if (!parseResult.success || password !== confirmPassword) return redirect("/signup")
    
    try {
        const createdUser = await auth.createUser("username", username, {
            password,
            user_data: {
                username,
            } as UserData,
        })

        return {
            status: 302,
            headers: {
                "Set-Cookie": createdUser.cookies,
                "Location": "/account",
            },
        }
    } catch (e) {
        const err = e as Error
        if (err.message === "AUTH_DUPLICATE_IDENTIFIER_TOKEN") {
            return error(400, "ID is already in use")
        } else if (err.message === "AUTH_DUPLICATE_USER_DATA") {
            return error(400, "Invalid user data")
        } else {
            return error(500, "An unknown error occurred")
        }
    }
}
