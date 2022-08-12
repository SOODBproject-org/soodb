<script lang="ts" context="module">
    import type { Load } from "@sveltejs/kit"
    import Cookie from "js-cookie"

    export const load: Load = async function ({ session, fetch }) {
        console.dir(session)

        const inputs: Record<string, string> = {}
        if (session.previousQuery?.authorName) inputs.authorName = session.previousQuery.authorName
        if (session.previousQuery?.keywords) inputs.keywords = session.previousQuery.keywords
        if (session.previousQuery?.types?.length) inputs.types = (session.previousQuery.types ?? []).join(",")
        if (session.previousQuery?.categories?.length) {
            inputs.categories = (session.previousQuery.categories ?? []).join(",")
        }
        if (session.previousQuery?.start) inputs.start = session.previousQuery.start
        if (session.previousQuery?.end) inputs.end = session.previousQuery.end
        const params = new URLSearchParams({ ...inputs, includeAuthor: "true" })
        const questionsRes = await fetch("/api/questions?" + params.toString(), {
            headers: {
                Authorization: Cookie.get("authToken") ?? "",
            },
        })
        return {
            props: {
                questions: await questionsRes.json(),
            },
        }
    }
</script>

<script lang="ts">
    import QuestionPreview from "$lib/components/QuestionPreview.svelte"
    import PageSwitcher from "$lib/components/PageSwitcher.svelte"
    import QueryBox from "$lib/components/QueryBox.svelte"
    import type { SaQuestion, McqQuestion } from "$lib/mongo"
    import { tick } from "svelte"

    export let questions: (SaQuestion | McqQuestion)[] = []
    const resultsPerPage = 20
    let pageNumber =
        parseInt(Cookie.get("pageNumber") ?? "1") <= Math.ceil(questions.length / resultsPerPage)
            ? parseInt(Cookie.get("pageNumber") ?? "1")
            : 1
    $: numPages = Math.ceil(questions.length / resultsPerPage)
    let menuOpen = true
    let querySent = false
    async function sendQuery(queryBox: Record<string, any>) {
        const inputs: Record<string, string> = {}
        if (queryBox.authorName) inputs.authorName = queryBox.authorName
        if (queryBox.keywords) inputs.keywords = queryBox.keywords
        if (queryBox.types.length) inputs.types = queryBox.types.join(",")
        if (queryBox.categories.length) inputs.categories = queryBox.categories.join(",")
        if (queryBox.start) inputs.start = queryBox.start
        if (queryBox.end) inputs.end = queryBox.end
        const params = new URLSearchParams(inputs)
        const res = await fetch("/api/questions?" + params.toString(), {
            headers: {
                Authorization: Cookie.get("authToken") ?? "",
            },
        })
        questions = await res.json()
        await tick()
        window.scroll(0, 0)
        closeMenu()
        querySent = true
    }

    function openMenu() {
        menuOpen = true
    }

    function closeMenu() {
        menuOpen = false
    }
</script>

<svelte:head>
    <title>Question Search</title>
</svelte:head>

<main>
    <div id="page">
        <div id="desktop-menu-wrapper">
            <div id="desktop-menu">
                <QueryBox
                    bind:numQuestions={questions.length}
                    on:sendQuery={async (event) => {
                        await sendQuery(event.detail.inputs)
                        await tick()
                        if (event.detail.pageNumber && event.detail.pageNumber <= numPages) {
                            pageNumber = event.detail.pageNumber
                        }
                    }}
                />
            </div>
        </div>
        <div id="mobile-menu" class:opened={menuOpen}>
            <QueryBox
                bind:numQuestions={questions.length}
                on:sendQuery={(event) => {
                    sendQuery(event.detail.inputs)
                }}
            />
            <button id="close-menu" on:click={closeMenu}><span /></button>
        </div>
        <div id="results">
            {#if questions.length}
                <div id="questions">
                    {#each questions as q, i}
                        {#if i >= (pageNumber - 1) * resultsPerPage && i < pageNumber * resultsPerPage}
                            <QuestionPreview question={q} />
                        {/if}
                    {/each}
                </div>
                <PageSwitcher
                    bind:numPages
                    bind:pageNumber
                    on:pageChange={(event) => {
                        window.scroll(0, 0)
                        Cookie.set("pageNumber", event.detail.new)
                    }}
                />
            {:else}
                <div id="no-results">
                    {#if querySent}
                        <h1>No Questions Found</h1>
                        <div id="bensive" />
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</main>

<style lang="scss">
    h1 {
        display: inline-block;
        margin: 0 1ch;
        font-size: 1em;
    }

    #page {
        display: flex;
        flex-direction: row;
        position: relative;
    }

    #close-menu {
        display: none;
        width: 40px;
        height: 40px;
        background: var(--color-3);
        border: none;
        padding: 0;
        position: absolute;
        top: 30px;
        right: 30px;
        cursor: pointer;

        span {
            background-image: url("/close-menu.svg");
            background-position: cover;
            width: 100%;
            height: 100%;
            display: block;
        }
    }

    #questions {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        row-gap: 20px;
        column-gap: 20px;
    }

    #results {
        margin: 20px;
        height: 100%;
        flex-grow: 1;
        width: 100%;

        @media (min-width: 800px) {
            width: 75vw;
        }
    }

    button {
        @extend %button-primary;

        font-size: 20px;
    }

    #no-results {
        text-align: center;
        font-size: 30px;
    }

    #bensive {
        background: url("/bensive.svg");
        background-size: cover;
        width: 25vw;
        height: 25vw;
        max-width: 25em;
        max-height: 25em;
        margin: 1em 3em;
        display: inline-block;
        opacity: 0.7;
    }

    #mobile-menu {
        width: 85vw;
        max-width: 50ch;
        height: calc(100vh - 80px);
        display: none;
        position: fixed;
        left: -120vw;
        transition: left 0.4s ease-in-out;
        z-index: 3;
        background: #eee;
        overflow: auto;
        border-top-right-radius: 1em;
        border-bottom-right-radius: 1em;
        box-shadow: 25px 0px 20px #666;
        overscroll-behavior: contain;

        &.opened {
            left: 0;
        }
        &::-webkit-scrollbar {
            width: 7px;
        }
        &::-webkit-scrollbar-button {
            display: none;
        }
        &::-webkit-scrollbar-track {
            background: transparent;
        }
        &::-webkit-scrollbar-thumb {
            background: var(--color-2);
            width: 7px;
            border-radius: 7px;
        }
        &::-webkit-scrollbar-track-piece:start {
            margin-top: 1.2em;
            background: transparent;
        }
        &::-webkit-scrollbar-track-piece:end {
            margin-bottom: 1.2em;
            background: transparent;
        }
    }

    #desktop-menu-wrapper {
        @include vertical-scrollable(7px);

        overflow: auto;
        height: min-content;
        max-height: calc(100vh - 100px);
        position: sticky;
        top: 20px;
        width: min(40vw, 50ch);
        flex-grow: 2;
        border-radius: 1em;
        margin-left: 1em;
        margin-top: 1.2em;
        overscroll-behavior: contain;
    }

    #desktop-menu {
        height: min-content;
        border-radius: 1em;
        border: 1px solid #666;
    }

    @media (max-width: 800px) {
        #page {
            margin-top: 80px;
        }
        #desktop-menu-wrapper {
            display: none;
        }
        #mobile-menu {
            display: block;
        }
        #close-menu {
            display: block;
        }
        #questions {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        }
    }

    @media (max-width: 600px) {
        #questions {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
    }
</style>
