import type { RequestHandler } from "./__types/github.d"
import { env as publicEnv } from "$env/dynamic/public"
import { env as privateEnv } from "$env/dynamic/private"
import { auth } from "$lib/lucia";

export const GET: RequestHandler = async function({ url }) {
    const code = url.searchParams.get("code");
    if (!code) {
        return {
            status: 400,
            body: JSON.stringify({
                message: "Invalid request url parameters.",
            }),
        };
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
        console.log(accessTokenRes.status)
        console.log(await accessTokenRes.text())
        return {
            status: 500,
            body: JSON.stringify({
                message: "Failed to fetch data from Discord",
            }),
        };
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
        return {
            status: 500,
            body: JSON.stringify({
                message: "Failed to fetch data from Discord",
            }),
        };
    }
    const profileData = await profileRes.json() as { id: string, username: string }

    const user = await auth.getUser("github", profileData.id)

    if (user) {
        try {
            const authenticateUser = await auth.authenticateUser("github", profileData.id);
            return {
                status: 302,
                headers: {
                    "set-cookie": authenticateUser.cookies,
                    location: "/",
                },
            }
        } catch {
            // Cannot connect to database
            return {
                status: 500,
                body: JSON.stringify({
                    message: "An unknown error occured",
                }),
            }
        }
    }

    try {
        const createUser = await auth.createUser("github", profileData.id, {
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