<script lang="ts">
    import EditQuestion from "$lib/components/EditQuestion.svelte"
    import type { PageData } from "./$types"

    export let data: PageData
    $: ({ question } = data)
</script>

<svelte:head>
    <title>Edit Question</title>
</svelte:head>

<main>
    <div id="question-wrapper">
        <EditQuestion {question} />
    </div>
</main>

<style lang="scss">
    #question-wrapper {
        width: 100%;
        text-align: center;
    }
</style>
