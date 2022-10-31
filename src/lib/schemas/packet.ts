import z from "zod"
import { questionSchema } from "./question"

const nameRegex = /[a-zA-Z0-9:_\-&!#$^=+()[\]|]{6,60}/

export const packetDataSchema = z.discriminatedUnion("chooseSet", [
    z.object({
        chooseSet: z.literal("new"),
        newSetName: z.string().regex(nameRegex),
        created: z.date(),
        name: z.string().regex(nameRegex),
        questions: z.array(questionSchema),
    }),
    z.object({
        chooseSet: z.literal("existing"),
        setId: z.string(),
        created: z.date(),
        name: z.string().regex(nameRegex),
        questions: z.array(questionSchema),
    }),
    z.object({
        chooseSet: z.literal("none"),
        created: z.date(),
        name: z.string().regex(nameRegex),
        questions: z.array(questionSchema),
    }),
])
