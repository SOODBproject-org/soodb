<script lang="ts">
    import type { PacketSet } from "$lib/types";
    import Icon from "svelte-icon/Icon.svelte";
    import search from '$lib/icons/search.svg?raw'
    import Select from 'svelte-select'
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()

    let setName: string
    let sets: PacketSet[] | null = null
    let rawSetValue: PacketSet | null

    export async function setPacketSet(setId: string) {
        const res = await fetch(`/api/set/${encodeURIComponent(setId)}`)
        const result = await res.json()
        if (result) {
            sets = [ result ]
            rawSetValue = result
        }
    }

    export const clearPacketSet = () => {
        sets = null
        rawSetValue = null
    }

    async function getSets() {
        const res = await fetch(`/api/set/search?setName=${encodeURIComponent(setName)}`)
        const result = await res.json()
        if (result) {
            sets = result
        }
    }

    function handleClear() {
        setName = ""
        sets = null
        dispatch('clear')
    }

    function clearSelect() {
        sets = null
        rawSetValue = null
    }
</script>

<div class="user-search">
    <div class="wrapper">
        <input type="text" bind:value={setName} on:input={clearSelect} placeholder="Set search" class:grayed={!!sets} />
        <button type="button" class="search-button" on:click={getSets}><Icon data={search} /></button>
    </div>
    {#if sets}
        <div class="select">
            <Select
                items={sets}
                optionIdentifier="id"
                labelIdentifier="name"
                isSearchable={false}
                bind:value={rawSetValue}
                on:select
                on:clear={handleClear}
            />
        </div>
    {/if}
</div>

<style lang="scss">
    .user-search {
        max-width: min(300px,80%);
    }

    .select {
        --inputFontSize: 20px;
        --placeholderColor: #757575;
        --background: hsl(48, 18%, 9%);
        --listBackground:hsl(48, 18%, 9%);
        --itemHoverBG: #{$accent-2};
        --multiItemBG: #{$accent-2};
        --multiItemActiveBG: #{scale($accent-2, $saturation: 20%, $lightness: -10%)};
        --itemColor: hsl(32, 30%, 87%);
        --listMaxHeight: 6em;
        --border: transparent 1.5px solid;
        --borderHoverColor: #{$accent-2};
        --borderFocusColor: #{$accent-2};
        --border-radius: .2em;

        font-size: 20px;
        border: none;
        margin: .5em 0;        
        box-sizing: border-box;
        position: relative;
        text-align: left;
        font-family: 'Ubuntu';
    
        :global(.listContainer) {
            @include vertical-scrollable(7px);

            &::-webkit-scrollbar-track-piece:start {
                margin-top: 0.2em;
            }
            
            &::-webkit-scrollbar-track-piece:end {
                margin-bottom: 0.2em;
            }

            overscroll-behavior: contain;
        }
    }

    .wrapper {
        display: flex;
        flex-direction: row;
    }

    input {
        @extend %text-input;

        font-size: 20px;
        margin: 0;
        width: 100%;
        box-sizing: border-box;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    .grayed {
        color: #757575;
    }

    button {
        @extend %button-secondary;

        margin: 0;
        box-sizing: border-box;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
</style>