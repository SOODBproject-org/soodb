import type { McqQuestion, SaQuestion } from "$lib/mongo"

type Searchable = {
    [K in keyof SaQuestion | keyof McqQuestion]?:
        | (K extends keyof SaQuestion ? SaQuestion[K] : never)
        | (K extends keyof McqQuestion ? McqQuestion[K] : never)
}

export function createSearchString(question: Searchable) {
    return [question.questionText, question.correctAnswer, ...Object.values(question.choices ?? {})]
        .filter((x) => !!x)
        .join(" ")
}
