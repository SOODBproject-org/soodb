<script lang="ts">
    import { goto } from "$app/navigation";
    import { env } from "$env/dynamic/public"

    let username: string
    let password: string
</script>

<main>
    <h1>Login</h1>
    <form action="/api/login" method="POST">
        <button type="button" class="github" on:click={() => goto(`https://github.com/login/oauth/authorize?client_id=${env.PUBLIC_GITHUB_CLIENT_ID}&scope=${encodeURIComponent("user:email read:user")}`)}>
            <span class="icon">
                <svg aria-label="github" height="20" viewBox="0 0 14 14" width="20"><path d="M7 .175c-3.872 0-7 3.128-7 7 0 3.084 2.013 5.71 4.79 6.65.35.066.482-.153.482-.328v-1.181c-1.947.415-2.363-.941-2.363-.941-.328-.81-.787-1.028-.787-1.028-.634-.438.044-.416.044-.416.7.044 1.071.722 1.071.722.635 1.072 1.641.766 2.035.59.066-.459.24-.765.437-.94-1.553-.175-3.193-.787-3.193-3.456 0-.766.262-1.378.721-1.881-.065-.175-.306-.897.066-1.86 0 0 .59-.197 1.925.722a6.754 6.754 0 0 1 1.75-.24c.59 0 1.203.087 1.75.24 1.335-.897 1.925-.722 1.925-.722.372.963.131 1.685.066 1.86.46.48.722 1.115.722 1.88 0 2.691-1.641 3.282-3.194 3.457.24.219.481.634.481 1.29v1.926c0 .197.131.415.481.328C11.988 12.884 14 10.259 14 7.175c0-3.872-3.128-7-7-7z" fill="currentColor" fill-rule="nonzero"></path></svg>
            </span>
            <span class="text">
                Sign in with Github
            </span>
        </button>
        <div class="separator">
            <div class="line" />
            <span>OR</span>
            <div class="line" />
        </div>
        <input type="text" name="username" placeholder="Username" bind:value={username} />
        <input type="password" name="password" placeholder="Password" bind:value={password} />
        <button type="submit" disabled={!username || !password}>Login</button>
        <p>No account? <a href="/signup">Sign up</a></p>
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
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 1px;
            background: $text-light;
        }
    }

    input[type="text"], input[type="password"] {
        @extend %text-input;

        font-size: 24px;
        width: 25ch;
        max-width: 80vw;
        text-align: center;
    }

    button {
        @extend %button-primary;

        font-size: 24px;
        margin-top: 1em;
    }

    .github {
        background-color: $background-2;
        width: 25ch;

        > .icon {
            display: inline-block;
            width: 1.1em;
            height: 1.1em;
            vertical-align: top;
            margin-right: 0.5em;

            > svg {
                width: 100%;
                height: 100%;
            }
        }

        > .text {
            display: inline-block;
            font-size: 0.8em;
        }
    }
</style>