import { redirectTo } from "$lib/functions/redirectTo"
import { addQuestion, type Category, type NewQuestionData } from "$lib/mongo"
import type { RequestHandler } from "./__types/index.d"

export const POST: RequestHandler = async function ({ request, locals }) {
    try {
        const formData = await request.formData()
        const type = formData.get("type") as "MCQ" | "SA"
        const category = formData.get("category") as Category
        const questionText = formData.get("question-text")
        const bonus = formData.get("bonus") === "checked"

        const choices = {
            W: formData.get("W") as string,
            X: formData.get("X") as string,
            Y: formData.get("Y") as string,
            Z: formData.get("Z") as string,
        }
        const correctAnswer = formData.get("correct-answer") as "W" | "X" | "Y" | "Z"
        const answer = formData.get("answer")

        let question: NewQuestionData
        if (type === "MCQ") {
            question = {
                authorId: locals.userData?.id,
                bonus,
                type,
                category,
                questionText: questionText as string,
                choices,
                correctAnswer,
            }
        } else if (type === "SA") {
            question = {
                authorId: locals.userData?.id,
                bonus,
                type,
                category,
                questionText: questionText as string,
                correctAnswer: answer as string,
            }
        } else {
            return redirectTo("/error/invalid-question")
        }

        await addQuestion(question)

        return redirectTo("question-submitted")
    } catch (e) {
        console.error(e)
        return redirectTo("error/invalid-question")
    }
}
