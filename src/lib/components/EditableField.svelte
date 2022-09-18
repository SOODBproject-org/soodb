<script lang="ts">
    import { tick } from "svelte"
    export let value: string
    let className = ""
    export { className as class }

    let editing = false
    let wrapper: HTMLElement
    let inputElement: HTMLInputElement

    async function edit() {
        setTimeout(async () => {
            editing = true
            await tick()
            inputElement.focus()
        })
    }

    function handleClick(e: MouseEvent) {
        if (!wrapper.contains(e.target as Element)) {
            editing = false
        }
    }
</script>

<svelte:window on:click={handleClick} />

<div class={className} bind:this={wrapper}>
    {#if editing}
        <input type="text" bind:value bind:this={inputElement} />
    {:else}
        <p>{value}</p>
        <button on:click={() => edit()} />
    {/if}
</div>

<style lang="scss">
    div {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.3em;
    }

    p {
        font-size: inherit;
        padding: 0.3em;
        margin: 1.5px;
    }

    input {
        @extend %text-input;

        font-size: inherit;
        padding: 0.3em;
        margin: 0;
        width: 100%;
    }

    button {
        font-size: inherit;
        border: none;
        width: 0.75em;
        height: 0.75em;
        background: url("/pencil.png");
        background-size: contain;
        padding: 0;
        cursor: pointer;
    }
</style>
