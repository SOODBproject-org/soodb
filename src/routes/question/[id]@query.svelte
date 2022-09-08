<script lang="ts" context="module">
    import type { Load } from "@sveltejs/kit"

    export const load: Load = async function ({ params, fetch }) {
        const questionRes = await fetch(`/api/question/${params.id}?includeAuthor=true`)
        const question = await questionRes.json()
        return {
            props: {
                question,
            },
        }
    }
</script>

<script lang="ts">
    import QuestionComp from "$lib/components/Question.svelte"
    import QueryBox from "$lib/components/QueryBox.svelte"
    import Icon from "svelte-icon/Icon.svelte";
    import arrow from "$lib/icons/arrow.svg?raw"
    import type { Category, Question } from "$lib/types";

    export let question: Question & { authorName?: string, authorId?: string }

    let menuOpen = false
    let answerVisible = false
    const loaded = true
    let noMatch = false
    const questionsSeen: string[] = []
    let authorSearch: string
    let types: ("MCQ" | "SA")[] = []
    let categories: Category[] = []
    let start, end

    // onMount(async () => {
    //     const stored = JSON.parse(Cookie.get("lastQuery") || "{}")
    //     author = stored.author
    //     types = !stored.types ? [] : stored.types
    //     categories = !stored.categories ? [] : stored.categories
    //     start = stored.start || undefined
    //     end = stored.end || undefined
    //     sendQuery({
    //         author: authorSearch,
    //         types: types.join(","),
    //         categories: categories.join(","),
    //         start,
    //         end,
    //     })
    // })

    async function sendQuery(inputs: Record<string, string>) {
        answerVisible = false
        const params = new URLSearchParams(inputs)
        const res = await fetch("/api/random?" + params.toString())
        if (res.ok) {
            noMatch = false
            question = await res.json()
            questionsSeen.push(question.id)
            history.pushState(null, "", "/question/" + question.id)
        } else {
            noMatch = true
        }
    }

    function toggleMenu() {
        menuOpen = !menuOpen
    }
</script>

<svelte:head>
    <title>View Question</title>
</svelte:head>

<div id="desktop-menu-wrapper">
    <div id="desktop-menu">
        <QueryBox
            numQuestions={0}
            on:sendQuery={async (event) => {
                sendQuery(event.detail.inputs)
            }}
        />
    </div>
</div>
<div id="mobile-menu-wrapper" class:opened={menuOpen}>
    <div id="mobile-menu">
        <QueryBox
            numQuestions={0}
            on:sendQuery={(event) => {
                sendQuery(event.detail.inputs)
            }}
        />
    </div>
    <button id="toggle-button" on:click={toggleMenu}>
        <Icon data={arrow} class="toggle-menu" />
    </button>
</div>
<main>
    {#if noMatch}
        <h1>No questions matched that query</h1>
    {:else if loaded}
        <QuestionComp {question} bind:answerVisible />
    {:else}
        <h1>Loading...</h1>
    {/if}
</main>

<style lang="scss">
    h1 {
        display: inline-block;
        margin: 0 1ch;
        font-size: 1em;
    }

    #toggle-button {
        width: 50px;
        height: 50px;
        background: $accent-2;
        border-radius: 50%;
        position: absolute;
        top: 100px;
        right: -25px;
        margin: 0;
        padding: 0;

        > :global(.toggle-menu) {
            display: inline-block;
            width: 60%;
            height: 60%;
            transition: transform 0.4s cubic-bezier(0.215, 0.610, 0.355, 1);
            transform: rotate(180deg);
        }
    }

    #mobile-menu-wrapper {
        width: 85vw;
        max-width: 50ch;
        height: calc(100vh - 100px);
        display: none;
        position: fixed;
        overflow: visible;
        top: 6em;
        left: calc(30px - min(85vw, 50ch));
        transition: left 0.4s ease-in-out;
        z-index: 3;
        background: $background-2;
        border-top-right-radius: 1em;
        border-bottom-right-radius: 1em;
        border: solid 1px #666;
        overscroll-behavior: contain;

        &.opened {
            left: 0;

            :global(.toggle-menu) {
                transform: rotate(0deg);
            }
        }
    }

    #mobile-menu {
        @include vertical-scrollable(7px);

        position: relative;
        overflow: auto;
        height: 100%;
        padding-right: 1em;
    }

    #desktop-menu-wrapper {
        @include vertical-scrollable(7px);

        overflow: auto;
        height: min-content;
        max-height: calc(100vh - 100px);
        position: sticky;
        top: 6em;
        width: min(40vw, 50ch);
        flex-grow: 2;
        border-radius: 1em;
        border: 1px solid #666;
        overscroll-behavior: contain;
    }

    #desktop-menu {
        height: min-content;
        border-radius: 1em;
    }

    @media (max-width: 650px) {
        #desktop-menu-wrapper {
            display: none;
        }
        #mobile-menu-wrapper {
            display: block;
        }
    }

    button {
        @extend %button-primary;

        font-size: 20px;
    }
</style>
