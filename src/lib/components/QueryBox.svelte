<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import type { Category } from "$lib/mongo"
    import Cookie from "js-cookie"
    import { page } from "$app/stores"

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
        <h3>Start Date:</h3>
        <input type="date" name="start-date" bind:value={inputs.start} /><br />
        <h3>End Date:</h3>
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
        <label for="bio">
            <input type="checkbox" id="bio" name="category" value="bio" bind:group={inputs.categories} />
            <span />
            Biology
        </label> <br />
        <label for="earth">
            <input type="checkbox" id="earth" name="category" value="earth" bind:group={inputs.categories} />
            <span />
            Earth and Space
        </label> <br />
        <label for="chem">
            <input type="checkbox" id="chem" name="category" value="chem" bind:group={inputs.categories} />
            <span />
            Chemistry
        </label> <br />
        <label for="physics">
            <input type="checkbox" id="physics" name="category" value="physics" bind:group={inputs.categories} />
            <span />
            Physics
        </label> <br />
        <label for="math">
            <input type="checkbox" id="math" name="category" value="math" bind:group={inputs.categories} />
            <span />
            Math
        </label> <br />
        <label for="energy">
            <input type="checkbox" id="energy" name="category" value="energy" bind:group={inputs.categories} />
            <span />
            Energy
        </label> <br />
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
        padding: 0.3em;
        font-size: 20px;
        margin: 0.5em auto;
        border: none;
        border-radius: 0.3em;
        box-sizing: border-box;
        max-width: min(80vw, 90%);
        text-align: left;
        position: relative;
        &:focus::placeholder {
            color: transparent;
        }
    }

    input[type="text"] {
        @extend %text-input;

        font-size: 20px;
        max-width: 80%;
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
