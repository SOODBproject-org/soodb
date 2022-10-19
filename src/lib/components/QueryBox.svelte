<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import Select from "svelte-select"
    import type { DatabaseUserSafe } from "$lib/mongo"
    import PacketSearch from './PacketSearch.svelte'
    import SetSearch from "./SetSearch.svelte"
    import UserSearch from "./UserSearch.svelte"
    import type { Category, Packet, PacketSet } from "$lib/types"

    // TODO: allow custom category search

    type Inputs = {
        authorId: string
        keywords: string
        setIds: string[]
        packetIds: string[]
        packetName: string
        start: string
        end: string
        types: ("MCQ" | "SA")[]
        categories: Category[]
    }
    const defaultInputs: Inputs = {
        authorId: "",
        keywords: "",
        setIds: [],
        packetIds: [],
        packetName: "",
        start: "",
        end: "",
        types: [],
        categories: [],
    }
    let inputs = { ...defaultInputs }

    const categoryNames = [
        { id: "bio", value: "Biology" },
        { id: "earth", value: "Earth and Space" },
        { id: "chem", value: "Chemistry" },
        { id: "math", value: "Math" },
        { id: "physics", value: "Physics" },
        { id: "energy", value: "Energy" },
    ]

    export let questionCount = ""
    const dispatch = createEventDispatcher()

    export function setQuery(query: Partial<Inputs>) {
        if (query.authorId) {
            inputs.authorId = query.authorId
            setUser(query.authorId)
        }
        if (query.keywords) inputs.keywords = query.keywords
        if (query.setIds) {
            inputs.setIds = query.setIds
            setPacketSet(query.setIds)
        }
        if (query.packetIds) {
            inputs.packetIds = query.packetIds
            setPacket(query.packetIds)
        }
        if (query.start) inputs.start = query.start
        if (query.end) inputs.end = query.end
        if (query.types) inputs.types = query.types
        if (query.categories) {
            inputs.categories = query.categories
            rawCategoryValue = query.categories
                .map((c) => categoryNames.find((x) => x.id === c))
                .filter((x) => x !== undefined) as { id: string; value: string }[]
        }
    }

    async function emitQuery(pageNumber = 1) {
        dispatch("sendQuery", {
            inputs,
            pageNumber,
        })
    }

    function clearQuery() {
        inputs = { ...defaultInputs }
        rawCategoryValue = []
        clearUser()
        clearPacketSet()
        selectedSets = null
        clearPacket()
        emitQuery()
    }

    let rawCategoryValue: { id: string; value: string }[]
    function handleCategorySelect(e: CustomEvent<{ id: string; value: string }[]>) {
        if (e.detail) inputs.categories = e.detail.map((i) => i.id as Category)
        else inputs.categories = []
    }

    let setPacketSet: (setId: string | string[]) => Promise<void>
    let clearPacketSet: () => void
    let selectedSets: PacketSet[] | null = null
    function handleSetSelect(e: CustomEvent<PacketSet[]>) {
        console.log('sets selected')
        selectedSets = e.detail
        inputs.setIds = e.detail.map(x => x.id)
    }

    function handleSetClear() {
        inputs.setIds = []
        selectedSets = null
    }

    let setPacket: (packetId: string | string[]) => Promise<void>
    let clearPacket: () => void
    function handlePacketSelect(e: CustomEvent<Packet[]>) {
        inputs.packetIds = e.detail.map(x => x.id)
    }

    function handlePacketClear() {
        inputs.packetIds = []
    }

    let setUser: (userId: string) => Promise<void>
    let clearUser: () => void
    function handleUserSelect(e: CustomEvent<DatabaseUserSafe>) {
        inputs.authorId = e.detail.id
    }

    function handleUserClear() {
        inputs.authorId = defaultInputs.authorId
    }
</script>

<form
    id="query"
    on:submit={(e) => {
        e.preventDefault()
        emitQuery()
    }}
>
    <div style="display: inline-block; text-align: left;">
        <UserSearch bind:setUser bind:clearUser on:select={handleUserSelect} on:clear={handleUserClear} />
        <br />
        <input type="text" name="keywords" placeholder="Keywords" id="keyword-input" bind:value={inputs.keywords} />
        <br />
        <SetSearch multi bind:setPacketSet bind:clearPacketSet
            on:select={handleSetSelect} on:clear={handleSetClear} />
        <br />
        <PacketSearch multi sets={selectedSets} bind:setPacket bind:clearPacket
            on:select={handlePacketSelect} on:clear={handlePacketClear} />
        <br />
        <h3>Date Range:</h3>
        <input type="date" name="start-date" bind:value={inputs.start} class:empty={!inputs.start} />-
        <input type="date" name="end-date" bind:value={inputs.end} class:empty={!inputs.end} />
    </div>
    <div class="radio-wrapper">
        <h3>Type</h3>
        <label for="multiple-choice">
            <input id="multiple-choice" type="checkbox" name="type" value="MCQ" bind:group={inputs.types} />
            <span />
            Multiple Choice
        </label>
        <br />
        <label for="short-answer">
            <input id="short-answer" type="checkbox" name="type" value="SA" bind:group={inputs.types} />
            <span />
            Short Answer
        </label>
    </div>
    <br />
    <div class="checkbox-wrapper">
        <h3>Categories</h3>
        <div class="select">
            <Select
                items={categoryNames}
                optionIdentifier="id"
                labelIdentifier="value"
                isMulti={true}
                isSearchable={false}
                placeholder="Category"
                on:select={handleCategorySelect}
                bind:value={rawCategoryValue}
            />
        </div>
    </div>
    <br />
    <button type="submit" class="submit">Submit Query</button>
    <button type="button" class="clear" on:click={clearQuery}>Clear Query</button>
    {#if questionCount}
        <h3>{questionCount} questions matched your query</h3>
    {/if}
</form>

<style lang="scss">
    #query {
        display: flex;
        flex-direction: column;
        padding: 1em;
    }
    input[type="date"] {
        @extend %text-input;
        font-size: 20px;
        width: min(150px, 40%);

        &.empty {
            color: #757575;
        }
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
        margin: 0.5em 0;
        box-sizing: border-box;
        max-width: min(300px, 80%);
        position: relative;
        text-align: left;
        font-family: "Ubuntu";

        & :global(.listContainer) {
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

    input[type="text"] {
        @extend %text-input;

        font-size: 20px;
        max-width: min(300px, 80%);
    }

    h3 {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }

    .checkbox-wrapper {
        text-align: left;
        display: inline-block;
    }

    label {
        @extend %checkbox-label;
    }

    .submit {
        @extend %button-primary;

        font-size: 20px;
        max-width: 35ch;
    }

    .clear {
        @extend %button-secondary;

        font-size: 20px;
        max-width: 35ch;
    }
</style>
