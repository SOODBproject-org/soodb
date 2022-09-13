import { redirect } from '$lib/functions/response'
import { auth } from '$lib/lucia'
import type { Category } from '$lib/types'
import type { RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async function({ request }) {
    const formData = await request.formData()
    const type = formData.get("type") as "MCQ" | "SA"
    const category = formData.get("category") as Category
    const questionText = formData.get("question-text") as string
    const bonus = formData.get("bonus") === "checked"

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
        try {
            const user = await auth.validateRequest(request)
            authorId = user.user_id
        } catch {
            return redirect('/write?submitted=error')
        }
    }

    // TODO: better validation

    let question: NewQuestionData
    if (type === "MCQ") {
        question = {
            authorId,
            bonus,
            type,
            category,
            questionText: questionText,
            choices,
            correctAnswer,
        }
    } else if (type === "SA") {
        question = {
            authorId,
            bonus,
            type,
            category,
            questionText: questionText,
            correctAnswer: answer,
        }
    } else {
        return redirect('/write?submitted=error')
    }

    const { id } = await addQuestion(question)

    return redirect('/write?submitted=success')
}