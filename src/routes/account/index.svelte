<script lang="ts" context="module">
    import type { Load } from "@sveltejs/kit"

    export const load: Load = async function ({ fetch, session }) {
        if (!session.lucia) {
            return {
                redirect: "/login",
                status: 302,
            }
        }

        const userRes = await fetch(`/api/user/${session.lucia.user.user_id}`)
        const userSettingsRes = await fetch(`/api/user/${session.lucia.user.user_id}/settings`)
        const questionsRes = await fetch(`/api/questions?authorId=${session.lucia.user.user_id}`)
        const questions = await questionsRes.json()
        return {
            props: {
                userData: await userRes.json(),
                userSettings: await userSettingsRes.json(),
                questions,
            },
        }
    }
</script>

<script lang="ts">
    import QuestionPreview from "$lib/components/QuestionPreview.svelte"
    import AccountEdit from "$lib/components/AccountEdit.svelte"
    import type { Question, UserData, UserSettings } from "$lib/mongo"
    import type { User } from "lucia-sveltekit/types";
    export let questions: Question[]
    export let userData: User<UserData>
    export let userSettings: UserSettings
</script>

<svelte:head>
    <title>Your Account</title>
</svelte:head>

<main>
    <div id="account">
        <AccountEdit bind:userData bind:userSettings bind:questions />
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
