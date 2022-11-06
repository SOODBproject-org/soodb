import type { Question, UserSafe } from "$lib/types"
import type { PageLoad } from "./$types"

export const load: PageLoad = async function ({ params, fetch }) {
    const userRes = await fetch(`/api/user/${params.id}`)
    const questionsRes = await fetch(`/api/question?authorId=${params.id}`)
    const userData = await userRes.json() as UserSafe
    return {
        userData,
        questions: ((await questionsRes.json()) as Question[]).map((x) => ({
            ...x,
            authorName: userData.username,
        })),
    }
}
