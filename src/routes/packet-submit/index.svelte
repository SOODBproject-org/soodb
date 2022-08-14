<script context="module" lang="ts">
    import type { Load } from "@sveltejs/kit"

    export const load: Load = async function ({ url }) {
        if (browser) {
            history.replaceState(null, "", "/write")
        }

        return {
            props: {
                submitted: url.searchParams.get("submitted"),
            },
        }
    }
</script>

<script lang="ts">
    import { browser } from "$app/env"
    import { onMount } from "svelte"
    import PreviewQuestion from "$lib/components/PreviewQuestion.svelte"
    import type { Category, NewQuestionData } from "$lib/mongo"
    import Notification from "$lib/components/Notification.svelte"

    let plainText: string
    let settingsVisible = false
    let editableRegex: string
    let source: string
    export let submitted: string

    const parameters = {
        tossUp: "TOSSUP",
        bonus: "BONUS",
        categories: ["BIOLOGY", "CHEMISTRY", "EARTH AND SPACE", "PHYSICS", "MATH", "ENERGY"],
        shortAnswer: "Short Answer",
        multipleChoice: "Multiple Choice",
        ignoreCase: true,
    }
    let notificationShown = true

    if (submitted) {
        onMount(() => {
            setTimeout(() => {
                notificationShown = false
            }, 5000)
        })
    }

    function setCatNames(categories: string[]) {
        const DBcat: Category[] = ["bio", "chem", "earth", "physics", "math", "energy"]
        const tempObj: Record<string, Category> = {}
        for (let i = 0; i < 6; i++) {
            categories[i].split("|").forEach((term) => {
                tempObj[term.toLowerCase()] = DBcat[i]
            })
        }
        return tempObj
    }

    function manualRegex() {
        const res = editableRegex.match(/\/((\n|.)+?)\/(.{0,6})/)
        regexPattern = res ? new RegExp(res[1], res[3]) : /^\b$/
    }

    function calcRegexPattern() {
        console.log("calc")
        let catString = ""
        parameters.categories.forEach((cat) => {
            catString += cat + "|"
        })
        catString = catString.slice(0, -1)
        editableRegex = `/(${parameters.tossUp}|${parameters.bonus}).??\n?.+?(${catString})\n?.+?(${parameters.shortAnswer}|${parameters.multipleChoice}):?((.|\n)+?)ANSWER:?(.+)/gi`
        const regex = new RegExp(
            `(${parameters.tossUp}|${parameters.bonus}).??\n?.+?(${catString})\n?.+?(${parameters.shortAnswer}|${parameters.multipleChoice}):?((.|\n)+?)ANSWER:?(.+)`,
            "gi"
        )
        return regex
        //(Tossup|TOSS UP|TOSS-UP|BONUS).+?\n?.+?(BIOLOGY|CHEMISTRY|EARTH AND SPACE|MATH|PHYSICS|GENERAL SCIENCE|ASTRONOMY|EARTH SCIENCE|COMPUTER SCIENCE)\n?.+?(Short Answer|Multiple Choice):?((.|\n)+?)ANSWER:?(.+)
    }

    function generatePreviews(text: string, pattern: RegExp, source: string) {
        const result: NewQuestionData[] = []
        if (text) {
            const results = [...text.matchAll(pattern)]

            results.forEach((question) => {
                const category = categoryNames[question[2].toLowerCase()]
                    ? categoryNames[question[2].toLowerCase()]
                    : (question[2] as Category)
                const bonus = question[1].toLowerCase().includes("bonus")
                if (question[3].toLowerCase() === "multiple choice") {
                    const splitQuestion = [...(question[4].match(/(.+?)W\)(.+?)X\)(.+?)Y\)(.+?)Z\)(.+)/is) ?? [])]
                    const answerChoice = [...(question[6].match(/(W|X|Y|Z).??/i) ?? [])]
                    const thisQ: NewQuestionData = {
                        type: "MCQ",
                        category,
                        source,
                        bonus,
                        questionText: splitQuestion[1],
                        choices: {
                            W: splitQuestion[2],
                            X: splitQuestion[3],
                            Y: splitQuestion[4],
                            Z: splitQuestion[5],
                        },
                        correctAnswer: answerChoice[1].toUpperCase() as "W" | "X" | "Y" | "Z"
                    }
                    result.push(thisQ)
                } else {
                    const thisQ: NewQuestionData = {
                        type: "SA",
                        category,
                        source,
                        bonus,
                        questionText: question[4],
                        correctAnswer: question[6]
                    }
                    result.push(thisQ)
                }
            })
        }
        return result
    }

    $: categoryNames = setCatNames(parameters.categories)
    let regexPattern = calcRegexPattern()
    $: questions = generatePreviews(plainText, regexPattern, source)
</script>

<svelte:head>
    <title>Write a Question</title>
</svelte:head>

