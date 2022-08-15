<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import Icon from 'svelte-icon/Icon.svelte'
    import arrow from '$lib/icons/arrow.svg?raw'

    export let numPages: number
    export let pageNumber: number

    $: inputValue = pageNumber.toString()
    let previousInput = pageNumber.toString()

    let inputElement: HTMLInputElement

    const dispatch = createEventDispatcher()

    async function handleChange() {
        if (parseInt(inputValue) > numPages || parseInt(inputValue) < 1) {
            inputValue = pageNumber.toString()
        } else {
            inputValue = parseInt(inputValue).toString()
            previousInput = parseInt(inputValue).toString()
        }

        dispatch("pageChange", {
            old: pageNumber,
            new: parseInt(inputValue),
        })
        pageNumber = parseInt(inputValue)
        inputElement.blur()
    }

    function handleInput() {
        if (isNaN(parseInt(inputValue)) && inputValue !== "") {
            inputValue = previousInput
        } else {
            previousInput = inputValue
        }
    }
</script>

<div>
    {#if pageNumber > 1}
        <button
            on:click={() => {
                if (pageNumber > 1) {
                    dispatch("pageChange", {
                        old: pageNumber,
                        new: pageNumber - 1,
                    })
                    pageNumber -= 1
                }
            }}
        >
            <Icon data={arrow} class="icon" />
        </button>
    {/if}
    {#if numPages > 1}
        <input
            type="text"
            bind:this={inputElement}
            bind:value={inputValue}
            on:input={handleInput}
            on:change={handleChange}
        />
    {/if}
    {#if pageNumber < numPages}
        <button
            on:click={() => {
                if (pageNumber < numPages) {
                    dispatch("pageChange", {
                        old: pageNumber,
                        new: pageNumber + 1,
                    })
                    pageNumber += 1
                }
            }}
        >
            <Icon data={arrow} class="icon" />
        </button>
    {/if}
</div>

<style lang="scss">
    div {
        margin-top: 1em;
        text-align: center;
        font-size: 20px;
    }

    input[type="text"] {
        @extend %text-input;

        font-size: inherit;
        text-align: center;
        width: 5ch;
        margin-block: 0;
    }

    button {
        @extend %button-secondary;

        font-size: inherit;
        width: 1.8em;
        height: 1.8em;
        padding: 0.2em;
        vertical-align: middle;
        margin-block: 0;
    }

    button > :global(.icon) {
        display: inline-block;
        width: 100%;
        height: 100%;
    }
</style>
