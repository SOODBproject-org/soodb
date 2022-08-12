<script lang="ts">
    import { fly, fade } from "svelte/transition"

    export let title: string
    export let text: string | null = null
    export let shown = true

    // TODO: X button
</script>

{#if shown}
    <div class="notification" in:fly={{ x: 100 }} out:fade>
        <p class="title">{title}</p>
        {#if text}
            <p class="text">{text}</p>
        {/if}
    </div>
{/if}

<style lang="scss">
    .notification {
        position: fixed;
        right: 1em;
        bottom: 1em;
        background: $background-2;
        padding: 1em;
        border-radius: 1em;
    }

    .title {
        font-size: 18px;
        margin-top: 0;
        margin-bottom: 0.5em;
    }

    .text {
        font-size: 14px;
        margin: 0;
    }
</style>
