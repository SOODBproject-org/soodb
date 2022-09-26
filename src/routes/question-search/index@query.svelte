<script lang="ts" context="module">
    import type { Load } from "@sveltejs/kit"
    import Cookie from "js-cookie"

    export const load: Load = async function ({ fetch, url }) {
        const paramQueryEntries = [...url.searchParams.entries()]
            .filter(([key, _]) =>
                ["authorId", "keywords", "set", "packet", "start", "end", "types", "categories"].includes(key)
            )
            .map(([key, value]) => {
                if (key === "types" || key === "categories") {
                    return [key, value.split(",")]
                } else {
                    return [key, value]
                }
            })

        const paramQuery = Object.fromEntries(paramQueryEntries)

        const previousQuery: Record<string, string | string[]> = browser
            ? JSON.parse(Cookie.get("previousQuery") ?? "{}")
            : {}
        const params = new URLSearchParams({
            ...previousQuery,
            ...paramQuery,
            includeAuthor: "true",
            // check cookie on SSR request
            checkCookies: "true",
        })
        const questionsRes = await fetch("/api/question?" + params.toString(), {
            credentials: "include",
        })
        const questions = questionsRes.ok ? await questionsRes.json() : []
        return {
            props: {
                query: {
                    ...previousQuery,
                    ...paramQuery,
                },
                questionPages: splitIntoPages(questions),
            },
        }
    }
</script>

<script lang="ts">
    import QuestionPreview from "$lib/components/QuestionPreview.svelte"
    import PageSwitcher from "$lib/components/PageSwitcher.svelte"
    import QueryBox from "$lib/components/QueryBox.svelte"
    import { onMount, tick } from "svelte"
    import { browser } from "$app/env"
    import { removeUndefined } from "$lib/utils"
    import Icon from "svelte-icon/Icon.svelte"
    import bensive from "$lib/icons/bensive.svg?raw"
    import arrow from "$lib/icons/arrow.svg?raw"
    import type { Question } from "$lib/types"
    import { splitIntoPages } from "$lib/functions/queryUtils"
    import { page } from "$app/stores"

    export let query: Record<string, string>
    export let questionPages: Record<number, Question[]> = {}

    // TODO: split into components (use stores in context?)
    // TODO: load queryBox with query already set

    let queryBoxComponent: QueryBox
    onMount(() => {
        history.replaceState({}, "", "/question-search")
        queryBoxComponent?.setQuery(query)
    })

    const resultsPerPage = 24
    let pageNumber =
        parseInt(Cookie.get("pageNumber") ?? "1") <= Math.max(...Object.keys(questionPages).map(x => Number(x))) ?? 1
            ? parseInt(Cookie.get("pageNumber") ?? "1")
            : 1
    $: numPages = Math.max(...Object.keys(questionPages).map(x => Number(x)))
    $: numQuestions = (numPages - 1) * resultsPerPage + questionPages[numPages]?.length

    let menuOpen = false
    let querySent = false
    async function sendQuery(queryBox: Record<string, any>) {
        query.authorId = queryBox.authorId || undefined
        query.keywords = queryBox.keywords || undefined
        query.sets = queryBox.sets?.length ? queryBox.sets : undefined
        query.packets = queryBox.packets?.length ? queryBox.packets : undefined
        query.types = queryBox.types.length ? queryBox.types : undefined
        query.categories = queryBox.categories.length ? queryBox.categories : undefined
        query.start = queryBox.start || undefined
        query.end = queryBox.end || undefined

        query = removeUndefined(query)

        Cookie.set("previousQuery", JSON.stringify(query))
        const params = new URLSearchParams(query)

        const res = await fetch("/api/question?" + params.toString(), {
            credentials: "include",
        })
        if (res.ok) {
            const questionJson = await res.json() as Question[]
            questionPages = splitIntoPages(questionJson)
        } else {
            questionPages = {}
        }
        pageNumber = 1

        await tick()
        window.scroll(0, 0)
        menuOpen = false
        querySent = true
    }

    async function handlePageChange({ detail }: CustomEvent<{ new: number, old: number }>) {
        if (questionPages[detail.new]) {
            pageNumber = detail.new
            window.scroll(0, 0)
            Cookie.set("pageNumber", detail.new.toString())
        } else {
            const params = new URLSearchParams({
                ...query,
                page: detail.new.toString(),
                limit: resultsPerPage.toString()
            })
            const res = await fetch("/api/question?" + params.toString(), {
                credentials: "include",
            })
            if (res.ok) {
                const newQuestions = await res.json()
                if (newQuestions.length > 0) {
                    questionPages[detail.new] = newQuestions
                    pageNumber = detail.new
                    window.scroll(0, 0)
                    Cookie.set("pageNumber", detail.new.toString())
                } else {
                    pageNumber = numPages
                }
            } else {
                pageNumber = numPages
            }
        }

        if (!questionPages[detail.new + 2]) {
            const params = new URLSearchParams({
                ...query,
                page: (detail.new + 2).toString(),
                limit: resultsPerPage.toString()
            })
            const res = await fetch("/api/question?" + params.toString(), {
                credentials: "include",
            })
            if (res.ok) {
                const newQuestions = await res.json()
                if (newQuestions.length > 0) {
                    questionPages[detail.new + 2] = newQuestions
                }
            }
        }

        if (!questionPages[Math.max(detail.new - 1, 1)]) {
            const params = new URLSearchParams({
                ...query,
                page: (detail.new - 1).toString(),
                limit: resultsPerPage.toString()
            })
            const res = await fetch("/api/question?" + params.toString(), {
                credentials: "include",
            })
            if (res.ok) {
                const newQuestions = await res.json()
                if (newQuestions.length > 0) {
                    questionPages[detail.new - 1] = newQuestions
                }
            }
        }
    }

    function toggleMenu() {
        menuOpen = !menuOpen
    }
</script>

<svelte:head>
    <title>Question Search</title>
</svelte:head>

<div id="desktop-menu-wrapper">
    <div id="desktop-menu">
        <QueryBox
            questionCount={
                questionPages[numPages]?.length === 24
                ? numQuestions.toString() + "+"
                : numQuestions.toString()
            }
            bind:this={queryBoxComponent}
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
<div id="mobile-menu-wrapper" class:opened={menuOpen}>
    <div id="mobile-menu">
        <QueryBox
            questionCount={
                questionPages[numPages]?.length === 24
                ? numQuestions.toString()
                : numQuestions.toString() + "+"
            }
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
    {#if questionPages[pageNumber]}
        <div id="questions">
            {#each questionPages[pageNumber] as q}
                <QuestionPreview question={q} />
            {/each}
        </div>
        <PageSwitcher
            {numPages}
            {pageNumber}
            on:pageChange={handlePageChange}
        />
    {:else}
        <div id="no-results">
            {#if querySent}
                <h1>No Questions Found</h1>
                <div id="bensive"><Icon data={bensive} class="bensive" /></div>
            {/if}
        </div>
    {/if}
</main>

<style lang="scss">
    h1 {
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
            transition: transform 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
            transform: rotate(180deg);
        }
    }

    #questions {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        row-gap: 20px;
        column-gap: 20px;
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
        width: 25vw;
        height: 25vw;
        max-width: 25em;
        max-height: 25em;
        margin: 1em 3em;
        display: inline-block;
        opacity: 0.7;
        color: $text-light;
    }

    :global(.bensive) {
        color: $text-light;
        width: 100%;
        height: 100%;
        display: inline-block;
    }

    #mobile-menu-wrapper {
        width: 85vw;
        max-width: 50ch;
        height: calc(100vh - 115px);
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
        #questions {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }
    }
</style>
