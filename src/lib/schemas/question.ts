import z from 'zod'

const questionBase = z.object({
    authorId: z.string().optional(),
    bonus: z.boolean(),
    questionText: z.string(),
    category: z.enum(["earth", "bio", "chem", "physics", "math", "energy", "custom"]),
    customCategory: z.string().optional(),
    visual: z.string().optional()
})

export const questionSchema = z.discriminatedUnion("type", [
    questionBase.extend({
        type: z.literal("SA"),
        correctAnswer: z.string()
    }),
    questionBase.extend({
        type: z.literal("MCQ"),
        correctAnswer: z.enum(["W", "X", "Y", "Z"]),
        choices: z.object({
            W: z.string(),
            X: z.string(),
            Y: z.string(),
            Z: z.string()
        })
    })
])