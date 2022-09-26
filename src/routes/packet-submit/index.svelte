<script context="module" lang="ts">
    import type { Load } from "@sveltejs/kit"

    export const load: Load = async function ({ url }) {
        if (browser) {
            history.replaceState(null, "", "/packet-submit")
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
    import { session } from "$app/stores"
    import { onMount } from "svelte"
    import PacketQuestionPreview from "$lib/components/PacketQuestionPreview.svelte"
    import Notification from "$lib/components/Notification.svelte"
    import HelpBox from "$lib/components/HelpBox.svelte"
    import SetSearch from "$lib/components/SetSearch.svelte"
    import { generatePreviews, setCatNames, setKeywords } from "$lib/functions/packetSubmitUtils"

    export let submitted: string

    let plainText: string
    let settingsVisible = false
    let editableRegex: string
    let chooseSet: string | undefined
    let setName: string
    let setId: string | undefined
    let packetName: string
    let created: Date | undefined

    $: submitEnabled = created && plainText && packetName && chooseSet

    type Parameters = {
        keywords: {
            tossUp: string
            bonus: string
            shortAnswer: string
            multipleChoice: string
        }
        categories: string[]
        ignoreCase: boolean
    }

    const parameters: Parameters = {
        keywords: {
            tossUp: "TOSSUP",
            bonus: "BONUS",
            shortAnswer: "Short Answer",
            multipleChoice: "Multiple Choice",
        },
        categories: [
            "BIOLOGY|Biology",
            "CHEMISTRY|Chemistry",
            "EARTH AND SPACE|Earth and Space",
            "PHYSICS|Physics",
            "MATH|Math",
            "ENERGY|Energy",
        ],
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

    function manualRegex() {
        const res = editableRegex.match(/\/((\n|.)+?)\/(.{0,6})/)
        try {
            regexPattern = res ? new RegExp(res[1], res[3]) : /^\b$/
        } catch (error) {
            console.log(error)
        }
    }

    function calcRegexPattern(params: Parameters) {
        let catString = ""
        params.categories.forEach((cat) => {
            catString += cat + "|"
        })
        catString = catString.slice(0, -1)
        editableRegex = `/(${params.keywords.tossUp}|${params.keywords.bonus}).??\n?.*?(${catString})\n?.+?(${
            params.keywords.shortAnswer
        }|${params.keywords.multipleChoice}):?((.|\n)+?)ANSWER:?(.+)/g${parameters.ignoreCase ? "i" : ""}`
        const regex = new RegExp(
            `(${params.keywords.tossUp}|${params.keywords.bonus}).??\n?.*?(${catString})\n?.*?(${params.keywords.shortAnswer}|${params.keywords.multipleChoice}):?((.|\n)+?)ANSWER:?(.+)`,
            `g${parameters.ignoreCase ? "i" : ""}`
        )

        return regex
        //(Tossup|TOSS UP|TOSS-UP|BONUS).+?\n?.+?(BIOLOGY|CHEMISTRY|EARTH AND SPACE|MATH|PHYSICS|GENERAL SCIENCE|ASTRONOMY|EARTH SCIENCE|COMPUTER SCIENCE)\n?.+?(Short Answer|Multiple Choice):?((.|\n)+?)ANSWER:?(.+)
    }

    function handleSetSelect(e: CustomEvent) {
        setName = e.detail.name
        setId = e.detail.id
    }

    function handleSetClear() {
        setName = ""
        setId = undefined
    }

    $: categoryNames = setCatNames(parameters.categories)
    $: keywords = setKeywords(parameters.keywords)
    $: questions = generatePreviews(plainText, regexPattern, keywords, categoryNames)
    let regexPattern = calcRegexPattern(parameters)

    async function handleSubmit(e: Omit<SubmitEvent, "submitter">) {
        e.preventDefault()

        const formData = new FormData()
        formData.append("created", created?.toString() || "")
        formData.append("packet-name", packetName)
        formData.append("choose-set", chooseSet || "")
        formData.append("questions", JSON.stringify(questions)), formData.append("new-set-name", setName)
        formData.append("set-id", setId || "")

        plainText = ""
        settingsVisible = false
        editableRegex = ""
        chooseSet = undefined
        setName = ""
        setId = ""
        packetName = ""
        created = undefined

        const res = await fetch("/api/packet", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: $session.lucia?.access_token ? `Bearer ${$session.lucia?.access_token}` : "",
            },
        })

        submitted = res.ok ? "success" : "error"
        notificationShown = true
        setTimeout(() => (notificationShown = false), 5000)
    }
</script>

<svelte:head>
    <title>Submit a Packet</title>
</svelte:head>

<main>
    {#if $session.lucia?.user.packetSubmitter}
        {#if submitted === "success"}
            <Notification
                title="Success"
                text="Your packet has been successfully submitted"
                shown={notificationShown}
            />
        {:else if submitted === "error"}
            <Notification
                title="Error"
                text="An error occurred and your packet was not submitted"
                shown={notificationShown}
            />
        {/if}
        <div class="data-entry">
            <form id="form" action="/packet-submit" method="POST" autocomplete="off" on:submit={handleSubmit}>
                <h1>Packet Submission</h1>
                <input type="text" name="packet-name" placeholder="Packet Name" bind:value={packetName} />
                <br />
                <div class="radio-wrapper">
                    <label for="new-set" class="radio-label">
                        <input id="new-set" type="radio" name="choose-set" value="new" bind:group={chooseSet} />
                        <span />
                        New Set
                    </label>
                    {#if chooseSet === "new"}
                        <br />
                        <input
                            type="text"
                            name="new-set-name"
                            placeholder="New Set Name"
                            bind:value={setName}
                            style:margin-left="2em"
                        />
                    {/if}
                    <br />
                    <label for="existing-set" class="radio-label">
                        <input
                            id="existing-set"
                            type="radio"
                            name="choose-set"
                            value="existing"
                            bind:group={chooseSet}
                        />
                        <span />
                        Existing Set
                    </label>
                    {#if chooseSet === "existing"}
                        <br />
                        <div style:margin-left="2em">
                            <SetSearch on:select={handleSetSelect} on:clear={handleSetClear} />
                        </div>
                        <input type="hidden" name="set-id" value={setId} />
                    {/if}
                    <br />
                    <label for="no-set" class="radio-label">
                        <input id="no-set" type="radio" name="choose-set" value="none" bind:group={chooseSet} />
                        <span />
                        No Set
                    </label>
                </div>
                <br />
                <div style="background:hsl(48, 18%, 9%);border-radius:.3em">
                    <label for="created" style="display: inline-block;margin:0 .3em;font-size:20px;"
                        >Packet Creation Date:</label
                    >
                    <input
                        id="created"
                        name="created"
                        type="date"
                        bind:value={created}
                        style="width:13ch;max-width:90%;margin:0;border-radius:0 .3em .3em 0"
                    />
                </div>
                <textarea
                    name="plainText"
                    placeholder="Paste in your packet here. Ctrl + A, Ctrl+C, Ctrl+V should work."
                    id="question-input"
                    bind:value={plainText}
                    on:change|stopPropagation={() =>
                        (plainText = plainText.replaceAll(
                            new RegExp(`(.)${parameters.keywords.tossUp}`, "gi"),
                            (k) => k[0] + `\n${parameters.keywords.tossUp}`
                        ))}
                    style:min-height="10em"
                />
                <button type="button" class="settings-button" on:click={() => (settingsVisible = !settingsVisible)}>
                    {settingsVisible ? "Hide" : "Show"} parsing settings
                </button>
                <div id="advancedSettings" class:visible={settingsVisible}>
                    <div id="categoryContainer" on:input={() => (regexPattern = calcRegexPattern(parameters))}>
                        <p>Keywords:</p>
                        <p />
                        <p />
                        <p />
                        <p>Biology:</p>
                        <p>Chemistry:</p>
                        <p>Earth and Space:</p>
                        <p>Physics:</p>
                        <p>Math:</p>
                        <p>Energy:</p>
                        <p style:align-self="start">Other:</p>

                        <input type="text" bind:value={parameters.keywords.tossUp} />
                        <input type="text" bind:value={parameters.keywords.bonus} />
                        <input type="text" bind:value={parameters.keywords.shortAnswer} />
                        <input type="text" bind:value={parameters.keywords.multipleChoice} />
                        <input type="text" bind:value={parameters.categories[0]} />
                        <input type="text" bind:value={parameters.categories[1]} />
                        <input type="text" bind:value={parameters.categories[2]} />
                        <input type="text" bind:value={parameters.categories[3]} />
                        <input type="text" bind:value={parameters.categories[4]} />
                        <input type="text" bind:value={parameters.categories[5]} />
                        <div>
                            {#each Array(parameters.categories.length - 6) as _, i}
                                <div class="removableCat">
                                    <input
                                        type="text"
                                        bind:value={parameters.categories[i + 6]}
                                        style="width:12ch;border-radius:.3em 0 0 .3em "
                                    />
                                    <button
                                        type="button"
                                        class="minus"
                                        on:click={() => {
                                            parameters.categories = [
                                                ...parameters.categories.slice(0, 6 + i),
                                                ...parameters.categories.slice(6 + i + 1),
                                            ]
                                            parameters.categories = parameters.categories
                                            regexPattern = calcRegexPattern(parameters)
                                        }}
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
                                    regexPattern = calcRegexPattern(parameters)
                                }}
                            >
                                +
                            </button>
                        </div>

                        <input type="hidden" name="questions" value={JSON.stringify(questions)} />
                    </div>
                    <input
                        type="checkbox"
                        name="ignoreCase"
                        bind:checked={parameters.ignoreCase}
                        on:change={() => (regexPattern = calcRegexPattern(parameters))}
                    />
                    Ignore Case
                    <p>
                        Raw Regex:<HelpBox
                            >Edit this if your questions arent detected by the current regex filter. Questions are
                            categoriezed into categories using the names above, so make sure you edit the boxes above
                            first before editing the regex. Changes to the boxes above will edit the regex below and
                            overwrite any changes you make to it.</HelpBox
                        >
                    </p>
                    <textarea bind:value={editableRegex} on:input|stopPropagation={manualRegex} />
                </div>
                <button type="submit" class="submit-button" disabled={!submitEnabled}>Submit Questions</button>
            </form>
        </div>
        <div id="questions-preview">
            <h1>Question Previews</h1>
            <p>
                We've detected {questions.length} questions. If you are missing any, try changing the regex filter.
            </p>
            <div id="questions">
                {#each questions as question}
                    <PacketQuestionPreview bind:question />
                {/each}
            </div>
        </div>
    {:else}
        <div class="not-allowed">
            <p>
                You do not have permission to submit packets.
                {#if $session.lucia?.user}
                    <a href="/login">Log in</a> to gain access.
                {/if}
            </p>
            <p>To submit your own questions, go to <a href="/write">the Write page</a></p>
        </div>
    {/if}
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

    .not-allowed {
        grid-column: 1 / 3;
        text-align: center;
        font-size: 22px;
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

    .radio-wrapper {
        text-align: left;
        display: inline-block;
        width: 35ch;
        max-width: 80vw;

        input[type="text"] {
            max-width: 70vw;
        }
    }

    .radio-label {
        @extend %radio-label;

        font-size: 18px;
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
        grid-template-rows: repeat(11, auto);
        grid-auto-flow: column;
        align-items: center;

        p {
            margin: 0.85em;
            font-size: 18px;
        }
    }

    .plus {
        @extend %button-secondary;
        padding-top: 0.3em;
        width: 6ch;
    }

    .minus {
        @extend %button-secondary;

        width: 3ch;
        font-size: 22px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        margin-left: 0;
        padding-top: 0.2em;
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

        font-size: 22px;
        width: 20ch;
        max-width: 80vw;
        text-align: center;
    }
    input[type="date"] {
        @extend %text-input;
        font-size: 22px;
        &:focus::placeholder {
            color: transparent;
        }
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
