import fetch from "node-fetch"
import { generateToken } from "$lib/authentication"
import { updateAvatarHash } from "$lib/mongo"
import type { RequestEvent } from "@sveltejs/kit"
import { env } from "$env/dynamic/public"
import { redirectTo } from "$lib/functions/redirectTo"

type DiscordUserResponse = {
    id: string
    username: string
    discriminator: string
    avatar: string | null
    bot?: boolean
    system?: boolean
    mfa_enabled?: boolean
    banner?: string | null
    accent_color?: number | null
    locale?: string
    verified?: boolean
    email?: string | null
}

async function loginUser(token: string, type: string): Promise<DiscordUserResponse | null> {
    const res = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `${type} ${token}`,
        },
    })

    if (res.status === 200) {
        const userData = (await res.json()) as DiscordUserResponse
        if (userData.avatar) {
            await updateAvatarHash(userData.id, userData.avatar)
        }
        return userData
    } else {
        return null
    }
}

export async function get({ url, params }: RequestEvent) {
    const code = url.searchParams.get("code") as string
    if (code) {
        try {
            const res = await fetch("https://discord.com/api/oauth2/token", {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                /* eslint-disable */
                body: new URLSearchParams({
                    client_id: "895468421054083112",
                    client_secret: "58RYXZozmWiqGPvlhODBi26fhzau8zX4",
                    code,
                    grant_type: "authorization_code",
                    redirect_uri: `${env.PUBLIC_HOST_URL}/auth/${params.path}`,
                    scope: "identify",
                }).toString(),
                /* eslint-enable */
            })
            if (res.status === 200) {
                const responseJson = (await res.json()) as Record<string, string>
                const loginResponse = await loginUser(responseJson.access_token, responseJson.token_type)
                if (loginResponse) {
                    return {
                        status: 302,
                        headers: {
                            "Location": "/" + params.path,
                            "Set-Cookie": "authToken=" + generateToken(loginResponse.id) + ";Path=/",
                        },
                    }
                } else {
                    return redirectTo("/login-failed")
                }
            } else {
                return redirectTo("/login-failed")
            }
        } catch (error) {
            // NOTE: An unauthorized token will not throw an error;
            // it will return a 401 Unauthorized response in the try block above
            console.error(error)
            return redirectTo("/login-error")
        }
    } else {
        return {
            status: 400,
        }
    }
}
