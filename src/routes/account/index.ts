import { auth } from '$lib/lucia'
import type { RequestHandler } from '@sveltejs/kit'
import { redirect } from '$lib/functions/response'
import { getUserByUsernameSafe, updateUser } from '$lib/mongo'

export const POST: RequestHandler = async function({ request }) {
    const formData = await request.formData()
    const username = formData.get('username') as string

    if (!/[\S]{6,30}/.test(username)) {
        return redirect('/account')
    }

    try {
        const user = await auth.validateRequest(request)

        const existingUser = await getUserByUsernameSafe(username)

        if (existingUser && existingUser.id !== user.user_id) {
            return redirect('/account')
        }

        await updateUser(user.user_id, { username: username })
        return redirect('/account')
    } catch (e) {
        return redirect('/account')
    }
}