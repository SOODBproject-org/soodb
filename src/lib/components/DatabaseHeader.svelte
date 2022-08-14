<script lang="ts">
    import { session } from "$app/stores"
    import { slide } from "svelte/transition"
    import { signOut } from 'lucia-sveltekit/client'

    let menuOpen = false

    async function logout() {
        await signOut()
        window.location.href = "/write"
    }
</script>

<div id="header">
    <div class="center">
        <h1 id="title">SOODB</h1>
        <nav>
            <ul>
                <li><a href="/question-search" sveltekit:prefetch>Search</a></li>
                <!-- Do not prefetch write or URL will get changed -->
                <li><a href="/write">Write</a></li>
                <li><a href="/packet-submit" sveltekit:prefetch>Packet Submit</a></li>
                {#if $session.lucia}
                    <li><a href="/account" sveltekit:prefetch>Account</a></li>
                    <li><button class="logout" on:click={logout}>Logout</button></li>
                {:else}
                    <li><a href="/login" sveltekit:prefetch>Login</a></li>
                {/if}
            </ul>
        </nav>
    </div>
    <div class="mobile">
        <h1 id="title">SOODB</h1>
        <button class="menu-button" on:click={() => (menuOpen = !menuOpen)} />
    </div>
    {#if menuOpen}
        <nav class="mobile-menu" transition:slide>
            <ul>
                {#if $session.lucia}
                    <li><a href="/account" sveltekit:prefetch>Account</a></li>
                    <li><button class="logout" on:click={logout}>Logout</button></li>
                {:else}
                    <li><a href="/login">Login</a></li>
                {/if}
                <li><a href="/question-search" sveltekit:prefetch>Search</a></li>
                <!-- Do not prefetch write or URL will get changed -->
                <li><a href="/write">Write</a></li>
                <li><a href="/packet-submit" sveltekit:prefetch>Packet Submit</a></li>
            </ul>
        </nav>
    {/if}
</div>

<style lang="scss">
    #header {
        background: $background-2;
        position: sticky;
        top: 0;
        padding-inline: 10vw;
        z-index: 5;
        border-bottom: 1px solid #777;
    }

    .center {
        max-width: max(850px, 80vw);
        margin: auto;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0.3em;
    }

    .mobile {
        display: none;
    }

    .mobile-menu {
        display: none;
    }

    h1 {
        color: $text-light;
        display: inline-block;
        font-size: 24px;
    }

    nav {
        max-width: min(60%, 50ch);
        width: 100%;
        margin-left: auto;

        ul {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-evenly;
            list-style: none;
            padding: 0;
            gap: 3ch;
        }
    }

    a {
        text-decoration: none;
        color: inherit;
        font-size: 18px;
        white-space: nowrap;
    }

    .logout {
        @extend %button-secondary;

        font-size: inherit;
        margin: 0;
    }

    @media (max-width: 600px) {
        #header {
            padding-inline: 5vw;
        }

        .center {
            display: none;
        }

        .mobile {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0.3em;
            width: 100%;
        }

        .menu-button {
            width: 1.5em;
            height: 1.5em;
            margin-left: auto;
        }

        .mobile-menu {
            display: block;
            margin: 0;
            width: 100%;
            max-width: 100%;
            overflow: hidden;

            ul {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: space-around;
                margin-top: 0;
                gap: 3ch;

                > * {
                    flex-grow: 1;
                    text-align: center;
                    margin: 0.4em 0;
                }
            }
        }
    }
</style>
