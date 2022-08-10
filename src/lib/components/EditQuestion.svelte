<script lang="ts">
    import type { Category, McqQuestion, SaQuestion } from "$lib/mongo"
    export let question: SaQuestion | McqQuestion

    let category: Category = question.category
    const type: "MCQ" | "SA" = question.type
    let questionText: string = question.questionText
    const choices = question.type === "MCQ" ? question.choices : { W: "", X: "", Y: "", Z: "" }
    let optionW: string = choices?.W
    let optionX: string = choices?.X
    let optionY: string = choices?.Y
    let optionZ: string = choices?.Z
    let correctAnswer = question.correctAnswer

    let textareaWidth: number
    $: textareaHeight = Math.ceil(((questionText.length + 12) * 24) / textareaWidth) * 18
</script>

<div id="question" class={category}>
    <select name="category" bind:value={category}>
        <option value="bio">Biology</option>
        <option value="earth">Earth and Space</option>
        <option value="chem">Chemistry</option>
        <option value="physics">Physics</option>
        <option value="math">Math</option>
        <option value="energy">Energy</option>
    </select>
    <br />
    <div class="textarea-wrapper" bind:clientWidth={textareaWidth}>
        <textarea
            class="question-text"
            name="question-text"
            bind:value={questionText}
            style={`height: ${textareaHeight}px`}
        />
    </div>
    <br />
    {#if type === "MCQ"}
        <div class="radio-wrapper">
            <label class="radio-label">
                <input id="option-w-selected" type="radio" name="correct-answer" value="W" bind:group={correctAnswer} />
                <span />
                <p>W)</p>
                <textarea class="choice" name="W" placeholder="Option W" id="W-input" bind:value={optionW} />
            </label>
            <br />
            <label class="radio-label">
                <input id="option-x-selected" type="radio" name="correct-answer" value="X" bind:group={correctAnswer} />
                <span />
                <p>X)</p>
                <textarea class="choice" name="X" placeholder="Option X" id="X-input" bind:value={optionX} />
            </label>
            <br />
            <label class="radio-label">
                <input id="option-y-selected" type="radio" name="correct-answer" value="Y" bind:group={correctAnswer} />
                <span />
                <p>Y)</p>
                <textarea class="choice" name="Y" placeholder="Option Y" id="Y-input" bind:value={optionY} />
            </label>
            <br />
            <label class="radio-label">
                <input id="option-z-selected" type="radio" name="correct-answer" value="Z" bind:group={correctAnswer} />
                <span />
                <p>Z)</p>
                <textarea class="choice" name="Z" placeholder="Option Z" id="Z-input" bind:value={optionZ} />
            </label>
        </div>
    {:else if type === "SA"}
        <input type="text" name="answer" placeholder="Answer" id="answer-input" bind:value={correctAnswer} />
    {/if}
    <br />
    <button>Save Changes</button>
</div>

<style lang="scss">
    #question {
        position: relative;
        background-color: $background-2;
        padding: 1em;
        margin: 20px 0;
        border-radius: 1em;
        overflow: hidden;
        width: 75%;
        max-width: 80ch;
        display: inline-block;
        text-align: left;

        &::before {
            content: "";
            position: absolute;
            left: 0;
            top: -20px;
            width: 0.4em;
            height: 150%;
        }
    }

    .radio-label {
        @extend %radio-label;

        font-size: 20px;
        vertical-align: middle;

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

    select {
        margin: 0.5em 0;
        font-size: 2em;
        font-weight: bold;
    }

    .question-text {
        font-weight: 500;
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
    }

    input[type="text"] {
        @extend %text-input;

        font-size: 24px;
        margin: 0.5em auto;
        width: 25ch;
        max-width: 80vw;
        text-align: center;
    }

    textarea {
        @include vertical-scrollable(7px);

        padding: 0.3em;
        font-size: 20px;
        margin: 0.5em auto;
        border: none;
        border-radius: 0.3em;
        box-sizing: border-box;
        width: 30em;
        max-width: 80vw;
        resize: vertical;
        min-height: 1.8em;
        height: 1.8em;
        font-family: "Ubuntu";
        position: relative;
        vertical-align: middle;

        &:focus::placeholder {
            color: transparent;
        }
    }

    p {
        font-weight: 400;
        margin-bottom: 0.5em;
    }

    button {
        @extend %button-primary;

        font-size: 20px;
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
