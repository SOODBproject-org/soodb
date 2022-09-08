import type { RequestHandler } from "./__types/discord.d"
import { env as publicEnv } from "$env/dynamic/public"
import { env as privateEnv } from "$env/dynamic/private"
import { auth } from "$lib/lucia";
import { error } from "$lib/functions/response";

export const GET: RequestHandler = async function({ url }) {
    const code = url.searchParams.get("code");
    if (!code) {
        return error(400, "Invalid request url parameters");
    }
    const accessTokenRes = await fetch(
        `https://discord.com/api/v10/oauth2/token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: publicEnv.PUBLIC_DISCORD_CLIENT_ID,
                client_secret: privateEnv.DISCORD_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: `${publicEnv.PUBLIC_HOST_URL}/api/discord`
            })
        }
    );
    if (!accessTokenRes.ok) {
        return error(500, "Failed to fetch data from Discord");
    }
    const { access_token: accessToken } = await accessTokenRes.json() as { access_token: string }

    const profileRes = await fetch(
        "https://discord.com/api/users/@me",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )
    if (!profileRes.ok) {
        return error(500, "Failed to fetch data from Discord");
    }
    const profileData = await profileRes.json() as { id: string, username: string }

    const user = await auth.getUser("discord", profileData.id)

    if (user) {
        try {
            const authenticateUser = await auth.authenticateUser("discord", profileData.id);
            return {
                status: 302,
                headers: {
                    "set-cookie": authenticateUser.cookies,
                    location: "/",
                },
            }
        } catch {
            return error(500, "An unknown error occurred")
        }
    }

    try {
        const createUser = await auth.createUser("discord", profileData.id, {
            user_data: {
                discordId: profileData.id,
                username: profileData.username
            },
        })
        return {
            status: 302,
            headers: {
                "set-cookie": createUser.cookies,
                location: "/account",
            },
        }
    } catch (e) {
        const err = e as Error;
        // violates id column unique constraint
        if (err.message === "AUTH_DUPLICATE_USER_DATA") {
            return error(400, "That ID is already in use")
        }
        // database connection error
        return error(500, "An unknown error occurred")
    }
}