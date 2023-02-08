import { packetDataSchema } from "$lib/schemas/packet";
import { addPacket, type NewQuestionData } from "$lib/server/mongo";
import { invalid, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const { user } = await locals.getSessionUser()
        if (!user) {
            return invalid(401, { message: "Unauthorized" })
        }
        if (!user.packetSubmitter) {
            return invalid(403, { message: "You are not allowed to submit packets" })
        }

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
        console.log(parseResult)
        if (parseResult.success) {
            const { questions: parsedQuestions, ...parsedData } = parseResult.data

            await addPacket(parsedQuestions, parsedData)
            return { success: true }
        } else {
            console.log(parseResult.error)
            return invalid(400, { message: "Malformed request" })
        }
    }
}