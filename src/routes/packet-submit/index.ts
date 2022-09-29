import { redirect } from "$lib/functions/response"
import { addPacket, type NewQuestionData } from "$lib/mongo"
import { packetDataSchema } from "$lib/schemas/packet"
import type { RequestHandler } from "./__types/index.d"

export const POST: RequestHandler = async function ({ request }) {
    try {
        const formData = await request.formData()

        const datestring = formData.get("created") as string
        const created = new Date(datestring)
        const name = formData.get("packet-name") as string
        const chooseSet = formData.get("choose-set") as string
        const questions: NewQuestionData[] = JSON.parse(formData.get("questions") as string)
        const newSetName = formData.get("new-set-name") as string
        const setId = formData.get("set-id") as string

        const parseResult = packetDataSchema.safeParse({
            created,
            name,
            questions,
            chooseSet,
            newSetName,
            setId,
        })

        if (parseResult.success) {
            const { questions: parsedQuestions, ...parsedData } = parseResult.data

            await addPacket(parsedQuestions, parsedData)
            return redirect("/packet-submit?submitted=success")
        } else {
            return redirect("/packet-submit?submitted=error")
        }
    } catch (e) {
        console.error(e)
        return redirect("/packet-submit?submitted=error")
    }
}
