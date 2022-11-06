import type { PageLoad } from "./$types"
import Cookie from "js-cookie"
import { browser } from "$app/environment"

export const load: PageLoad = async function ({ fetch, url, params }) {
    const paramQueryEntries = [...url.searchParams.entries()]
        .filter(([key]) =>
            ["authorId", "keywords", "set", "round", "start", "end", "types", "categories"].includes(key)
        )
        .map(([key, value]) => {
            if (key === "types" || key === "categories") {
                return [key, value.split(",")]
            } else {
                return [key, value]
            }
        })

    const paramQuery = Object.fromEntries(paramQueryEntries)

    const previousQuery: Record<string, string | string[]> = browser
        ? JSON.parse(Cookie.get("previousQuery") ?? "{}")
        : {}

    const questionRes = await fetch(`/api/question/${params.id}?includeAuthor=true`)
    const question = await questionRes.json()
    const packetRes = await fetch("/api/packet")
    const sets = await packetRes.json()
    return {
    query: {
        ...previousQuery,
        ...paramQuery,
    },
    question,
    sets,
}
}
