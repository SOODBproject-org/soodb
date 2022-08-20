<script lang="ts" context="module">
    import type { Load } from "@sveltejs/kit"

    export const load: Load = async function ({ fetch, session }) {
        if (!session.lucia) {
            return {
                redirect: "/login",
                status: 302,
            }
        }

        const userRes = await fetch(`/api/user`, {
            headers: {
                Authorization: `Bearer ${session.lucia.access_token}`
            }
        })
        const userSettingsRes = await fetch(`/api/user/settings`, {
            headers: {
                Authorization: `Bearer ${session.lucia.access_token}`
            }
        })
        const questionsRes = await fetch(`/api/question?authorId=${session.lucia.user.user_id}`)
        const userData = await userRes.json() as DatabaseUserSafe
        return {
            props: {
                userData,
                userSettings: await userSettingsRes.json(),
                questions: (await questionsRes.json() as Question[]).map(
                    x => ({ ...x, authorName: userData.username })
                ),
            },
        }
    }
</script>

<script lang="ts">
    import QuestionPreview from "$lib/components/QuestionPreview.svelte"
    import AccountEdit from "$lib/components/AccountEdit.svelte"
    import type { DatabaseUserSafe, Question } from "$lib/mongo"
    import Account from "$lib/components/Account.svelte";
    export let questions: Question[]
    export let userData: DatabaseUserSafe

    let editing = false
</script>

<svelte:head>
    <title>Your Account</title>
</svelte:head>

<main>
    <div id="account">
        {#if editing}
            <AccountEdit {userData} on:save={() => editing = false} on:back={() => editing = false} />
        {:else}
            <Account {userData} {questions} />
            <button class="settings" on:click={() => editing = true}>Settings</button>
        {/if}
    </div>
    {#if questions?.length}
        <div id="questions-wrapper">
            <div id="questions">
                {#each questions as question}
                    <QuestionPreview {question} />
                {/each}
            </div>
        </div>
    {:else}
        <p class="no-questions">No questions written</p>
    {/if}
</main>

<style lang="scss">
    #account {
        margin-top: 1.2em;
        position: relative;
        margin-inline: auto;
        width: 80vw;
        max-width: 60em;
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

    .no-questions {
        text-align: center;
        font-size: 20px;
    }

    button {
        @extend %button-secondary;

        position: absolute;
        right: 1em;
        bottom: 1em;
        font-size: 20px;

        @media (max-width: 600px) {
            position: absolute;
            bottom: 1em;
            left: 1em;
            right: 1em;
            display: block;
        }
    }
</style>
