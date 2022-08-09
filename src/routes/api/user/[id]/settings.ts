import { getUserSettings, type UserSettings } from "$lib/mongo"
import type { RequestHandler } from "./__types/settings.d"

export const GET: RequestHandler<UserSettings> = async function({ params, locals }) {
    const { id } = params

    if (!locals.userData) {
        return {
            status: 401,
        }
    }

    const result = await getUserSettings(id)
    if (result) {
        return {
            status: 200,
            body: result,
        }
    } else {
        return {
            status: 404,
        }
    }
}
