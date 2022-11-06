import type { PageLoad } from "./$types"
import Cookie from "js-cookie"
import { splitIntoPages } from "$lib/functions/queryUtils"
import { browser } from "$app/environment"
import type { Question } from "$lib/types"

export const load: PageLoad = async function ({ fetch, url }) {
    const paramQueryEntries = [...url.searchParams.entries()]
        .filter(([key,]) =>
            ["authorId", "keywords", "set", "packet", "start", "end", "types", "categories"].includes(key)
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
    const params = new URLSearchParams({
        ...previousQuery,
        ...paramQuery,
        includeAuthor: "true",
        // check cookie on SSR request
        checkCookies: "true",
    })
    const questionsRes = await fetch("/api/question?" + params.toString(), {
        credentials: "include",
    })
    const questions = (questionsRes.ok ? await questionsRes.json() : []) as Question[]
    return {
        query: {
            ...previousQuery,
            ...paramQuery,
        },
        questionPages: splitIntoPages(questions),
    }
}
