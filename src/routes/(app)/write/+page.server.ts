import { redirect } from "$lib/functions/response"
import { addQuestion, type NewQuestionData } from "$lib/server/mongo"
import { questionSchema } from "$lib/schemas/question"
import type { Category } from "$lib/types"
import type { Action } from "@sveltejs/kit"

export const POST: Action = async function ({ request, locals }) {
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
        const { user } = await locals.getSessionUser()
        if (!user) return redirect("/write?submitted=error")

        authorId = user.id
    }

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
        return redirect("/write?submitted=error")
    }

    const parseResult = questionSchema.safeParse(question)

    if (!parseResult.success) {
        return redirect("/write?submitted=error")
    }

    await addQuestion(parseResult.data)

    return redirect("/write?submitted=success")
}
