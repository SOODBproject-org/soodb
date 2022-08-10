import { redirectTo } from "$lib/functions/redirectTo"
import { addQuestion, getUserFromID, type McqBase, type SaBase, type Category } from "$lib/mongo"
import type { RequestHandler } from "./__types/index.d"

export const POST: RequestHandler = async function ({ request }) {
    try {
        const formData = await request.formData()
        const userId = formData.get("user-id") as string
        const ownQuestion = formData.get("own-question")
        const authorName = formData.get("author-name")
        const type = formData.get("type") as "MCQ" | "SA"
        const category = formData.get("category") as Category
        const questionText = formData.get("question-text")

        const choices = {
            W: formData.get("W") as string,
            X: formData.get("X") as string,
            Y: formData.get("Y") as string,
            Z: formData.get("Z") as string,
        }
        const correctAnswer = formData.get("correct-answer") as "W" | "X" | "Y" | "Z"
        const answer = formData.get("answer")

        let question: Partial<SaBase | McqBase>
        if (ownQuestion && userId) {
            const userData = await getUserFromID(userId)
            if (userData) {
                question = {
                    authorName: userData.username,
                    authorId: userId,
                }
            } else {
                return redirectTo("error/invalid-question")
            }
        } else {
            question = {
                authorName: authorName as string,
            }
        }

        if (type === "MCQ") {
            question = {
                ...question,
                type,
                category,
                questionText: questionText as string,
                choices,
                correctAnswer,
            }
        } else if (type === "SA") {
            question = {
                ...question,
                type,
                category,
                questionText: questionText as string,
                correctAnswer: answer as string,
            }
        }

        await addQuestion(question as SaBase | McqBase)

        return redirectTo("question-submitted")
    } catch (e) {
        console.error(e)
        return redirectTo("error/invalid-question")
    }
}
