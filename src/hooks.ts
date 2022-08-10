import type { Handle, GetSession } from "@sveltejs/kit"

import { getUserFromToken } from "$lib/authentication"

export const handle: Handle = async function ({ event, resolve }) {
    const authToken = event.request.headers
        .get("cookie")
        ?.split("; ")
        .find((x) => x.split("=")[0] === "authToken")
        ?.split("=")[1]
    const userData = authToken ? await getUserFromToken(authToken) : null
    event.locals.userData = userData
    return await resolve(event)
}

export const getSession: GetSession = async function (event) {
    return {
        loggedIn: !!event.locals.userData,
        userData: event.locals.userData,
    }
}
