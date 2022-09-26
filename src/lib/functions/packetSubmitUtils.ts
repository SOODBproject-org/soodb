import type { NewQuestionData } from "$lib/mongo"
import type { Category } from "$lib/types"
import { removeUndefined } from "$lib/utils"

const defaultCategories = ["earth", "bio", "chem", "physics", "math", "energy"] as const

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
    const DBcat: Category[] = ["bio", "chem", "earth", "physics", "math", "energy"]
    const tempObj: Record<string, Category> = {}
    for (let i = 0; i < 6; i++) {
        categories[i].split("|").forEach((term) => {
            tempObj[term.toLowerCase()] = DBcat[i]
        })
    }
    return tempObj
}

export function generatePreviews(text: string, pattern: RegExp, keywords: Record<string, string>, categoryNames: Record<string, string>) {
    const result: NewQuestionData[] = []
    if (text) {
        try {
            const results = [...text.matchAll(pattern)]
            console.dir(results)
            let i = 0
            results.forEach((question) => {
                i++
                const category = categoryNames[question[2].toLowerCase()]
                    ? categoryNames[question[2].toLowerCase()]
                    : (question[2] as Category)
                const bonus = keywords[question[1].toLowerCase()] === "bonus"
                if (keywords[question[3].toLowerCase()] === "multipleChoice") {
                    const splitQuestion = [...(question[4].match(/(.+?)W\)(.+?)X\)(.+?)Y\)(.+?)Z\)(.+)/is) ?? [])]
                    const answerChoice = [...(question[6].match(/(W|X|Y|Z).??/i) ?? [])]
                    console.dir(answerChoice)
                    const thisQ = removeUndefined({
                        type: "MCQ",
                        category: defaultCategories.includes(category as Category)
                            ? category as Category
                            : "custom",
                        customCategory: defaultCategories.includes(category as Category)
                            ? undefined
                            : category,
                        bonus,
                        questionText: splitQuestion[1],
                        choices: {
                            W: splitQuestion[2],
                            X: splitQuestion[3],
                            Y: splitQuestion[4],
                            Z: splitQuestion[5],
                        },
                        correctAnswer: answerChoice[1].toUpperCase() as "W" | "X" | "Y" | "Z",
                    }) as NewQuestionData
                    result.push(thisQ)
                } else {
                    const thisQ = removeUndefined({
                        type: "SA",
                        category: defaultCategories.includes(category as Category)
                            ? category as Category
                            : "custom",
                        customCategory: defaultCategories.includes(category as Category)
                            ? undefined
                            : category,
                        bonus,
                        questionText: question[4],
                        correctAnswer: question[6],
                    }) as NewQuestionData
                    result.push(thisQ)
                }
            })
            console.log(i)
        } catch (e) {
            console.log(e)
        }
    }

    return result
}