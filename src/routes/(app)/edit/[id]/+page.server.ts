import { editQuestion, getQuestionByID, type NewQuestionData } from "$lib/server/mongo"
import type { Category } from "$lib/types"
import type { Action } from "./$types"
import { error } from "$lib/functions/response"

export const PATCH: Action = async function ({ request, params, locals }) {
    try {
        const formData = await request.formData()
        const { id } = params
        const type = formData.get("type") as "MCQ" | "SA"
        const category = formData.get("category") as Category
        const questionText = formData.get("question-text") as string
        const choices = {
            W: formData.get("W") as string,
            X: formData.get("X") as string,
            Y: formData.get("Y") as string,
            Z: formData.get("Z") as string,
        }
        const correctAnswer = formData.get("correct-answer") as "W" | "X" | "Y" | "Z"
        const answer = formData.get("answer") as string

        const currentQuestion = await getQuestionByID(id)
        const { user } = await locals.getSessionUser()

        if (!user) return error(401, "Unauthorized")

        if (!currentQuestion || user.id !== currentQuestion.authorId) {
            return error(403, "You cannot edit this question")
        }

        let updatedInfo: Partial<NewQuestionData>
        if (type === "MCQ") {
            updatedInfo = {
                type,
                category,
                questionText,
                choices,
                correctAnswer,
            }
        } else if (type === "SA") {
            updatedInfo = {
                type,
                category,
                questionText,
                correctAnswer: answer,
            }
        } else {
            return error(400, "Invalid request")
        }

        await editQuestion(id, updatedInfo)

        return new Response(null, {
            status: 200,
        })
    } catch (e) {
        console.error(e)
        return {
            status: 500,
        }
    }
}
