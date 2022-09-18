<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import Select from 'svelte-select'
    import { page } from "$app/stores"
    import type { DatabaseUserSafe } from "$lib/mongo";
    import UserSearch from "./UserSearch.svelte";
    import type { Category, PacketSet } from "$lib/types";
    
    // TODO: allow custom category search

    type Inputs = {
        authorId: string
        keywords: string
        set: string[]
        round: string[]
        start: string
        end: string
        types: ("MCQ" | "SA")[]
        categories: Category[]
    }
    const defaultInputs: Inputs = {
        authorId: "",
        keywords: "",
        set: [],
        round:[],
        start: "",
        end: "",
        types: [],
        categories: [],
    }
    let inputs = {...defaultInputs}

    const categoryNames = [
        {id:"bio",value:"Biology"},
        {id:"earth",value:"Earth and Space"},
        {id:"chem",value:"Chemistry"},
        {id:"math",value:"Math"},
        {id:"physics",value:"Physics"},
        {id:"energy",value:"Energy"}
    ]
    
    export let sets : PacketSet[]
    export let numQuestions: number
    const dispatch = createEventDispatcher()

    export function setQuery(query: Partial<Inputs>) {
        if (query.authorId) { 
            inputs.authorId = query.authorId
            setUser(query.authorId)
        }
        if (query.keywords) inputs.keywords = query.keywords
        if (query.set) {
            inputs.set = query.set
            rawSetValue = query.set?.map(s => sets.find(x => x.setName === s))
                .filter(x => x !== undefined) as PacketSet[]
        }
        if (query.round) inputs.round = query.round
        if (query.start) inputs.start = query.start
        if (query.end) inputs.end = query.end
        if (query.types) inputs.types = query.types
        if (query.categories) {
            inputs.categories = query.categories
            rawCategoryValue = query.categories
                .map(c => categoryNames.find(x => x.id === c))
                .filter(x => x !== undefined) as { id: string, value: string }[]
        }
    }

    async function emitQuery(pageNumber = 1) {
        dispatch("sendQuery", {
            inputs: inputs,
            pageNumber,
        })
    }

    function clearQuery() {
        inputs = {...defaultInputs}
        rawCategoryValue = []
        rawSetValue = []
        rawRoundValue = []
        clearUser()
        emitQuery()
    }

    let rawCategoryValue: { id: string, value: string }[]
    function handleCategorySelect(e: CustomEvent<{ id: string, value: string}[]>){
        if (e.detail) inputs.categories = e.detail.map((i) => i.id as Category)
        else inputs.categories = []
    }

    let rawSetValue : PacketSet[] = []
    function handleSetSelect(e: CustomEvent<PacketSet[]>){
        if (e.detail) inputs.set = e.detail.map((i) => i.setName as string)
        else inputs.set = []
    }

    let rawRoundValue : {index:number,value:string,label:string}[]
    function handleRoundSelect(e:CustomEvent<{index:number,value:string,label:string}[]>){
        if (e.detail) inputs.round = e.detail.map((i) => i.value as string)
        else inputs.set = []
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

<svelte:body
    on:keydown={(e) => {
        if (e.code === "Enter" && $page.url.pathname.startsWith("/question/")) {
            dispatch("sendQuery", {
                inputs: inputs,
            })
        }
    }} />

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
        <div class='select'>
            <Select 
                items={sets}
                labelIdentifier="setName"
                isMulti={true}
                on:select={handleSetSelect}
                placeholder="Set"
                bind:value={rawSetValue}
            />
        </div>
        <br />
        <div class='select'>
            {#if rawSetValue.length==1}
            <Select 
                items={Object.keys(rawSetValue[0].packets)}
                isMulti={true}
                placeholder="Set"
                on:select={handleRoundSelect}
                bind:value={rawRoundValue}
            />
            {/if}
        </div>
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
        <div class='select'>
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
    <!-- <button type="button">Clear Query</button> -->
    {#if numQuestions}
        <h3>{numQuestions} questions matched your query</h3>
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
        width: min(150px,40%);

        &.empty {
            color: #757575;
        }
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
        max-width: min(300px,80%);
        position: relative;
        text-align: left;
        font-family: 'Ubuntu';

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
        max-width: min(300px,80%);
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
