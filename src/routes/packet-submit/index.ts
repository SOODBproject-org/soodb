import { redirect } from "$lib/functions/response"
import { addPacket,  type NewQuestionData } from "$lib/mongo"
import type { RequestHandler } from "./__types/index.d"

// TODO: split form and REST endpoints

export const POST: RequestHandler = async function ({ request }) {
    try {
        const formData = await request.formData()

        const datestring = formData.get("created") as string
        const created = new Date(datestring)
        const name = formData.get('packet-name') as string
        const chooseSet = formData.get('choose-set') as string
        const questions: NewQuestionData[] = JSON.parse(formData.get("questions") as string)

        if (chooseSet === "new") {
            const newSetName = formData.get('new-set-name') as string
            await addPacket(questions, {
                created,
                name,
                setName: newSetName
            })
        } else if (chooseSet === "existing") {
            const setId = formData.get('set-id') as string
            await addPacket(questions, {
                created,
                name,
                setId
            })
        } else if (chooseSet === "none") {
            await addPacket(questions, {
                created,
                name
            })
        } else {
            return redirect("packet-submit?submitted=error")
        }

        return redirect("packet-submit?submitted=success")
    } catch (e) {
        console.error(e)
        return redirect("packet-submit?submitted=error")
    }
}
