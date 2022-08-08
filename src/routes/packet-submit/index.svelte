<script lang="ts">
    import PreviewQuestion from "$lib/components/PreviewQuestion.svelte"
    import type { McqBase, SaBase } from "$lib/mongo"

    let plainText: string
    let settingsVisible = false
    let editableRegex: string
    let source: string
    const parameters = {
        tossUp: "TOSSUP",
        bonus: "BONUS",
        categories: ["biology", "chemistry", "earth and space", "physics", "math", "energy"],
        shortAnswer: "Short Answer",
        multipleChoice: "Multiple Choice",
        ignoreCase: true,
    }

    function setCatNames(categories) {
        const DBcat = ["bio", "chem", "earth", "math", "physics", "energy"]
        const tempObj = {}
        for (let i = 0; i < 6; i++) {
            categories[i].split("|").forEach((term) => {
                tempObj[term.toLowerCase()] = DBcat[i]
            })
        }
        console.dir(tempObj)
        return tempObj
    }

    function manualRegex() {
        const res = editableRegex.match(/\/((\n|.)+?)\/(.{0,6})/)
        regexPattern = new RegExp(res[1], res[3])
    }

    function calcRegexPattern() {
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

    function doRegex(text, pattern) {
        const result: (McqBase | SaBase)[] = []
        if (text) {
            const results = [...text.matchAll(pattern)]

            results.forEach((question) => {
                const category = categoryNames[question[2].toLowerCase()]
                    ? categoryNames[question[2].toLowerCase()]
                    : question[2]
                const isBonus = question[1].toLowerCase().contains("bonus")
                if (question[3].toLowerCase() === "multiple choice") {
                    const splitQuestion = [...question[4].match(/(.+?)W\)(.+?)X\)(.+?)Y\)(.+?)Z\)(.+)/is)]
                    const answerChoice = [...question[6].match(/(W|X|Y|Z).??/i)]
                    const thisQ: McqBase = {
                        type: "MCQ",
                        category,
                        source,
                        isBonus,
                        questionText: splitQuestion[1],
                        choices: {
                            W: splitQuestion[2],
                            X: splitQuestion[3],
                            Y: splitQuestion[4],
                            Z: splitQuestion[5],
                        },
                        correctAnswer: answerChoice[1].toUpperCase() as "W" | "X" | "Y" | "Z",
                    }
                    result.push(thisQ)
                } else {
                    const thisQ: SaBase = {
                        type: "SA",
                        category,
                        source,
                        isBonus,
                        questionText: question[4],
                        correctAnswer: question[6],
                    }
                    result.push(thisQ)
                }
            })
        }
        return result
    }

    $: categoryNames = setCatNames(parameters.categories)
    let regexPattern = calcRegexPattern()
    $: questions = doRegex(plainText, regexPattern)
</script>

<svelte:head>
    <title>Write a Question</title>
</svelte:head>

