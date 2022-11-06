<script lang="ts">
    import type { Question } from "$lib/types"
    export let question: Question & { authorName?: string }

    $: truncatedQuestion =
        question.questionText.length > numCharacters
            ? question.questionText.slice(0, numCharacters) + "…"
            : question.questionText
    const createdDate = new Date(question.created)
    const createdDateString = Intl.DateTimeFormat(Intl.DateTimeFormat().resolvedOptions().locale).format(createdDate)
    let previewWidth: number
    $: numCharacters = previewWidth / 3 - 20

    const categoryNames: Record<string, string> = {
        bio: "Biology",
        earth: "Earth and Space",
        chem: "Chemistry",
        physics: "Physics",
        math: "Math",
        energy: "Energy",
    }
</script>

<div class="preview {question.category}" bind:clientWidth={previewWidth}>
    <div class="wrapper">
        <h2>{categoryNames[question.category] ? categoryNames[question.category] : question.category}</h2>
        <a href="/question/{question.id}" data-sveltekit-prefetch>View</a>
    </div>
    <h3>{truncatedQuestion}</h3>
    <p>
        {#if question.authorName}
            <a href="/account/{question.authorId}" data-sveltekit-prefetch>{question.authorName}</a>
        {/if}
        <i>{createdDateString}</i>
    </p>
</div>

<style lang="scss">
    .preview {
        position: relative;
        background-color: $background-2;
        padding: 1em 1em 0.5em;
        border-radius: 1em;
        overflow: hidden;

        &::before {
            content: "";
            position: absolute;
            left: 0;
            top: -20px;
            width: 0.3em;
            height: 150%;
        }
    }

    .wrapper {
        display: flex;
        flex-direction: row;
        align-items: top;

        a {
            margin-left: auto;
            text-decoration: none;
            font-size: 18px;
        }
    }

    h2 {
        margin: 0;
    }

    h3 {
        font-weight: 500;
    }

    p {
        font-weight: 400;
        margin-bottom: 0.5em;
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
