import type { DatabaseUserSafe } from '$lib/server/mongo';
import type { Question } from '$lib/types';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from "./$types"
import { getUser } from "@lucia-auth/sveltekit/load";

export const load: PageLoad = async function (event) {
    const { fetch } = event
    const user = await getUser(event);

    if (!user) {
        throw redirect(302, "/login");
    }
    console.log("load username", user.username)

    const userRes = await fetch(`/api/user`, {
        credentials: 'include',
    })
    const userSettingsRes = await fetch(`/api/user/settings`, {
        credentials: 'include',
    })
    const questionsRes = await fetch(`/api/question?authorId=${user.id}`)
    const userData = (await userRes.json()) as DatabaseUserSafe
    const questions = (await questionsRes.json()) as Question[]
    return {
        userData,
        userSettings: await userSettingsRes.json(),
        questions: questions.map((x) => ({ ...x, authorName: userData.username })),
    }
}
