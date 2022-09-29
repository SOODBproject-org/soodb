import type { NewQuestionData } from "$lib/mongo"
import type { Category } from "$lib/types"
import { removeUndefined } from "$lib/utils"

type NewPacketQuestionData = NewQuestionData & { number?: number }

const defaultCategories: Category[] = ["earth", "bio", "chem", "physics", "math", "energy"]

export function setKeywords(input: Record<string, string>) {
    const tempObj: Record<string, string> = {}
    Object.values(input).forEach((k, n) => {
        k.split("|").forEach((term) => {
            tempObj[term.toLowerCase()] = Object.keys(input)[n]
        })
    })
    return tempObj
}

export function setCatNames(categories: string[]) {
    const tempObj: Record<string, Category> = {}
    for (let i = 0; i < 6; i++) {
        categories[i].split("|").forEach((term) => {
            tempObj[term.toLowerCase()] = defaultCategories[i]
        })
    }
    return tempObj
}

export function generatePreviews(
    text: string,
    pattern: RegExp,
    keywords: Record<string, string>,
    categoryNames: Record<string, string>
) {
    const result: NewPacketQuestionData[] = []
    let previousData: NewPacketQuestionData | null = null
    let questionNumber = 0
    if (text) {
        try {
            const results = [...text.matchAll(pattern)]
            for (const question of results) {
                const category = categoryNames[question[2].toLowerCase()]
                    ? categoryNames[question[2].toLowerCase()]
                    : (question[2] as Category)
                const bonus = keywords[question[1].toLowerCase()] === "bonus"

                const baseData = {
                    category: defaultCategories.includes(category as Category) ? (category as Category) : "custom",
                    customCategory: defaultCategories.includes(category as Category) ? undefined : category,
                    bonus,
                    number: !previousData || previousData.bonus || !bonus ? ++questionNumber : questionNumber,
                }

                if (keywords[question[3].toLowerCase()] === "multipleChoice") {
                    const splitQuestion = [...(question[4].match(/(.+?)W\)(.+?)X\)(.+?)Y\)(.+?)Z\)(.+)/is) ?? [])]
                    const answerChoice = [...(question[6].match(/(W|X|Y|Z).??/i) ?? [])]
                    const thisQ = removeUndefined({
                        ...baseData,
                        type: "MCQ",
                        questionText: splitQuestion[1],
                        choices: {
                            W: splitQuestion[2],
                            X: splitQuestion[3],
                            Y: splitQuestion[4],
                            Z: splitQuestion[5],
                        },
                        correctAnswer: answerChoice[1].toUpperCase() as "W" | "X" | "Y" | "Z",
                    }) as NewQuestionData

                    previousData = thisQ
                    result.push(thisQ)
                } else {
                    const thisQ = removeUndefined({
                        ...baseData,
                        type: "SA",
                        questionText: question[4],
                        correctAnswer: question[6],
                    }) as NewQuestionData

                    result.push(thisQ)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    return result
}
