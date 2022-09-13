<script lang="ts">
    import type { DatabaseUserSafe } from "$lib/mongo"
    import { session } from "$app/stores";
    import { form as svelteForm, field } from 'svelte-forms';
    import { pattern } from 'svelte-forms/validators'
    import EditableField from "./EditableField.svelte"
    import { createEventDispatcher } from "svelte"

    const dispatch = createEventDispatcher()

    export let userData: DatabaseUserSafe
    export let error: string | undefined = undefined
    export const updateSettings = function({ username }: { username: string }) {
        initialUserData.username = username
        $usernameField.value = username
    }

    let initialUserData = userData

    let usernameTakenTimeout: NodeJS.Timeout | null = null
    async function checkUsernameTaken(value: string) {
        if (usernameTakenTimeout) {
            clearTimeout(usernameTakenTimeout)
            usernameTakenTimeout = null
        }

        return new Promise((resolve) => {
            usernameTakenTimeout = setTimeout(async () => {
                const response = await fetch(`/api/user/username/${encodeURIComponent(value)}`)
                const user = response.ok ? await response.json() : true
                resolve(!user)
            }, 700)
        }) as Promise<boolean>
    }

    const usernameField = field("username", userData.username, [
        pattern(/[\S]{6,30}/),
        (value) => ({ valid: value !== initialUserData.username, name: "usernameChanged" }),
        async (value) => ({ valid: await checkUsernameTaken(value), name: "usernameTaken" })
    ], { checkOnInit: true })
    const usernameErrors: Record<string, string> = {
        "pattern": "Username may not contain spaces and must be between 6 and 30 characters",
        "usernameTaken": "That username is already taken"
    }

    const settingsForm = svelteForm(usernameField)

    async function handleSubmit(e: SubmitEvent) {
        dispatch('save', {
            username: $usernameField.value
        })
    }
</script>

<div id="card">
    <form method="POST" action="/account" on:submit={handleSubmit}>
        <div class="username-edit">
            <EditableField bind:value={$usernameField.value} />
        </div>
        {#if $usernameField.errors.length && usernameErrors[$usernameField.errors[0]]}
            <p class="error">{usernameErrors[$usernameField.errors[0]]}</p>
        {/if}
    
        {#if error}
            <p class="error">{error}</p>
        {/if}
        <div class="buttons">
            <button class="back" on:click={() => dispatch("back")}>Back</button>
            <button class="save" type="submit" disabled={!$settingsForm.valid}>Save Changes</button>
        </div>
    </form>
</div>

<style lang="scss">
    .error {
        font-size: 16px;
        font-style: italic;
        margin-top: 0.4em;
        margin-bottom: 0.4em;
    }

    .username-edit {
        font-size: 40px;
        width: 20ch;
        max-width: calc((100% - 3em) / 1.2);

        @media (max-width: 600px) {
            display: block;
            margin-left: auto;
            margin-right: auto;
            min-width: 10ch;
            max-width: calc((100% - 1em) / 1.2);
        }
    }

    #card {
        position: relative;
        margin: auto;
        min-height: 30em;
        margin-bottom: 50px;
        background-color: $background-2;
        border-radius: 2em;
        padding: 1em;
    }

    .buttons {
        position: absolute;
        right: 1em;
        bottom: 1em;
        display: flex;
        flex-direction: row;

        @media (max-width: 600px) {
            position: static;
            margin: 1em auto 0.5em;
            width: 80%;
            flex-direction: column;
        }
    }

    .save {
        @extend %button-primary;

        font-size: 20px;        
    }

    .back {
        @extend %button-secondary;

        font-size: 20px;
    }
</style>
