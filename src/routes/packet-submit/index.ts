import { redirectTo } from "$lib/functions/redirectTo"
import { addPacket,  type NewQuestionData } from "$lib/mongo"
import type { RequestHandler } from "./__types/index.d"

export const POST: RequestHandler = async function ({ request }) {
    try {
        const formData = await request.formData()
        const datestring = formData.get("created") as string
        const created = new Date(datestring)
        console.log(datestring)
        const questions : NewQuestionData[] = JSON.parse(formData.get("questions") as string)
        await addPacket(questions,created)
        return redirectTo("packet-submit?submitted=success")
    } catch (e) {
        console.error(e)
        return redirectTo("packet-submit?submitted=error")
    }
}
