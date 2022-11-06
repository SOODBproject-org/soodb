<script lang="ts">
    import type { Question } from "../types"
    import { getUser } from "@lucia-auth/sveltekit/client"
    import { slide } from "svelte/transition"
    import Icon from "$lib/components/Icon.svelte"
    import pencil from "$lib/icons/pencil.svg?raw"
    export let question: Question & { authorName?: string }
    export let answerVisible = false
    export let questionVisible = true

    const user = getUser()

    const modifiedDate = new Date(question.modified ?? "")
    const modifiedDateString = Intl.DateTimeFormat(Intl.DateTimeFormat().resolvedOptions().locale).format(modifiedDate)
    const createdDate = new Date(question.created)
    const createdDateString = Intl.DateTimeFormat(Intl.DateTimeFormat().resolvedOptions().locale).format(createdDate)

    const categoryNames: Record<string, string> = {
        bio: "Biology",
        earth: "Earth and Space",
        chem: "Chemistry",
        physics: "Physics",
        math: "Math",
        energy: "Energy",
    }

    export function toggleAnswer() {
        answerVisible = !answerVisible
    }

    export function toggleQuestion() {
        questionVisible = !questionVisible
    }

    export function showAnswer() {
        answerVisible = true
    }

    export function hideAnswer() {
        answerVisible = false
    }

    

    
</script>

<div id="question" class={question.category}>
    <div class="top">
        <h1>{categoryNames[question.category] ? categoryNames[question.category] : question.category}</h1>
        <button id="showquestion" on:click={toggleQuestion}>{questionVisible ? "Hide" : "Show"} Question</button><br>
        {#if questionVisible}
			<div transition:slide={{ duration: 100 }}>
				<p class="question-text">{question.questionText}</p>
				
				{#if question.type === "MCQ"}
					<ul>
						<li class="question-text">W) {question.choices.W}</li>
						<li class="question-text">X) {question.choices.X}</li>
						<li class="question-text">Y) {question.choices.Y}</li>
						<li class="question-text">Z) {question.choices.Z}</li>
					</ul>
				{/if}
				{#if question.visual}
					<img src={question.visual} alt="visual bonus could not load" />
				{/if}
			</div>
        {/if}
        <button id="showanswer" on:click={toggleAnswer}>{answerVisible ? "Hide" : "Show"} Answer</button>
        {#if answerVisible}
            <p id="correct-answer">
                {question.type === "MCQ"
                    ? `${question.correctAnswer}) ${question.choices[question.correctAnswer]}`
                    : question.correctAnswer}
            </p>
        {/if}
    </div>
    <div class="line" />
    <div class="bottom">
        <span class="metadata">
            {#if question.packetId}
                <a href="/question-search?packet={encodeURIComponent(question.packetId)}"
                    >{question.packetName || "Packet"}</a
                >
            {:else}
                <a href="/account/{question.authorId}" data-sveltekit-prefetch>{question.authorName}</a>
            {/if}
        </span>
        {#if createdDate}
            <span class="metadata"><i>Created: {createdDateString}</i></span>
        {/if}
        {#if createdDateString !== modifiedDateString}
            <i>Modified: {modifiedDateString}</i>
        {/if}
        {#if question.pairId}
            <a href="/question/{question.pairId}">Paired {question.bonus ? "Tossup" : "Bonus"}</a>
        {/if}
        {#if $user?.userId === question.authorId}
            <span style="margin-left: auto;" />
            <a href="/edit/{question.id}">
                <Icon data={pencil} class="icon" />
            </a>
        {/if}
    </div>
</div>

<style lang="scss">
    #question {
        position: relative;
        background-color: $background-2;
        padding: 0.5em 1em 0.5em 2em;
        border-radius: 1em;
        overflow: hidden;
        max-width: 100ch;
        box-sizing: border-box;

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
        flex-wrap: wrap;
        column-gap: 4ch;
        row-gap: 0.75em;

        a {
            display: inline-block;

            > :global(.icon) {
                width: 1.5em;
                height: 1.5em;
                padding: 0.2em;
                cursor: pointer;
                color: $text-light;
            }
        }
    }

    .metadata {
        margin: 0;
        line-height: 1em;
        white-space: nowrap;
    }
    #showanswer {
        @extend %button-secondary;

        font-size: 15px;
        box-sizing: border-box;
        width: 15ch;
    }
	#showquestion {
		@extend %button-secondary;
		font-size: 15px;
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
