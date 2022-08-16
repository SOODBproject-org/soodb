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
        `https://github.com/login/oauth/access_token?client_id=${publicEnv.PUBLIC_GITHUB_CLIENT_ID}&client_secret=${privateEnv.GITHUB_SECRET}&code=${code}`,
        // "https://github.com/login/oauth/access_token",
        {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        }
    );
    if (!accessTokenRes.ok) {
        return {
            status: 500,
            body: JSON.stringify({
                message: "Failed to fetch data from Github",
            }),
        };
    }
    const { access_token: accessToken } = await accessTokenRes.json() as { access_token: string }

    const emailsRes = await fetch(
        "https://api.github.com/user/emails",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    if (!emailsRes.ok) {
        return {
            status: 500,
            body: JSON.stringify({
                message: "Failed to fetch data from Github",
            }),
        };
    }
    const emails = await emailsRes.json() as {
        email: string;
        primary: boolean;
    }[];
    const email = emails.find((val) => val.primary)?.email || emails[0].email;

    const profileRes = await fetch(
        "https://api.github.com/user",
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
                message: "Failed to fetch data from GitHub",
            })
        }
    }
    const profileData = await profileRes.json() as Record<string, string>

    const user = await auth.getUser("github", email)

    if (user) {
        try {
            const authenticateUser = await auth.authenticateUser("github", email);
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
        const createUser = await auth.createUser("github", email, {
            user_data: {
                email,
                username: profileData.login
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
        // violates email column unique constraint
        if (error.message === "AUTH_DUPLICATE_USER_DATA") {
            return {
                status: 400,
                body: JSON.stringify({
                    message: "Email already in use",
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