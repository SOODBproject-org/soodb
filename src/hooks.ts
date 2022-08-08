import type { Handle, GetSession } from "@sveltejs/kit"

import { getUserFromToken } from "$lib/authentication"

const restrictedEndpoints = ["/write/", "/edit/", "/question-search/", "/question/", "/account/", "/api/"]

export const handle: Handle = async function ({ event, resolve }) {
    const authToken = event.request.headers
        .get("cookie")
        ?.split("; ")
        .find((x) => x.split("=")[0] === "authToken")
        ?.split("=")[1]
    console.log(authToken?.slice(0, 20))
    const userData = await getUserFromToken(authToken)
    console.dir(userData)
    event.locals.userData = userData

    if (restrictedEndpoints.some((e) => event.url.pathname.startsWith(e)) && !event.locals.userData) {
        return new Response(null, {
            status: 403,
        })
    }

    return await resolve(event)
}

export const getSession: GetSession = async function (event) {
    return {
        loggedIn: !!event.locals.userData,
        userData: event.locals.userData,
    }
}
