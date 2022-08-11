import { redirectTo } from "$lib/functions/redirectTo"
import { getRandomQuestion } from "$lib/mongo"

export async function get() {
    const question = await getRandomQuestion()
    if (question) {
        return redirectTo("/question/" + question.id)
    } else {
        return {
            status: 400,
        }
    }
}
