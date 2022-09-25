import { addPacket, getPackets, type NewQuestionData } from "$lib/mongo"
import type { PacketSet } from "$lib/types"
import type { RequestHandler } from "./__types/index.d"
import { error, type MaybeError } from "$lib/functions/response"
import { packetDataSchema } from "$lib/schemas/packet"
import { auth } from "$lib/lucia"

export const GET: RequestHandler<MaybeError<PacketSet[]>> = async function () {
    const result = await getPackets()
    return {
        status: 200,
        body: result,
    }
}

export const POST: RequestHandler = async function({ request }) {
    try {
        const user = await auth.validateRequest(request)
        if (!user) return error(401, "Invalid token")
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
            setId
        })

        if (parseResult.success) {
            const {
                questions: parsedQuestions,
                ...parsedData
            } = parseResult.data

            const { id } = await addPacket(parsedQuestions, parsedData)
            return {
                status: 201,
                headers: {
                    Location: `/api/packet/${id}`
                }
            }
        } else {
            console.log(parseResult.error)
            return error(400, "Invalid packet data")
        }
    } catch (e) {
        console.error(e)
        return error(500, "Internal error")
    }
}
