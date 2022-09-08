import { redirect } from "$lib/functions/response"
import { addPacket,  type NewQuestionData } from "$lib/mongo"
import type { RequestHandler } from "./__types/index.d"

export const POST: RequestHandler = async function ({ request }) {
    try {
        const formData = await request.formData()
        const datestring = formData.get("created") as string
        const created = new Date(datestring)
        console.log(datestring)
        const questions: NewQuestionData[] = JSON.parse(formData.get("questions") as string)
        await addPacket(questions,created)
        return redirect("packet-submit?submitted=success")
    } catch (e) {
        console.error(e)
        return redirect("packet-submit?submitted=error")
    }
}
