<script lang="ts">
    import Icon from "svelte-icon/Icon.svelte"
    import arrow from "$lib/icons/arrow.svg?raw"
    import image from "$lib/icons/image.svg?raw"
    import trash from "$lib/icons/trash.svg?raw"

    import type { NewQuestionData } from "../mongo"
    import { browser } from "$app/env"
    export let question: NewQuestionData & { number?: number }
    export let showImage = false

    const categoryNames = {
        bio: "Biology",
        earth: "Earth and Space",
        chem: "Chemistry",
        physics: "Physics",
        math: "Math",
        energy: "Energy",
    } as Record<string, string>

    $: category = question.category === "custom"
        ? question.customCategory
        : categoryNames[question.category] ?? "Custom Category"

    let imageVisible = false
    let uniqueId = browser
        ? window.crypto.getRandomValues(new Uint32Array(1))[0].toString(16)
        : ""
    let filename = ""
        
    function handleImage(e: Event & { currentTarget: EventTarget & HTMLInputElement; }) {
        if (e.currentTarget.files) {
            const uploaded = e.currentTarget.files[0]
            if (uploaded.type.startsWith("image/")) {
                const reader = new FileReader()
                const loadHandler = function() {
                    question.visual = typeof reader.result === "string" ? reader.result : ""
                    filename = uploaded.name
                    imageVisible = true
                    reader.removeEventListener("load", loadHandler)
                }

                reader.addEventListener("load", loadHandler)
                reader.readAsDataURL(uploaded)
            }
        }
    }

    function removeImage() {
        question.visual = undefined
        imageVisible = false
    }
</script>

<div class="preview {categoryNames[question.category] ? question.category : "other"}">
    <h2>
        {#if question.number}
            {question.number})
        {/if}
        {category}
    </h2>
    <p class="question-text">{question.questionText}</p>

    {#if question.type === "MCQ"}
        <ul>
            <li class="question-text">W) {question.choices.W}</li>
            <li class="question-text">X) {question.choices.X}</li>
            <li class="question-text">Y) {question.choices.Y}</li>
            <li class="question-text">Z) {question.choices.Z}</li>
        </ul>
    {/if}
    <p class="correct-answer">
        ANSWER:
        <span>
            {question.correctAnswer}
            {#if question.type === "MCQ"}
                ) {question.choices[question.correctAnswer]}
            {/if}
        </span>
    </p>
    {#if showImage}
        <div class="image">
            <div class="buttons-wrapper">
                {#if question.visual}
                    <span class="image-toggle" on:click={() => imageVisible = !imageVisible}>
                        <span class="icon">
                            <Icon data={image} />
                        </span>
                        <span class="icon" style:transform="rotate({imageVisible ? "90deg" : "-90deg"})">
                            <Icon data={arrow} />
                        </span>
                    </span>
                    <span class="filename" style:margin-left="auto">{filename}</span>
                    <span class="icon" on:click={removeImage}>
                        <Icon data={trash} />
                    </span>
                {:else}
                    <label class="upload-label" for="image-input-{uniqueId}">
                        <input type="file" id="image-input-{uniqueId}" accept="image/*"
                            on:input={handleImage} />
                        <span class="icon">
                            <Icon data={image} />
                        </span>
                        <span class="icon" style:font-weight="900">
                            +
                        </span>
                    </label>
                {/if}
            </div>
            {#if question.visual && imageVisible}
                <div class="visual-bonus">
                    <img class="visual-bonus" src={question.visual} alt="Visual bonus {question.number}" />
                </div>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
    h2 {
        margin-top: 0.5em;
    }

    p {
        font-size: 18px;
    }

    .question-text {
        font-weight: 500;
    }

    ul {
        list-style: none;
        font-size: 18px;
    }

    li {
        margin-top: 1em;
        margin-bottom: 1em;
    }

    .correct-answer {
        font-size: 20px;

        span {
            text-decoration: underline;
            margin-left: 0.5em;
        }
    }

    .preview {
        position: relative;
        background-color: $background-2;
        padding: 1em 2em;
        border-radius: 1em;
        overflow: hidden;

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

    .buttons-wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 32px;
        padding: 0.75em 0.5em 0.5em;
    }

    .image-toggle {
        cursor: pointer;
    }

    .icon {
        display: inline-block;
        width: 1em;
        height: 1em;
        user-select: none;
        cursor: pointer;

        :global(svg) {
            width: 100%;
            height: 100%;
        }
    }

    .upload-label {
        line-height: 1;
        cursor: pointer;

        input {
            visibility: hidden;
            width: 0;
            height: 0;
            opacity: 0;
            position: absolute;
        }
    }

    .filename {
        display: inline-block;
        font-size: 14px;
    }

    .visual-bonus {
        margin: 1em auto auto;
        text-align: center;

        img {
            max-width: 80%;
            max-height: 20em;
            width: auto;
            height: auto;
        }
    }
</style>
