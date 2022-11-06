<script lang="ts">
    import Notification from "$lib/components/Notification.svelte"
    import { onMount } from "svelte"
    import type { Category } from "$lib/types"
    import type { PageData } from "./$types"
    import { getUser } from "@lucia-auth/sveltekit/client"

    export let data: PageData
    $: ({ submitted } = data)
    let notificationShown = true

    const user = getUser()

    if (submitted) {
        onMount(() => {
            setTimeout(() => {
                notificationShown = false
            }, 5000)
        })
    }

    let type: "MCQ" | "SA" | undefined
    let category: Category | undefined
    let optionW: string, optionX: string, optionY: string, optionZ: string
    let questionText: string, answer: string
    let correctAnswer: "W" | "X" | "Y" | "Z" | undefined
    $: submitEnabled =
        type &&
        category &&
        questionText &&
        (answer || correctAnswer) &&
        (type !== "MCQ" || (optionW && optionX && optionY && optionZ))

    let formElement: HTMLFormElement
    async function handleSubmit(e: Omit<SubmitEvent, "submitter">) {
        e.preventDefault()

        type = undefined
        category = undefined
        optionW = ""
        optionX = ""
        optionY = ""
        optionZ = ""
        questionText = ""
        correctAnswer = undefined

        const formData = new FormData(formElement)
        const res = await fetch("/api/question", {
            method: "POST",
            body: formData,
            credentials: "include",
        })

        submitted = res.ok ? "success" : "error"
        notificationShown = true
        setTimeout(() => (notificationShown = false), 5000)
    }
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

    <h1>Submit Question</h1>
    <form id="form" action="/write" method="POST" autocomplete="off" on:submit={handleSubmit} bind:this={formElement}>
        {#if !$user}
            <p style:font-style="italic" style:margin-top="0">
                This question will be submitted anonymously.<br />
                <a href="/login">Log in</a> to submit a question under your account
            </p>
            <input type="hidden" name="anonymous" value="true" />
        {/if}
        <div class="radio-wrapper">
            <label for="multiple-choice" class="radio-label">
                <input id="multiple-choice" type="radio" name="type" value="MCQ" bind:group={type} />
                <span />
                Multiple Choice
            </label>
            <br />
            <label for="short-answer" class="radio-label">
                <input id="short-answer" type="radio" name="type" value="SA" bind:group={type} />
                <span />
                Short Answer
            </label>
        </div>
        <select name="category" id="category" bind:value={category} required>
            <option value="" hidden default>Category</option>
            <option value="earth">Earth and Space</option>
            <option value="bio">Biology</option>
            <option value="chem">Chemistry</option>
            <option value="physics">Physics</option>
            <option value="math">Math</option>
            <option value="energy">Energy</option>
        </select>
        <textarea
            name="question-text"
            placeholder="Question"
            id="question-input"
            bind:value={questionText}
            style="height: 4em; min-height: 4em;"
        />
        {#if type === "MCQ"}
            <div class="radio-wrapper">
                <label class="radio-label">
                    <input
                        id="option-w-selected"
                        type="radio"
                        name="correct-answer"
                        value="W"
                        bind:group={correctAnswer}
                    />
                    <span />
                    <p>W)</p>
                    <textarea class="choice" name="W" placeholder="Option W" id="W-input" bind:value={optionW} />
                </label>
                <br />
                <label class="radio-label">
                    <input
                        id="option-x-selected"
                        type="radio"
                        name="correct-answer"
                        value="X"
                        bind:group={correctAnswer}
                    />
                    <span />
                    <p>X)</p>
                    <textarea class="choice" name="X" placeholder="Option X" id="X-input" bind:value={optionX} />
                </label>
                <br />
                <label class="radio-label">
                    <input
                        id="option-y-selected"
                        type="radio"
                        name="correct-answer"
                        value="Y"
                        bind:group={correctAnswer}
                    />
                    <span />
                    <p>Y)</p>
                    <textarea class="choice" name="Y" placeholder="Option Y" id="Y-input" bind:value={optionY} />
                </label>
                <br />
                <label class="radio-label">
                    <input
                        id="option-z-selected"
                        type="radio"
                        name="correct-answer"
                        value="Z"
                        bind:group={correctAnswer}
                    />
                    <span />
                    <p>Z)</p>
                    <textarea class="choice" name="Z" placeholder="Option Z" id="Z-input" bind:value={optionZ} />
                </label>
            </div>
        {:else if type === "SA"}
            <input type="text" name="answer" placeholder="Answer" id="answer-input" bind:value={answer} />
        {/if}
        <button type="submit" disabled={!submitEnabled}>Submit Question</button>
    </form>
</main>

<style lang="scss">
    form {
        margin: 0 auto 3em;
        text-align: center;
        padding: 1em;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 50em;
        max-width: 85vw;
    }

    h1 {
        font-size: 44px;
        text-decoration: underline $accent-2 3px;
        text-underline-offset: 0.2em;
        color: $text-light;
        text-align: center;
    }

    .radio-wrapper {
        text-align: left;
        display: inline-block;
    }

    select {
        padding: 0.3em;
        font-size: 24px;
        margin: 0.5em auto;
        border: none;
        border-radius: 0.3em;
        box-sizing: border-box;
        width: 25ch;
        max-width: 80vw;
        text-align: center;
        font-family: "Ubuntu";
        position: relative;
        background: $input-background;
        color: $text-light;

        &:invalid {
            color: #666;
        }
    }

    input[type="text"] {
        @extend %text-input;

        font-size: 24px;
        width: 25ch;
        max-width: 80vw;
        text-align: center;
    }

    textarea {
        padding: 0.3em;
        font-size: 20px;
        margin: 0.5em auto;
        border: none;
        border-radius: 0.3em;
        box-sizing: border-box;
        width: 40ch;
        max-width: 80vw;
        resize: vertical;
        min-height: 1.8em;
        height: 1.8em;
        font-family: "Ubuntu";
        position: relative;
        vertical-align: middle;
        background: $input-background;
        color: $text-light;

        &:focus::placeholder {
            color: transparent;
        }
    }

    .radio-label {
        @extend %radio-label;

        font-size: 20px;

        .choice {
            width: 40ch;
            height: 3em;
            min-height: 3em;
        }

        p {
            width: 2.5ch;
            margin: 0;
            display: inline-block;
        }
    }

    button {
        @extend %button-primary;

        font-size: 22px;
        margin-top: 1em;
    }
</style>
