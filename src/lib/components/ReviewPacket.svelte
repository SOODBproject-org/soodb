<script lang="ts">
    import type { NewQuestionData } from "$lib/server/mongo"
    import { createEventDispatcher } from "svelte"
    import PacketQuestionPreview from "./PacketQuestionPreview.svelte"

    export let questions: (NewQuestionData & { number?: number })[]
    export let chooseSet: "new" | "existing" | "none" = "none"
    export let setName: string
    export let packetName: string
    export let created: Date = new Date()

    const createdDateString = Intl.DateTimeFormat(Intl.DateTimeFormat().resolvedOptions().locale)
        .format(created)

    const dispatch = createEventDispatcher()

    function handleSubmit() {
        dispatch('submit')
    }

    function back() {
        dispatch('back')
    }
</script>

<div class="review-packet">
    <h1>Review Packet</h1>
    <h2 class="packet-name">{packetName}</h2>
    <span class="packet-metadata">
        {#if setName && chooseSet !== "none"}
            {#if chooseSet === "new"}
                <span class="new-indicator">(New)</span>
            {/if}
            {setName} -
        {/if}
        {createdDateString}
    </span>
    <div style:text-align="right">
        <button on:click={back} class="back">Back to Edit</button>
    </div>
    <div class="questions">
        {#each questions as q}
            <PacketQuestionPreview bind:question={q} showImage />
        {/each}
    </div>
    <button on:click={back} class="back">Back to Edit</button>
    <button on:click={handleSubmit} class="submit">Submit Packet</button>
</div>

<style lang="scss">
    .review-packet {
        grid-column: 1 / 3;
    }

    h1 {
        font-size: 32px;
        text-decoration: underline $accent-2 3px;
        text-underline-offset: 0.2em;
        text-align: center;
    }

    h2 {
        font-size: 30px;
        margin-bottom: 0.25em;
    }

    .packet-metadata {
        font-size: 18px;
        opacity: 0.9;
        padding-left: 2em;
    }

    .questions {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        row-gap: 20px;
        column-gap: 20px;
        margin-top: 2em;
    }

    button {
        font-size: 24px;
    }

    .back {
        @extend %button-secondary;
    }

    .submit {
        @extend %button-primary;
    }
</style>