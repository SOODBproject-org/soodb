<script lang="ts">
    import { goto } from "$app/navigation"
    import { env } from "$env/dynamic/public"
    import Icon from "$lib/components/Icon.svelte"
    import githubIcon from "$lib/icons/github.svg?raw"
    import discordIcon from "$lib/icons/discord.svg?raw"
    import googleIcon from "$lib/icons/google.svg?raw"

    let username: string
    let password: string
    let confirmPassword: string
</script>

<main>
    <h1>Sign up</h1>
    <form action="/api/signup" method="POST">
        <button
            type="button"
            class="github"
            on:click={() =>
                goto(
                    `https://github.com/login/oauth/authorize?client_id=${
                        env.PUBLIC_GITHUB_CLIENT_ID
                    }&scope=${encodeURIComponent("user:email read:user")}`
                )}
        >
            <Icon data={githubIcon} class="github-icon" />
            <span class="text"> Sign in with Github </span>
        </button>
        <button
            type="button"
            class="discord"
            on:click={() =>
                goto(
                    `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${
                        env.PUBLIC_DISCORD_CLIENT_ID
                    }&scope=identify%20guilds.join&redirect_uri=${encodeURIComponent(
                        env.PUBLIC_HOST_URL + "/api/discord"
                    )}&prompt=consent`
                )}
        >
            <Icon data={discordIcon} class="discord-icon" />
            <span class="text"> Sign in with Discord </span>
        </button>
        <button
            type="button"
            class="google"
            on:click={() =>
                goto(
                    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
                        env.PUBLIC_GOOGLE_CLIENT_ID
                    }&redirect_uri=${encodeURIComponent(
                        env.PUBLIC_HOST_URL + "/api/google"
                    )}&response_type=code&scope=${encodeURIComponent("openid email profile")}`
                )}
        >
            <Icon data={googleIcon} class="google-icon" />
            <span class="text"> Sign in with Google </span>
        </button>
        <div class="separator">
            <div class="line" />
            <span>OR</span>
            <div class="line" />
        </div>
        <input type="text" name="username" placeholder="Username" bind:value={username} />
        <input
            type="password"
            name="password"
            placeholder="Password"
            autocomplete="new-password"
            bind:value={password}
        />
        <input
            type="password"
            name="confirm-password"
            placeholder="Confirm Password"
            autocomplete="new-password"
            bind:value={confirmPassword}
        />
        <button type="submit" disabled={!username || !password || password !== confirmPassword}>Sign up</button>
        <p>Already have an account? <a href="/login">Login</a></p>
    </form>
</main>

<style lang="scss">
    form {
        margin: 0 auto 3em;
        text-align: center;
        padding: 1em;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 50em;
        max-width: 85vw;
    }

    h1 {
        font-size: 44px;
        text-decoration: underline $accent-2 3px;
        text-underline-offset: 0.2em;
        color: $text-light;
        text-align: center;
    }

    input[type="text"],
    input[type="password"] {
        @extend %text-input;

        font-size: 24px;
        width: 25ch;
        max-width: 80vw;
        text-align: center;
    }

    button {
        @extend %button-primary;

        font-size: 22px;
        margin-top: 1em;
    }

    .separator {
        font-size: 24px;
        display: grid;
        gap: 1ch;
        width: 25ch;
        max-width: 80vw;
        grid-template-columns: 1fr auto 1fr;
    }

    .line {
        display: inline-block;
        width: 100%;
        height: 100%;
        position: relative;

        &::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 1px;
            background: $text-light;
        }
    }

    button {
        @extend %button-primary;

        font-size: 24px;
    }

    .github {
        background-color: $background-2;
        width: 25ch;
        margin: 0.25em;

        > :global(.github-icon) {
            display: inline-block;
            width: 1.1em;
            height: 1.1em;
            vertical-align: top;
            margin-right: 0.5em;
            overflow: visible;
        }

        > .text {
            display: inline-block;
            font-size: 0.8em;
        }
    }

    .discord {
        background-color: #5865f2;
        width: 25ch;
        margin: 0.25em;

        > :global(.discord-icon) {
            display: inline-block;
            width: 1.1em;
            height: 1.1em;
            vertical-align: top;
            margin-right: 0.5em;
        }

        > .text {
            display: inline-block;
            font-size: 0.8em;
        }
    }

    .google {
        background-color: #fff;
        color: rgb(32, 33, 36);
        width: 25ch;
        margin: 0.25em;

        > :global(.google-icon) {
            display: inline-block;
            width: 1.1em;
            height: 1.1em;
            vertical-align: top;
            margin-right: 0.5em;
        }

        > .text {
            display: inline-block;
            font-size: 0.8em;
        }
    }
</style>
