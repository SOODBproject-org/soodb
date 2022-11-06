<script lang="ts">
    import Set from "$lib/components/Set.svelte"
    import type { PageData } from "./$types"

    export let data: PageData
    $: sets = data.sets || []
</script>

<main>
    {#each sets as s}
        <Set bind:set={s} />
    {/each}
</main>

<style lang="scss">
</style>
