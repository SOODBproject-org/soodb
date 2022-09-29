import z from "zod"
import { questionSchema } from "./question"

// TODO: name regexes

export const packetDataSchema = z.discriminatedUnion("chooseSet", [
    z.object({
        chooseSet: z.literal("new"),
        newSetName: z.string(),
        created: z.date(),
        name: z.string(),
        questions: z.array(questionSchema),
    }),
    z.object({
        chooseSet: z.literal("existing"),
        setId: z.string(),
        created: z.date(),
        name: z.string(),
        questions: z.array(questionSchema),
    }),
    z.object({
        chooseSet: z.literal("none"),
        created: z.date(),
        name: z.string(),
        questions: z.array(questionSchema),
    }),
])
