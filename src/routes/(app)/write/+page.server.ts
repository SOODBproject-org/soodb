import { addQuestion, type NewQuestionData } from "$lib/server/mongo"
import { questionSchema } from "$lib/schemas/question"
import type { Category } from "$lib/types"
import { invalid, type Actions } from "@sveltejs/kit"

export const actions: Actions = {
    default: async ({ request, locals }) => {
        const formData = await request.formData()
        const type = formData.get("type") as "MCQ" | "SA"
        const category = formData.get("category") as Category
        const questionText = formData.get("question-text") as string
        const bonus = formData.get("bonus") === "checked"
        console.log(formData)

        const choices = {
            W: formData.get("W") as string,
            X: formData.get("X") as string,
            Y: formData.get("Y") as string,
            Z: formData.get("Z") as string,
        }
        const correctAnswer = formData.get("correct-answer") as "W" | "X" | "Y" | "Z"
        const answer = formData.get("answer") as string

        const anonymous = formData.get("anonymous") === "true"

        let authorId: string | undefined = undefined
        if (!anonymous) {
            const { user } = await locals.getSessionUser()
            if (!user) return invalid(401, { message: "Unauthorized" })

            authorId = user.id
        }

        let question: NewQuestionData
        if (type === "MCQ") {
            question = {
                authorId,
                bonus,
                type,
                category,
                questionText,
                choices,
                correctAnswer,
            }
        } else if (type === "SA") {
            question = {
                authorId,
                bonus,
                type,
                category,
                questionText,
                correctAnswer: answer,
            }
        } else {
            console.log('malformed')
            return invalid(400, { message: "Malformed request" })
        }

        const parseResult = questionSchema.safeParse(question)

        if (!parseResult.success) {
            console.log(parseResult)
            return invalid(400, { message: "Malformed request" })
        }

        await addQuestion(parseResult.data)

        return { success: true }
    }
}