import { env as publicEnv } from '$env/dynamic/public'
import { env as privateEnv } from '$env/dynamic/private'
import type { RequestHandler } from './__types/google.d'
import { auth } from '$lib/lucia'
import { error } from '$lib/functions/response'

export const GET: RequestHandler = async function({ url }) {
    const code = url.searchParams.get('code')
    if (!code) {
        return error(400, "Invalid request url parameters")
    }

    const params = new URLSearchParams({
        client_id: publicEnv.PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: privateEnv.GOOGLE_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${publicEnv.PUBLIC_HOST_URL}/api/google`
    })
    const accessTokenRes = await fetch(`https://oauth2.googleapis.com/token?${params.toString()}`, {
        method: "POST",
        headers: {
            'Content-Type': "application/x-www-form-urlencoded"
        }
    })
    if (!accessTokenRes.ok) {
        return error(500, "Failed to fetch data from Google")
    }
    const { access_token: accessToken } = await accessTokenRes.json() as { access_token: string }
    
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    if (!profileRes.ok) {
        return error(500, "Failed to fetch data from Google")
    }
    const profileData = await profileRes.json() as Record<string, string>

    const user = await auth.getUser("google", profileData.id)

    if (user) {
        try {
            const authenticateUser = await auth.authenticateUser("google", profileData.id)
            return {
                status: 302,
                headers: {
                    'Set-Cookie': authenticateUser.cookies,
                    'Location': "/"
                }
            }
        } catch {
            return error(500, "An unknown error occurred")
        }
    }

    try {
        const createUser = await auth.createUser("google", profileData.id, {
            user_data: {
                googleId: profileData.id,
                username: profileData.email.split("@")[0]
            }
        })
        return {
            status: 302,
            headers: {
                "Set-Cookie": createUser.cookies,
                "Location": "/account",
            },
        }
    } catch (e) {
        const err = e as Error;
        if (err.message === "AUTH_DUPLICATE_USER_DATA") {
            return error(400, "ID already in use")
        } else {
            return error(500, "An unknown error occurred")
        }
    }
}