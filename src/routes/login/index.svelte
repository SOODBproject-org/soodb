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
        <button type="button" class="discord" on:click={() => goto(`https://discord.com/api/oauth2/authorize?response_type=code&client_id=${env.PUBLIC_DISCORD_CLIENT_ID}&scope=identify%20guilds.join&redirect_uri=${encodeURIComponent(env.PUBLIC_HOST_URL + "/api/discord")}&prompt=consent`)}>
            <span class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="71" height="55" viewBox="0 0 71 55" fill="none">
                    <g clip-path="url(#clip0)">
                        <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
                    </g>
                    <defs>
                        <clipPath id="clip0">
                            <rect width="71" height="55" fill="currentColor"/>
                        </clipPath>
                    </defs>
                </svg>
            </span>
            <span class="text">
                Sign in with Discord
            </span>
        </button>
        <button type="button" class="google" on:click={() => goto(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.PUBLIC_HOST_URL + "/api/google")}&response_type=code&scope=${encodeURIComponent("openid email profile")}`)}>
            <span class="icon">
                <svg id="eFAD9Bf5e2T1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 150 150" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
                    <g transform="matrix(1.417482 0 0 1.417482-31.328867-31.309915)">
                        <path d="M120,76.1c0-3.1-.3-6.3-.8-9.3h-43.3v17.7h24.8c-1,5.7-4.3,10.7-9.2,13.9l14.8,11.5C115,101.8,120,90,120,76.1v0Z" fill="#4280ef"/>
                        <path d="M75.9,120.9c12.4,0,22.8-4.1,30.4-11.1L91.5,98.4c-4.1,2.8-9.4,4.4-15.6,4.4-12,0-22.1-8.1-25.8-18.9L34.9,95.6c7.8,15.5,23.6,25.3,41,25.3Z" fill="#34a353"/>
                        <path d="M50.1,83.8c-1.9-5.7-1.9-11.9,0-17.6L34.9,54.4c-6.5,13-6.5,28.3,0,41.2L50.1,83.8Z" fill="#f6b704"/>
                        <path d="M75.9,47.3c6.5-.1,12.9,2.4,17.6,6.9L106.6,41c-8.3-7.8-19.3-12-30.7-11.9-17.4,0-33.2,9.8-41,25.3L50.1,66.2c3.7-10.9,13.8-18.9,25.8-18.9Z" fill="#e54335"/>
                    </g>
                </svg>
            </span>
            <span class="text">
                Sign in with Google
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
    }

    .github {
        background-color: $background-2;
        width: 25ch;
        margin: 0.25em;

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

    .discord {
        background-color: #5865f2;
        width: 25ch;
        margin: 0.25em;

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

    .google {
        background-color: #fff;
        color: rgb(32, 33, 36);
        width: 25ch;
        margin: 0.25em;

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