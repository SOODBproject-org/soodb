<script lang="ts">
    import { createEventDispatcher } from "svelte"
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
        disabled={pageNumber === 1}
    >
        <span />
    </button>
    <input
        type="text"
        bind:this={inputElement}
        bind:value={inputValue}
        on:input={handleInput}
        on:change={handleChange}
    />
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
        disabled={pageNumber === numPages}
    >
        <span style="transform: scaleX(-1)" />
    </button>
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
    }

    button {
        @extend %button-secondary;

        font-size: inherit;
        width: 1.7em;
        height: 1.7em;
        padding: 0.2em;
        vertical-align: middle;

        span {
            background-image: url("/arrow.svg");
            background-size: cover;
            width: 100%;
            height: 100%;
            display: block;
        }
    }
</style>
