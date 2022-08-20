import { auth } from "$lib/lucia"
import { editQuestion, getQuestionByID, type Category, type NewQuestionData } from "$lib/mongo"
import type { RequestHandler } from "./__types/[id].d"

export const PATCH: RequestHandler = async function ({ request, params }) {
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
        try {
            const user = await auth.validateRequest(request)
            if (!currentQuestion || user.user_id !== currentQuestion.authorId) {
                return {
                    status: 403
                }
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
                return {
                    status: 400,
                }
            }

            await editQuestion(id, updatedInfo)

            return {
                status: 200
            }
        } catch {
            return {
                status: 401
            }
        }
    } catch (e) {
        console.error(e)
        return {
            status: 500
        }
    }
}
