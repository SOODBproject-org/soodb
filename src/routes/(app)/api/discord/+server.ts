import type { RequestHandler } from "./$types"
import { env as publicEnv } from "$env/dynamic/public"
import { env as privateEnv } from "$env/dynamic/private"
import { auth } from "$lib/server/lucia"
import { error } from "$lib/functions/response"
import type { UserData } from "lucia-auth"

export const GET: RequestHandler = async function ({ url }) {
    const code = url.searchParams.get("code")
    if (!code) {
        return error(400, "Invalid request url parameters")
    }
    const accessTokenRes = await fetch(`https://discord.com/api/v10/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: publicEnv.PUBLIC_DISCORD_CLIENT_ID,
            client_secret: privateEnv.DISCORD_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: `${publicEnv.PUBLIC_HOST_URL}/api/discord`,
        }),
    })
    if (!accessTokenRes.ok) {
        return error(500, "Failed to fetch data from Discord")
    }
    const { access_token: accessToken } = (await accessTokenRes.json()) as { access_token: string }

    const profileRes = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
    if (!profileRes.ok) {
        return error(500, "Failed to fetch data from Discord")
    }
    const profileData = await profileRes.json() as { id: string; username: string }

    let user: UserData
    try {
		user = await auth.getUserByProviderId("discord", profileData.id);
	} catch {
		try {
			user = await auth.createUser("discord", profileData.id, {
                attributes: {
                    username: profileData.username
                }
            });
		} catch {
			return error(500, "Failed to create user")
		}
	}

    try {
		const session = await auth.createSession(user.id);
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
