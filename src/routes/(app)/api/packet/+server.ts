import { json } from '@sveltejs/kit';
import { addPacket, getPackets, type NewQuestionData } from "$lib/server/mongo"
import type { RequestHandler } from "./$types"
import { error } from "$lib/functions/response"
import { packetDataSchema } from "$lib/schemas/packet"

export const GET: RequestHandler = async function () {
    const result = await getPackets()
    return json(result)
}

export const POST: RequestHandler = async function ({ request, locals }) {
    const { user } = await locals.getSessionUser()
    if (!user) {
        return error(401, "Invalid token")
    }
    if (!user.packetSubmitter) {
        return error(403, "You are not allowed to submit packets")
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

    if (parseResult.success) {
        const { questions: parsedQuestions, ...parsedData } = parseResult.data

        const { id } = await addPacket(parsedQuestions, parsedData)
        return new Response(undefined, {
            status: 201,
            headers: {
                Location: `/api/packet/${id}`,
            }
        })
    } else {
        console.log(parseResult.error)
        return error(400, "Invalid packet data")
    }
}
