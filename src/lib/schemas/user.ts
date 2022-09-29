import z from "zod"

// TODO: better username regex

export const userSettingsSchema = z
    .object({
        username: z.string().regex(/[\S]{6,30}/),
    })
    .partial()

export const newUserSchema = z.object({
    username: z.string().regex(/[\S]{6,30}/),
    password: z.string(),
    confirmPassword: z.string(),
})
