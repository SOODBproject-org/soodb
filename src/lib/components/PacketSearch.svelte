<script lang="ts">
    import type { Packet, PacketSet } from "$lib/types"
    import Icon from "svelte-icon/Icon.svelte"
    import search from "$lib/icons/search.svg?raw"
    import Select from "svelte-select"
    import { createEventDispatcher } from "svelte"
    
    export let multi = false
    export let sets: PacketSet[] | null = null

    const dispatch = createEventDispatcher()

    let packetName: string
    let packets: Packet[] | null = null
    let rawPacketValue: Packet | null | Packet[] = multi ? [] : null
    let filter = (packet: Packet) => !sets || sets.some(s => s.packetIds.includes(packet.id))

    export const setPacket = async function(value: string | string[]) {
        if (multi && Array.isArray(value)) {
            const responses = await Promise.all(
                value.map(x => fetch(`/api/packet/${encodeURIComponent(x)}`))
            )
            if (!responses.every(x => x.ok)) return

            const results = await Promise.all(
                responses.map(x => x.json())
            )
            packets = results.filter(filter)
            console.log("packets", packets)
            rawPacketValue = results.filter(filter)
        } else if (!Array.isArray(value)) {
            const res = await fetch(`/api/packet/${encodeURIComponent(value)}`)
            if (!res.ok) return

            const result = await res.json()
            if (result && filter(result)) {
                packets = [result]
                rawPacketValue = result
                dispatch('select', result)
            }
        } else {
            throw new Error("Invalid input")
        }
    }

    export const clearPacket = () => {
        packets = null
        rawPacketValue = null
        dispatch('clear')
    }

    async function getPackets() {
        const res = await fetch(`/api/packet/search?packetName=${encodeURIComponent(packetName)}`)
        if (!res.ok) return

        const result = await res.json()
        console.log("results", result)
        console.log("sets", sets)
        if (result) {
            packets = result.filter(filter)
        }
    }

    function handleClear() {
        packetName = ""
        packets = null
        dispatch("clear")
    }

    function clearSelect() {
        packets = null
        rawPacketValue = null
    }

    $: console.log("changed sets", sets)
</script>

<div class="user-search">
    <div class="wrapper">
        <input type="text" bind:value={packetName} on:input={clearSelect} placeholder="Packet search" />
        <button type="button" class="search-button" on:click={getPackets}><Icon data={search} /></button>
    </div>
    {#if packets}
        <div class="select">
            <Select
                isMulti={multi}
                items={packets}
                optionIdentifier="id"
                labelIdentifier="name"
                isSearchable={false}
                bind:value={rawPacketValue}
                on:select
                on:clear={handleClear}
            />
        </div>
    {/if}
</div>

<style lang="scss">
    .user-search {
        max-width: min(300px, 80%);
    }

    .select {
        --inputFontSize: 20px;
        --placeholderColor: #757575;
        --background: hsl(48, 18%, 9%);
        --listBackground: hsl(48, 18%, 9%);
        --itemHoverBG: #{$accent-2};
        --multiItemBG: #{$accent-2};
        --multiItemActiveBG: #{scale($accent-2, $saturation: 20%, $lightness: -10%)};
        --itemColor: hsl(32, 30%, 87%);
        --listMaxHeight: 6em;
        --border: transparent 1.5px solid;
        --borderHoverColor: #{$accent-2};
        --borderFocusColor: #{$accent-2};
        --border-radius: 0.2em;

        font-size: 20px;
        border: none;
        margin: 0.5em 0 0.5em 1em;
        box-sizing: border-box;
        position: relative;
        text-align: left;
        font-family: "Ubuntu";

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

    button {
        @extend %button-secondary;

        margin: 0;
        box-sizing: border-box;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
</style>
