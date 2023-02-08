<script lang="ts" context="module">
    import type { Load } from "@sveltejs/kit"
    import Cookie from "js-cookie"

    export const load: Load = async function ({ fetch, url, params }) {
        const paramQueryEntries = [...url.searchParams.entries()]
            .filter(([key]) =>
                ["authorId", "keywords", "set", "round", "start", "end", "types", "categories"].includes(key)
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

        const questionRes = await fetch(`/api/question/${params.id}?includeAuthor=true`)
        const question = await questionRes.json()
        const packetRes = await fetch("/api/packet")
        const sets = await packetRes.json()
        return {
            props: {
                query: {
                    ...previousQuery,
                    ...paramQuery,
                },
                question,
                sets,
            },
        }
    }
</script>

<script lang="ts">
    import QuestionComp from "$lib/components/Question.svelte"
    import QueryBox from "$lib/components/QueryBox.svelte"
    import Icon from "$lib/components/Icon.svelte"
    import arrow from "$lib/icons/arrow.svg?raw"
    import { browser } from "$app/env"
    import type { Question } from "$lib/types"
    import { removeUndefined } from "$lib/utils"
    import { tick } from "svelte"
    import Speech from "$lib/components/Speech.svelte"

    export let question: Question

    let menuOpen = false
    let answerVisible = false
    const loaded = true
    const questionsSeen: string[] = [question.id]

    export let query: Record<string, string>
    async function sendQuery(queryBox: Record<string, any>) {
        query.authorId = queryBox.authorId || undefined
        query.keywords = queryBox.keywords || undefined
        query.setName = queryBox.set?.length ? queryBox.set : undefined
        query.round = queryBox.round?.length ? queryBox.round : undefined
        query.types = queryBox.types?.length ? queryBox.types : undefined
        query.categories = queryBox.categories?.length ? queryBox.categories : undefined
        query.start = queryBox.start || undefined
        query.end = queryBox.end || undefined

        query = removeUndefined(query)

        Cookie.set("previousQuery", JSON.stringify(query))
        const params = new URLSearchParams(query)
        let currentq: Question = question
        while (questionsSeen.includes(currentq.id)) {
            const res = await fetch("/api/question/random?" + params.toString(), {
                credentials: "include",
            })
            currentq = await res.json()
        }
        questionsSeen.push(currentq.id)
        question = currentq
        await tick()
        history.replaceState({}, "", `${question.id}`)
        menuOpen = false
        hideAnswer()
    }

    function toggleMenu() {
        menuOpen = !menuOpen
    }

    let showAnswer: () => void
    let hideAnswer: () => void
    let windowWidth: number
</script>

<svelte:head>
    <title>View Question</title>
</svelte:head>
<svelte:window bind:innerWidth={windowWidth} />

<div id="desktop-menu-wrapper">
    <div id="desktop-menu">
        <QueryBox
            on:sendQuery={async (event) => {
                await sendQuery(event.detail.inputs)
                await tick()
            }}
        />
    </div>
</div>
{#if windowWidth < 650}
    <div id="mobile-menu-wrapper" class:opened={menuOpen}>
        <div id="mobile-menu">
            <QueryBox
                on:sendQuery={async (event) => {
                    await sendQuery(event.detail.inputs)
                    await tick()
                }}
            />
        </div>
        <button id="toggle-button" on:click={toggleMenu}>
            <Icon data={arrow} class="toggle-menu" />
        </button>
    </div>
{/if}
<main>
    {#if !question}
        <h1>No questions matched that query</h1>
    {:else if loaded}
        <QuestionComp {question} bind:answerVisible bind:showAnswer bind:hideAnswer />
    {:else}
        <h1>Loading...</h1>
    {/if}
    <Speech
        bind:question
        on:sendQuery={async () => {
            await sendQuery(query)
            hideAnswer()
            await tick()
        }}
        on:answerRead={showAnswer}
		on:answerClosed={hideAnswer}
    />
</main>

<style lang="scss">
    main {
        min-width: 0;
		max-height: min-content;
    }

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
            transition: transform 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
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
