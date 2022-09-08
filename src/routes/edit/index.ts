import { redirect } from "$lib/functions/response"
import type { RequestHandler } from "./__types/index.d"

export const GET: RequestHandler = async function () {
    return redirect("/account")
}
