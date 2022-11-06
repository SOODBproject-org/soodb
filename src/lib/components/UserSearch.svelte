<script lang="ts">
    import type { DatabaseUserSafe } from "$lib/server/mongo"
    import Icon from "$lib/components/Icon.svelte"
    import search from "$lib/icons/search.svg?raw"
    import Select from "svelte-select"
    import { createEventDispatcher } from "svelte"

    const dispatch = createEventDispatcher()

    let username: string
    let users: DatabaseUserSafe[] | null = null
    let rawUserValue: DatabaseUserSafe | null

    export const setUser = async function (userId: string) {
        const res = await fetch(`/api/user/${encodeURIComponent(userId)}`)
        if (!res.ok) return

        const result = await res.json()
        if (result) {
            users = [result]
            rawUserValue = result
            dispatch('select', result)
        }
    }

    export const clearUser = () => {
        users = null
        rawUserValue = null
        dispatch('clear')
    }

    async function getUsers() {
        const res = await fetch(`/api/user/search?username=${encodeURIComponent(username)}`)
        const result = await res.json()
        if (result) {
            users = result
        }
    }

    function handleClear() {
        username = ""
        users = null
        dispatch("clear")
    }

    function clearSelect() {
        users = null
        rawUserValue = null
    }
</script>

<div class="user-search">
    <div class="wrapper">
        <input
            type="text"
            bind:value={username}
            on:input={clearSelect}
            placeholder="User search"
        />
        <button type="button" class="search-button" on:click={getUsers}><Icon data={search} /></button>
    </div>
    {#if users}
        <div class="select">
            <Select
                items={users}
                optionIdentifier="id"
                labelIdentifier="username"
                isSearchable={false}
                bind:value={rawUserValue}
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
