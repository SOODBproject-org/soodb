import z from "zod"

const usernameRegex = /[a-zA-Z0-9-_]{6,30}/

export const userSettingsSchema = z
    .object({
        username: z.string().regex(usernameRegex),
    })
    .partial()

export const newUserSchema = z.object({
    username: z.string().regex(usernameRegex),
    password: z.string(),
    confirmPassword: z.string(),
})
