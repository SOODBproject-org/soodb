<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import Select from 'svelte-select'
    import { page } from "$app/stores"
    import type { Category } from "$lib/mongo";
    
    type Inputs = {
        authorName: string
        keywords: string
        start: string
        end: string
        types: ("MCQ" | "SA")[]
        categories: Category[]
    }
    let inputs: Inputs = {
        authorName: "",
        keywords: "",
        start: "",
        end: "",
        types: [],
        categories: [],
    }
    const categoryNames = [
        {id:"Biology",value:"bio"},
        {id:"Earth and Space",value:"earth"},
        {id:"Chemistry",value:"chem"},
        {id:"Math",value:"math"},
        {id:"Physics",value:"physics"},
        {id:"Energy",value:"energy"}
    ]
    
    export let numQuestions: number
    const dispatch = createEventDispatcher()

    export function setQuery(query: Partial<Inputs>) {
        if (query.authorName) inputs.authorName = query.authorName
        if (query.keywords) inputs.keywords = query.keywords
        if (query.start) inputs.start = query.start
        if (query.end) inputs.end = query.end
        if (query.types) inputs.types = query.types
        if (query.categories) inputs.categories = query.categories
    }

    async function emitQuery(pageNumber = 1) {
        dispatch("sendQuery", {
            inputs: inputs,
            pageNumber,
        })
    }

    function handleCategorySelect(e: CustomEvent<{ id: number, value: string}[]>){
        if (e.detail) inputs.categories = e.detail.map((i)=>i.value as Category)
        else inputs.categories = []
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
        <input
            type="text"
            name="author-name"
            placeholder="Author"
            id="author-input"
            bind:value={inputs.authorName}
        /><br />
        <input type="text" name="keywords" placeholder="Keywords" id="keyword-input" bind:value={inputs.keywords} /><br
        />
        <h3>Date Range:</h3>
        <input type="date" name="start-date" bind:value={inputs.start} />-
        <input type="date" name="end-date" bind:value={inputs.end} />
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
                optionIdentifier="value" 
                labelIdentifier="id"
                isMulti={true}
                on:select={handleCategorySelect} 
            />
        </div>
    </div>
    <br />
    <button type="submit">Submit Query</button>
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
        &:focus::placeholder {
            color: transparent;
        }
    }
    .select {
        --input-font-size:20px;
        --background: hsl(48, 18%, 9%);
        --listBackground:hsl(48, 18%, 9%);
        --itemHoverBG: hsl(218, 38%, 46%);
        --multiItemBG: hsl(218, 38%, 46%);
        --itemColor: hsl(32, 30%, 87%);
        --listMaxHeight: 6em;
        --border: transparent 1.5px solid;
        --border-radius: .2em;
        font-size: 20px;
        border: none;
        margin: .5em 0;        
        box-sizing: border-box;
        max-width: min(300px,80%);
        position: relative;
        text-align: left;
        font-family: 'Ubuntu';
        &:focus::placeholder {
            color: transparent;
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
    button {
        @extend %button-primary;

        font-size: 20px;
        max-width: 35ch;
    }
</style>
