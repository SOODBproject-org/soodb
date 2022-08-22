<script lang="ts">
    import type { NewQuestionData } from "../mongo"
    export let question: NewQuestionData

    const categoryNames = {
        bio: "Biology",
        earth: "Earth and Space",
        chem: "Chemistry",
        physics: "Physics",
        math: "Math",
        energy: "Energy",
    } as Record<string, string>
</script>

<div id="question" class={categoryNames[question.category] ? question.category : "other"}>
    <h1>
        {categoryNames[question.category] ? categoryNames[question.category] : question.category}
    </h1>
    <h3 class="question-text">{question.questionText}</h3>

    {#if question.type === "MCQ"}
        <h3 class="question-text">W) {question.choices.W}</h3>
        <h3 class="question-text">X) {question.choices.X}</h3>
        <h3 class="question-text">Y) {question.choices.Y}</h3>
        <h3 class="question-text">Z) {question.choices.Z}</h3>
    {/if}
    {#if question.source}
        <p>Source - {question.source}</p>
    {/if}
    <h3 class="correct-answer">{question.correctAnswer}</h3>
</div>

<style lang="scss">
    h1 {
        margin-top: 0.5em;
    }

    .question-text {
        font-weight: 500;
    }

    .correct-answer {
        display: inline-block;
        text-decoration: underline;
        font-size: 20px;
    }

    p {
        font-weight: 400;
        margin-bottom: 0.5em;
    }

    #question {
        position: relative;
        background-color: $background-2;
        padding: 1em;
        margin: 1em;
        border-radius: 1em;
        overflow: hidden;
        width: calc(100% - 4em);
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
    .other {
        &::before {
            background-color: gray;
        }
    }
</style>