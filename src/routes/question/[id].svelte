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
    import type { Question, Category } from "$lib/mongo"
    import QuestionComp from "$lib/components/Question.svelte"
    import Cookie from "js-cookie"
    import QueryBox from "$lib/components/QueryBox.svelte"

    export let question: Question & { authorName?: string, authorId?: string }

    let menuOpen = true
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

    function openMenu() {
        menuOpen = true
    }

    function closeMenu() {
        menuOpen = false
    }
</script>

<svelte:head>
    <title>View Question</title>
</svelte:head>

<main>
    <div id="page">
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
        <div id="mobile-menu" class:opened={menuOpen}>
            <QueryBox
                numQuestions={0}
                on:sendQuery={(event) => {
                    sendQuery(event.detail.inputs)
                }}
            />
            <button id="close-menu" on:click={closeMenu}><span /></button>
        </div>
        {#if noMatch}
            <h1>No questions matched that query</h1>
        {:else if loaded}
            <QuestionComp {question} bind:answerVisible />
        {:else}
            <h1>Loading...</h1>
        {/if}
    </div>
</main>

<style lang="scss">
    #page {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    }

    h1 {
        display: inline-block;
        margin: 0 1ch;
        font-size: 1em;
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

    #mobile-menu {
        @include vertical-scrollable(7px);

        width: 85vw;
        max-width: 50ch;
        height: calc(100vh - 80px);
        display: none;
        position: fixed;
        left: -120vw;
        transition: left 0.4s ease-in-out;
        z-index: 3;
        background: $background-2;
        overflow: auto;
        border-top-right-radius: 1em;
        border-bottom-right-radius: 1em;
        box-shadow: 25px 0px 20px #666;
        overscroll-behavior: contain;

        &.opened {
            left: 0;
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
        max-width: 350px;
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
    }

    button {
        @extend %button-primary;

        font-size: 20px;
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
    }
</style>