<main>
    {#if submitted === "success"}
        <Notification title="Success" text="Your question has been successfully submitted" shown={notificationShown} />
    {:else if submitted === "error"}
        <Notification
            title="Error"
            text="An error occurred and your question was not submitted"
            shown={notificationShown}
        />
    {/if}    
    <div class="data-entry">
        <form id="form" action="/write" method="POST" autocomplete="off" on:input={calcRegexPattern}>
            <h1>Packet Submission</h1>
            <input
                type="text"
                bind:value={source}
                placeholder="Packet Source ex:Official-Set2-Round3"
                style="width:32ch;max-width:90%"
            />
            <textarea
                name="plainText"
                placeholder="Paste in your packet here. Ctrl + A, Ctrl+C, Ctrl+V should work."
                id="question-input"
                bind:value={plainText}
                style:min-height="10em"
            />
            <button type="button" class="settings-button" on:click={() => (settingsVisible = !settingsVisible)}>
                {settingsVisible ? "Hide" : "Show"} parsing settings
            </button>
            <div id="advancedSettings" class:visible={settingsVisible}>
                <input type="text" bind:value={parameters.tossUp} />
                <input type="text" bind:value={parameters.bonus} /><br />
                <input type="text" bind:value={parameters.shortAnswer} />
                <input type="text" bind:value={parameters.multipleChoice} /><br />
                <div id="categoryContainer">
                    <p>Biology:</p>
                    <p>Chemistry:</p>
                    <p>Earth and Space:</p>
                    <p>Physics:</p>
                    <p>Math:</p>
                    <p>Energy:</p>
                    <p style:align-self="start">Other:</p>

                    <input type="text" bind:value={parameters.categories[0]} />
                    <input type="text" bind:value={parameters.categories[1]} />
                    <input type="text" bind:value={parameters.categories[2]} />
                    <input type="text" bind:value={parameters.categories[3]} />
                    <input type="text" bind:value={parameters.categories[4]} />
                    <input type="text" bind:value={parameters.categories[5]} />
                    <div>
                        {#each Array(parameters.categories.length - 6) as _, i}
                            <div class="removableCat">
                                <input type="text" bind:value={parameters.categories[i + 6]} style:width="12ch" />
                                <button
                                    type="button"
                                    class="minus"
                                    on:click={() => {
                                        parameters.categories.splice(i + 6, 1)
                                        parameters.categories = parameters.categories
                                        calcRegexPattern()
                                    }}
                                    style=""
                                >
                                    -
                                </button>
                            </div>
                        {/each}
                        <button
                            class="plus"
                            type="button"
                            on:click={() => {
                                parameters.categories.push("")
                                parameters.categories = parameters.categories
                            }}
                        >
                            +
                        </button>
                    </div>
                    <input type="hidden" name="questions" value={JSON.stringify(questions)} />
                </div>
                <p>Raw Regex:</p>
                <textarea bind:value={editableRegex} on:input|stopPropagation={manualRegex} />
            </div>
            <button type="submit" class="submit-button">Submit Questions</button>
        </form>
    </div>
    <div id="questions-preview">
        <h1>Question Previews</h1>
        <p>
            We've detected {questions.length} questions. If you are missing any, try changing the regex filter.
        </p>
        <div id="questions">
            {#each questions as question}
                <PreviewQuestion bind:question />
            {/each}
        </div>
    </div>
</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: minmax(0, 1fr);
        align-items: stretch;
        max-height: 100%;
        box-sizing: border-box;
        padding: 2em;
        gap: 2em;
    }

    .data-entry {
        @include vertical-scrollable();
        border-radius: 1em;
        border: 1px solid #666;
        // width: min(calc(50% - 3em), 34em);
        // position: absolute;
        min-height: 0;
        box-sizing: border-box;
    }

    form {
        text-align: center;
        padding: 0.5em;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #advancedSettings {
        display: none;
        &.visible {
            display: block;
        }
        p {
            margin: 0.8em;
            font-size: 24px;
        }
    }

    .settings-button {
        @extend %button-secondary;

        font-size: 20px;
    }

    #questions-preview {
        border-radius: 1em;
        border: 1px solid #666;
        text-align: center;
        padding: 0.5em;
        // right: 0em;
        // position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;

        min-height: 0;
        box-sizing: border-box;
        // width: max(calc(50% - 3em), calc(100% - 40em));
    }
    #questions {
        @include vertical-scrollable();

        text-align: left;
    }

    .removableCat {
        display: flex;
        flex-direction: row;
    }
    #categoryContainer {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: repeat(7, auto);
        grid-auto-flow: column;
        align-items: center;

        p {
            margin: 0.85em;
            font-size: 18px;
        }
    }

    .plus {
        @extend %button-secondary;
        padding-top:.3em;
        width: 6ch;
    }

    .minus {
        @extend %button-secondary;

        width: 3ch;
        font-size: 18px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        margin-left: 0;
        padding-top:.2em;
        box-sizing: border-box;
        height: 1.9em;
    }

    h1 {
        font-size: 32px;
        text-decoration: underline $accent-2 3px;
        text-underline-offset: 0.2em;
    }

    input[type="text"] {
        @extend %text-input;

        font-size: 18px;
        width: 15ch;
        max-width: 80vw;
        text-align: center;
    }

    textarea {
        @extend %textarea;

        font-size: 18px;
        width: 90%;
        resize: vertical;
        min-height: 1.8em;
        height: 1.8em;
        position: relative;
        vertical-align: middle;

        &:focus::placeholder {
            color: transparent;
        }
    }

    .submit-button {
        @extend %button-primary;

        font-size: 24px;
        margin-top: 1em;
    }
</style>