<main>
    <form id="form" action="/write" method="POST" autocomplete="off">
        <h1>Whole Packet Submission</h1>
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
            style="height: 40em; min-height: 10em;"
        />
        <div
            id="settingMenu"
            on:click={() => {
                settingsVisible = !settingsVisible
            }}
        >
            <h2>{settingsVisible ? "Hide" : "Show"} parsing settings</h2>
        </div>
        <div id="advancedSettings" class:visible={settingsVisible}>
            <input type="text" bind:value={parameters.tossUp} on:input={calcRegexPattern} />
            <input type="text" bind:value={parameters.bonus} on:input={calcRegexPattern} /><br />
            <input type="text" bind:value={parameters.shortAnswer} on:input={calcRegexPattern} />
            <input type="text" bind:value={parameters.multipleChoice} on:input={calcRegexPattern} /><br />
            <div id="categoryContainer">
                <div id="labels" class="v-box">
                    <p>Biology:</p>
                    <p>Chemistry:</p>
                    <p>Earth and Space:</p>
                    <p>Physics:</p>
                    <p>Math:</p>
                    <p>Energy:</p>
                    <p>Other:</p>
                </div>
                <div id="categoryInputs" class="v-box">
                    <input type="text" bind:value={parameters.categories[0]} on:input={calcRegexPattern} />
                    <input type="text" bind:value={parameters.categories[1]} on:input={calcRegexPattern} />
                    <input type="text" bind:value={parameters.categories[2]} on:input={calcRegexPattern} />
                    <input type="text" bind:value={parameters.categories[3]} on:input={calcRegexPattern} />
                    <input type="text" bind:value={parameters.categories[4]} on:input={calcRegexPattern} />
                    <input type="text" bind:value={parameters.categories[5]} on:input={calcRegexPattern} />
                    {#each Array(parameters.categories.length - 6) as _, i}
                        <div class="removableCat">
                            <input
                                type="text"
                                bind:value={parameters.categories[i + 6]}
                                on:input={calcRegexPattern}
                                style="width:12.5ch;border-radius: .3em 0em 0em .3em;margin-right:0;border-right:solid 3px #AAA;"
                            />
                            <p
                                id="plus"
                                on:click={() => {
                                    parameters.categories.splice(i + 6, 1)
                                    parameters.categories = parameters.categories
                                    calcRegexPattern()
                                }}
                                style="background-color: #FFF;border-radius:0em .3em .3em 0em;padding:.2em 1ch;margin:.5em 0em;"
                            >
                                -
                            </p>
                        </div>
                    {/each}
                    <p
                        id="plus"
                        on:click={() => {
                            parameters.categories.push("")
                            parameters.categories = parameters.categories
                        }}
                    >
                        +
                    </p>
                </div>
            </div>
            <p>Raw Regex:</p>
            <textarea bind:value={editableRegex} on:input={manualRegex} style="height: 8em;" />
        </div>
        <button type="submit">Submit Questions</button>
    </form>
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
    form {
        margin: 2em 1em;
        border-radius: 1em;
        text-align: center;
        padding: 0.5em;
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: var(--color-6);
        overflow-y: scroll;
        max-height: calc(100% - 10em);
        width: min(calc(50% - 3em), 34em);
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
    #questions-preview {
        margin: 2em 1em;
        border-radius: 1em;
        text-align: center;
        padding: 0.5em;
        right: 0em;
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: var(--color-6);

        max-height: calc(100% - 10em);
        width: max(calc(50% - 3em), calc(100% - 40em));
    }
    #questions {
        padding: 0em 0em;
        text-align: left;
        overflow-y: scroll;
        max-height: calc(100% - 30em);
    }

    .removableCat {
        display: flex;
        flex-direction: row;
    }
    #categoryContainer {
        display: flex;
        flex-direction: row;
        p {
            margin: 0.8em;
            font-size: 24px;
        }
    }
    .v-box {
        display: flex;
        flex-direction: column;
        align-items: right;
        text-align: right;
    }
    h1 {
        font-size: 44px;
        text-decoration: underline var(--blue) 3px;
        text-underline-offset: 0.2em;
    }

    input[type="text"] {
        padding: 0.3em;
        font-size: 24px;
        margin: 0.5em auto;
        border: none;
        border-radius: 0.3em;
        box-sizing: border-box;
        width: 15ch;
        max-width: 80vw;
        text-align: center;
        font-family: "Ubuntu";
        position: relative;
        &:focus::placeholder {
            color: transparent;
        }
    }

    textarea {
        padding: 0.3em;
        font-size: 20px;
        margin: 0.5em auto;
        border: none;
        border-radius: 0.3em;
        box-sizing: border-box;
        width: 40ch;
        max-width: calc(45vw - 3em);
        resize: horizontal vertical;
        min-height: 1.8em;
        height: 1.8em;
        font-family: "Ubuntu";
        position: relative;
        vertical-align: middle;

        &:focus::placeholder {
            color: transparent;
        }
    }

    button {
        padding: 0.5em;
        color: #eee;
        background: var(--color-2);
        border-radius: 0.3em;
        font-weight: bold;
        border: solid black 3px;
        font-size: 30px;
        cursor: pointer;
        margin-top: 1em;

        &:disabled {
            padding: calc(0.5em - 3px);
            border: solid var(--color-2) 3px;
            background: transparent;
            color: #444;
            cursor: default;
        }
    }
</style>
