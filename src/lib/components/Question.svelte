<script lang="ts">
    import type { Question } from "../mongo"
    import { session } from "$app/stores"
    import { slide } from "svelte/transition"

    export let question: Question & { authorName?: string }
    export let answerVisible = false

    let modifiedDate = new Date(question.modified)
    let modifiedDateString = Intl.DateTimeFormat(Intl.DateTimeFormat().resolvedOptions().locale).format(modifiedDate)

    const categoryNames = {
        bio: "Biology",
        earth: "Earth and Space",
        chem: "Chemistry",
        physics: "Physics",
        math: "Math",
        energy: "Energy",
    }

    function showAnswer() {
        answerVisible = !answerVisible
    }

    function keyHandler(e: KeyboardEvent) {
        if (e.code === "Space") {
            showAnswer()
        }
    }
</script>

<svelte:body on:keydown={keyHandler} />

<div id="question" class={question.category}>
    <div class="top">
        <h1>{categoryNames[question.category]}</h1>
        <p class="question-text">{question.questionText}</p>

        {#if question.type === "MCQ"}
            <ul>
                <li class="question-text">W) {question.choices.W}</li>
                <li class="question-text">X) {question.choices.X}</li>
                <li class="question-text">Y) {question.choices.Y}</li>
                <li class="question-text">Z) {question.choices.Z}</li>
            </ul>
        {/if}

        <button id="showanswer" on:click={showAnswer}>{answerVisible ? "Hide" : "Show"} Answer</button>
        {#if answerVisible}
            <p id="correct-answer" transition:slide={{ duration: 200 }}>{question.correctAnswer}</p>
        {/if}
    </div>
    <div class="line" />
    <div class="bottom">
        {#if question.authorId}
            <span class="metadata">
                <a href="/account/{question.authorId}" sveltekit:prefetch>{question.authorName}</a>
                <i>({modifiedDateString})</i>
            </span>
        {/if}
        {#if question.pairId}
            <a href="/question/{question.pairId}">Paired {question.bonus ? "Tossup" : "Bonus"}</a>
        {/if}
        <span style="margin-left: auto;" />
        {#if $session.lucia && $session.lucia.user.user_id === question.authorId}
            <a id="editbutton" href="/edit/{question.id}">
                <span />
            </a>
        {/if}
    </div>
</div>

<style lang="scss">
    #question {
        position: relative;
        background-color: $background-2;
        padding: 0.5em 1em 0.5em 2em;
        margin: 20px;
        border-radius: 1em;
        overflow: hidden;
        width: 100%;
        max-width: min(100ch, 60vw);

        &::before {
            content: "";
            position: absolute;
            left: 0;
            top: -20px;
            width: 0.4em;
            height: 150%;
        }

        @media (max-width: 800px) {
            max-width: min(100ch, 90vw);
        }
    }

    .top {
        position: relative;
    }

    h1 {
        margin-top: 0.5em;
    }

    .question-text {
        font-weight: 500;
        font-size: 18px;
        margin-left: 1em;
    }

    ul {
        list-style: none;

        li {
            font-size: 18px;

            &:not(:first-child) {
                margin-top: 0.6em;
            }
        }
    }

    #correct-answer {
        font-size: 20px;
        margin: 0.5em;
        padding-left: 1em;
    }

    p {
        font-weight: 400;
        margin-bottom: 0.5em;
    }

    .line {
        border-top: 1px solid $text-light;
        margin-top: 0.5em;
    }

    .bottom {
        margin-top: 0.5em;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 4ch;
        height: 1.5em;

        a {
            display: inline-block;
        }
    }

    .metadata {
        margin: 0;
        line-height: 1em;
    }

    #editbutton {
        font-size: inherit;
        outline: none;
        border: none;
        width: 1.5em;
        height: 1.5em;
        padding: 0.2em;
        vertical-align: middle;
        cursor: pointer;

        span {
            background-image: url("/pencil.png");
            background-size: cover;
            width: 100%;
            height: 100%;
            display: block;
        }

        &:disabled {
            cursor: default;
        }
    }

    #showanswer {
        @extend %button-secondary;

        font-size: 20px;
        box-sizing: border-box;
        width: 15ch;
    }

    .bio {
        &::before {
            background-color: var(--bio);
        }
    }

    .earth {
        &::before {
            background-color: var(--earth);
        }
    }

    .chem {
        &::before {
            background-color: var(--chem);
        }
    }

    .physics {
        &::before {
            background-color: var(--physics);
        }
    }

    .math {
        &::before {
            background-color: var(--math);
        }
    }

    .energy {
        &::before {
            background-color: var(--energy);
        }
    }
</style>
