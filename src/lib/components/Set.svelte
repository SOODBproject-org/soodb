<script lang="ts">
    import Icon from "$lib/components/Icon.svelte"
    import type { PacketSet,Packet } from "$lib/types"
    import arrow from "$lib/icons/arrow.svg?raw"
    export let set: PacketSet
    let open = false
</script>

<main class:opened={open}>
    <h1 class="toggle-menu" on:click={() => (open = !open)}><Icon data={arrow} class="icon" /> {set.name}</h1>
    {#if open}
        {#each set.packets as p}
            <p>{p.name} ({p.questionIds.length} questions)</p>
        {/each}
    {/if}
</main>

<style lang="scss">
    main {
        background-color: $background-2;
        padding: 0.5em 1em 0.5em 2em;
        margin: 20px;
        border-radius: 1em;

        &.opened {
            :global(.icon) {
                transition: 0.2s ease-in-out;
                transform: rotate(270deg);
            }
        }
    }
    h1 > :global(.icon) {
        transition: 0.2s ease-in-out;
        transform: rotate(180deg);
    }
</style>
