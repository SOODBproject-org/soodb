<script lang="ts" context="module">
    import type { Load } from "@sveltejs/kit"

    export const load: Load = async function ({ params, fetch }) {
        const userRes = await fetch(`/api/user/${params.id}`)
        const userSettingsRes = await fetch(`/api/user/${params.id}/settings`)
        const questionsRes = await fetch(`/api/questions?authorId=${params.id}`)
        return {
            props: {
                userData: await userRes.json(),
                userSettings: await userSettingsRes.json(),
                questions: await questionsRes.json(),
            },
        }
    }
</script>

<script lang="ts">
    import QuestionPreview from "$lib/components/QuestionPreview.svelte"
    import Account from "$lib/components/Account.svelte"
    import type { McqQuestion, SaQuestion, User } from "$lib/mongo"
    export let questions: (SaQuestion | McqQuestion)[]
    export let userData: User
</script>

<svelte:head>
    <title>{userData.username}</title>
</svelte:head>

<main>
    <div id="account">
        <Account {userData} {questions} />
    </div>
    <div id="questions-wrapper">
        <div id="questions">
            {#if questions}
                {#each questions as question}
                    <QuestionPreview {question} />
                {/each}
            {/if}
        </div>
    </div>
</main>

<style lang="scss">
    #account {
        margin-top: 1.2em;
    }
    #questions-wrapper {
        width: 100%;
        display: grid;
        place-content: center;
    }

    #questions {
        margin: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        row-gap: 20px;
        column-gap: 20px;
        margin: 5em;
        width: 90vw;
        max-width: 1400px;
    }
</style>
