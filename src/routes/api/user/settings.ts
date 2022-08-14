import { auth } from "$lib/lucia"
import { getUserSettings, type UserSettings } from "$lib/mongo"
import type { RequestHandler } from "./__types/settings.d"

export const GET: RequestHandler<UserSettings | null> = async function ({ request }) {
    try {
        const user = await auth.validateRequest(request)
        const settings = await getUserSettings(user.user_id)
        return {
            status: 200,
            body: settings,
        }
    } catch {
        return {
            status: 401
        }
    }
}
