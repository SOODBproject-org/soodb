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
    const accessTokenRes = await fetch(`https://github.com/login/oauth/access_token?client_id=${publicEnv.PUBLIC_GITHUB_CLIENT_ID}&client_secret=${privateEnv.GITHUB_SECRET}&code=${code}`, {
		headers: {
			Accept: "application/json"
		},
		method: "POST"
	})
    if (!accessTokenRes.ok) {
        console.log(accessTokenRes.statusText)
        return error(500, "Failed to fetch data from GitHub")
    }
    const { access_token: accessToken } = await accessTokenRes.json() as { access_token: string }

    const userRes = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json"
        },
    })
    if (!userRes.ok) {
        console.log(userRes.statusText)
        return error(500, "Failed to fetch data from GitHub")
    }
    const { id: userId, login: username } = await userRes.json() as {
        id: string,
        login: string
    }

    let user: UserData
    try {
		user = await auth.getUserByProviderId("github", userId);
	} catch {
		try {
			user = await auth.createUser("github", userId, {
                attributes: {
                    username
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
