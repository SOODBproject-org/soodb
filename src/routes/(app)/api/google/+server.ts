import { env as publicEnv } from "$env/dynamic/public"
import { env as privateEnv } from "$env/dynamic/private"
import type { RequestHandler } from "./$types"
import { auth } from "$lib/server/lucia"
import { error } from "$lib/functions/response"
import type { UserData } from "lucia-auth"

export const GET: RequestHandler = async function ({ url }) {
    const code = url.searchParams.get("code")
    if (!code) {
        return error(400, "Invalid request url parameters")
    }

    const params = new URLSearchParams({
        client_id: publicEnv.PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: privateEnv.GOOGLE_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${publicEnv.PUBLIC_HOST_URL}/api/google`,
    })
    const accessTokenRes = await fetch(`https://oauth2.googleapis.com/token?${params.toString()}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    })
    if (!accessTokenRes.ok) {
        return error(500, "Failed to fetch data from Google")
    }
    const { access_token: accessToken } = (await accessTokenRes.json()) as { access_token: string }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
    if (!profileRes.ok) {
        return error(500, "Failed to fetch data from Google")
    }
    const profileData = (await profileRes.json()) as Record<string, string>

    let user: UserData
    try {
		user = await auth.getUserByProviderId("google", profileData.id);
        console.log("user", user)
	} catch {
		try {
			user = await auth.createUser("google", profileData.id, {
                attributes: {
                    username: profileData.email.split("@")[0]
                }
            });
		} catch {
			return error(500, "Failed to create user")
		}
	}

    try {
		const session = await auth.createSession(user.id);
        console.log("created session", session)
		const serializedSessionCookies = auth.createSessionCookies(session);
		return new Response(null, {
            status: 302,
			headers: {
				"set-cookie": serializedSessionCookies.join(),
                'Location': '/account'
			}
		})
	} catch {
		return error(500, "Failed to create session")
	}
}
