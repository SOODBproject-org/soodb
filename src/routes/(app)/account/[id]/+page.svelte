<script lang="ts">

    import QuestionPreview from "$lib/components/QuestionPreview.svelte"
    import Account from "$lib/components/Account.svelte"
    import type { PageData } from "./$types"

    export let data: PageData
    let { questions, userData } = data
    $: ({ questions, userData } = data)
</script>

<svelte:head>
    <title>{userData.username}</title>
</svelte:head>

<main>
    <div id="account">
        <Account {userData} {questions} />
    </div>
    <div id="questions-wrapper">
        {#if questions?.length}
            <div id="questions">
                {#each questions as question}
                    <QuestionPreview {question} />
                {/each}
            </div>
        {:else}
            <p class="no-questions">No questions written</p>
        {/if}
    </div>
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
</style>
