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
    import SetSearch from "$lib/components/SetSearch.svelte"
    import { generatePreviews, setCatNames, setKeywords, type NewPacketQuestionData, type PacketCategories } from "$lib/functions/packetSubmitUtils"
    import ReviewPacket from "$lib/components/ReviewPacket.svelte"
    import PacketParsingSettings from "$lib/components/PacketParsingSettings.svelte"

    export let submitted: string
    let notificationShown = true

    if (submitted) {
        onMount(() => {
            setTimeout(() => {
                notificationShown = false
            }, 5000)
        })
    }

    let plainText: string
    let settingsVisible = false
    let editableRegex: string
    let regexPattern: RegExp
    let chooseSet: "new" | "existing" | "none" | undefined
    let setName: string
    let setId: string | undefined
    let packetName: string
    let createdString: string | undefined
    $: created = createdString
        ? new Date(
            Number(createdString.split("-")[0]),
            Number(createdString.split("-")[1]) - 1,
            Number(createdString.split("-")[2])
        )
        : new Date()

    $: reviewEnabled = createdString && plainText && packetName && chooseSet

    type Parameters = {
        keywords: {
            tossUp: string
            bonus: string
            shortAnswer: string
            multipleChoice: string,
            answer: string
        }
        categories: PacketCategories,
        ignoreCase: boolean
    }

    let parameters: Parameters = {
        keywords: {
            tossUp: "TOSSUP",
            bonus: "BONUS",
            shortAnswer: "Short Answer",
            multipleChoice: "Multiple Choice",
            answer: "ANSWER:"
        },
        categories: {
            bio: "Biology",
            chem: "Chemistry",
            earth: "Earth and Space",
            physics: "Physics",
            math: "Math",
            energy: "Energy",
            custom: []
        },
        ignoreCase: true,
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

    let reviewing = false
    let reviewQuestions: NewPacketQuestionData[] = []

    function handleReview() {
        reviewing = true
        reviewQuestions = structuredClone(questions)
    }

    function handleBack() {
        reviewing = false
    }

    async function handleSubmit() {
        const formData = new FormData()
        formData.append("created", created?.toString() || "")
        formData.append("packet-name", packetName)
        formData.append("choose-set", chooseSet || "")
        formData.append("questions", JSON.stringify(reviewQuestions)), formData.append("new-set-name", setName)
        formData.append("set-id", setId || "")

        plainText = ""
        settingsVisible = false
        editableRegex = ""
        chooseSet = undefined
        setName = ""
        setId = ""
        packetName = ""
        createdString = undefined

        const res = await fetch("/api/packet", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: $session.lucia?.access_token ? `Bearer ${$session.lucia?.access_token}` : "",
            },
        })

        if (res.ok) {
            submitted = "success"
            reviewing = false
        } else {
            submitted = "error"
        }
        notificationShown = true
        setTimeout(() => (notificationShown = false), 5000)
    }
</script>

<svelte:head>
    <title>Submit a Packet</title>
</svelte:head>

<main>
    {#if !$session.lucia?.user.packetSubmitter}
        <div class="not-allowed">
            <p>
                You do not have permission to submit packets.
                {#if $session.lucia?.user}
                    <a href="/login">Log in</a> to gain access.
                {/if}
            </p>
            <p>To submit your own questions, go to <a href="/write">the Write page</a></p>
        </div>
    {:else if reviewing}
        <ReviewPacket bind:questions={reviewQuestions} {chooseSet} {setName} {packetName} {created}
            on:submit={handleSubmit} on:back={handleBack} />
    {:else}
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
            <form autocomplete="off">
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
                <div class="date-wrapper">
                    <label for="created" style="display: inline-block;margin:0 .3em;font-size:20px;"
                        >Packet Creation Date:</label
                    >
                    <input
                        id="created"
                        name="created"
                        type="date"
                        bind:value={createdString}
                        class:empty={!createdString}
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
                <div class="settings-wrapper" class:visible={settingsVisible}>
                    <PacketParsingSettings bind:parameters bind:regexPattern bind:editableRegex />
                </div>
                <button type="button" class="review-button" disabled={!reviewEnabled}
                    on:click={handleReview}>Review Questions</button>
            </form>
        </div>
        <div id="questions-preview">
            <h1>Question Previews</h1>
            <p>
                We've detected {questions.length} questions. If you are missing any, try changing the regex filter.
            </p>
            <div id="questions">
                <div class="wrapper">
                    {#each questions as question}
                        <PacketQuestionPreview bind:question />
                    {/each}
                </div>
            </div>
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

    .date-wrapper {
        background: hsl(48, 18%, 9%);
        border-radius: 0.3em;

        input.empty {
            color: #757575;
        }
    }

    .settings-button {
        @extend %button-secondary;

        font-size: 20px;
    }

    .settings-wrapper {
        display: none;
        
        &.visible {
            display: block;
        }
    }

    #questions-preview {
        border-radius: 1em;
        border: 1px solid #666;
        text-align: center;
        padding: 0.5em;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 0;
        box-sizing: border-box;
    }

    #questions {
        @include vertical-scrollable(8px);

        text-align: left;

        .wrapper {
            display: flex;
            flex-direction: column;
            gap: 1em;
        }
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

    .review-button {
        @extend %button-primary;

        font-size: 24px;
        margin-top: 1em;
    }
</style>
