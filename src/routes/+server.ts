import { redirect } from "$lib/functions/response"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async function () {
    return redirect("question-search")
}
