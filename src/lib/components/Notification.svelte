<script lang="ts">
    import Icon from "$lib/components/Icon.svelte"
    import { fly, fade } from "svelte/transition"
    import close from '$lib/icons/close.svg?raw'

    export let title: string
    export let text: string | null = null
    export let shown = true
</script>

{#if shown}
    <div class="notification" in:fly={{ x: 100 }} out:fade>
        <div class="wrapper">
            <div class="close" on:click={() => shown = false}>
                <Icon data={close} class="close-icon" />
            </div>
            <p class="title">{title}</p>
            {#if text}
                <p class="text">{text}</p>
            {/if}
        </div>
    </div>
{/if}

<style lang="scss">
    .notification {
        position: fixed;
        right: clamp(1em, 2vw, 4em);
        bottom: clamp(1em, 2vw, 4em);
        background: $background-2;
        padding: 1em;
        border-radius: 1em;

        :global(.close-icon) {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 1em;
            height: 1em;
            cursor: pointer;
        }
    }

    .wrapper {
        position: relative;
    }

    .title {
        font-size: 22px;
        margin-top: 0;
        margin-bottom: 0.5em;
    }

    .text {
        font-size: 18px;
        margin: 0;
    }
</style>
