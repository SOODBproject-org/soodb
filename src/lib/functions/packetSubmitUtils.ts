import type { NewQuestionData } from "$lib/server/mongo"
import { removeUndefined } from "$lib/utils"

export type NewPacketQuestionData = NewQuestionData & { number?: number }

export function setKeywords(input: Record<string, string>) {
    const tempObj: Record<string, string> = {}
    for (const [k, v] of Object.entries(input)) {
        for (const term of v.split("|")) {
            tempObj[term.toLowerCase()] = k
        }
    }
    return tempObj
}

export type PacketCategories = {
    bio: string,
    chem: string,
    earth: string,
    physics: string,
    math: string,
    energy: string,
    custom: string[]
}

export function setCatNames(categories: PacketCategories) {
    // Record<lowercase format, [DB category, original format]>
    const result: Record<string, [string, string]> = {}
    for (const [k, v] of Object.entries(categories)) {
        if (Array.isArray(v)) {
            for (const cat of v) {
                for (const term of cat.split('|')) {
                    result[term.toLowerCase()] = [k, term]
                }
            }
        } else {
            for (const term of v.split("|")) {
                result[term.toLowerCase()] = [k, term]
            }
        }
    }
    return result
}

export function generatePreviews(
    text: string,
    pattern: RegExp,
    keywords: Record<string, string>,
    categoryNames: Record<string, [string, string]>
) {
    const result: NewPacketQuestionData[] = []
    let previousData: NewPacketQuestionData | null = null
    let questionNumber = 0
    if (text) {
        try {
            const results = [...text.matchAll(pattern)]
            console.dir(results)
            for (const question of results) {
                const category = categoryNames[question[2].toLowerCase()]?.[0]
                    ?? "Custom Category"
                const bonus = keywords[question[1].toLowerCase()] === "bonus"

                const baseData = {
                    category,
                    customCategory: category === "custom"
                        ? categoryNames[question[2].toLowerCase()][1]
                            ?? "Custom Category"
                        : undefined,
                    bonus,
                    number: !previousData || previousData.bonus || !bonus ? ++questionNumber : questionNumber,
                }

                if (keywords[question[3].toLowerCase()] === "multipleChoice") {
                    const splitQuestion = [...(question[4].match(/(.+?)W\)(.+?)X\)(.+?)Y\)(.+?)Z\)(.+)/s) ?? [])]
                    const answerChoice = [...(question[5].match(/(W|X|Y|Z).??/i) ?? [])]
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
                        correctAnswer: question[5],
                    }) as NewQuestionData

                    previousData = thisQ
                    result.push(thisQ)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    return result
}
