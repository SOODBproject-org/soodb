import { redirect } from '@sveltejs/kit';
import type { PageLoad } from "./$types"
import { getUser } from "@lucia-auth/sveltekit/load" 

export const load: PageLoad = async function (event) {
    const { params, fetch } = event
    const user = getUser(event)
    if (!user) {
        throw redirect(302, "/login");
    }

    const res = await fetch(`/api/question/${params.id}`)
    if (res.status === 200) {
        return {
            question: await res.json(),
        }
    } else {
        throw redirect(302, "/login");
    }
}