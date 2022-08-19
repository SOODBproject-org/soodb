import { env as publicEnv } from '$env/dynamic/public'
import { env as privateEnv } from '$env/dynamic/private'
import type { RequestHandler } from './__types/index.d'
import { auth } from '$lib/lucia'

export const GET: RequestHandler = async function({ url }) {
    const code = url.searchParams.get('code')
    if (!code) {
        return {
            status: 400,
            body: JSON.stringify({
                message: "Invalid request url parameters"
            })
        }
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
        return {
            status: 500,
            body: JSON.stringify({
                message: "Failed to fetch data from Google"
            })
        }
    }
    const { access_token: accessToken } = await accessTokenRes.json() as { access_token: string }
    
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    if (!profileRes.ok) {
        return {
            status: 500,
            body: JSON.stringify({
                message: "Failed to fetch data from Goodle"
            })
        }
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
            return {
                status: 500,
                body: JSON.stringify({
                    message: "An unknown error occured",
                }),
            }
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
        const error = e as Error;
        // violates id column unique constraint
        if (error.message === "AUTH_DUPLICATE_USER_DATA") {
            return {
                status: 400,
                body: JSON.stringify({
                    message: "ID already in use",
                }),
            }
        }
        // database connection error
        return {
            status: 500,
            body: JSON.stringify({
                message: "An unknown error occured",
            }),
        }
    }
}