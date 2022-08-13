import { redirectTo } from "$lib/functions/redirectTo"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler = async function () {
    return redirectTo("write")
}
