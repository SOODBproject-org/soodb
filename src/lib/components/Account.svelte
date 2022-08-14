<script lang="ts">
    import { session } from "$app/stores"
    import { goto } from "$app/navigation"
    import type { SaQuestion, McqQuestion, DatabaseUserSafe } from "$lib/mongo"
    export let userData: DatabaseUserSafe
    export let questions: (SaQuestion | McqQuestion)[]
</script>

<div>
    <div id="card">
        <!-- <img
            id="icon"
            src={`https://cdn.discordapp.com/avatars/${userData.user_id}/${userData.avatarHash}.png`}
            alt="Profile"
        /> -->
        <h2 id="username">{userData.username}</h2>
        <p id="user-id">{userData.id}</p>
        <p>
            {#if questions}
                <h3>Question Record</h3>
                <p>Total: {questions.length}</p>
                <p>
                    Biology: {questions.filter((question) => question.category === "bio").length}
                </p>
                <p>
                    Chemistry: {questions.filter((question) => question.category === "chem").length}
                </p>
                <p>
                    Earth and Space: {questions.filter((question) => question.category === "earth").length}
                </p>
                <p>
                    Physics: {questions.filter((question) => question.category === "physics").length}
                </p>
                <p>
                    Math: {questions.filter((question) => question.category === "math").length}
                </p>
            {/if}
            {#if $session.lucia?.user.user_id === userData.id}
                <br />
                <button
                    on:click={() => {
                        goto("/account")
                    }}
                >
                    Edit
                </button>
            {/if}
        </p>
    </div>
</div>

<style lang="scss">
    h3 {
        margin-top: 1em;
        margin-bottom: 0.2em;
        font-size: 30px;
    }

    p {
        font-size: 24px;
        margin-top: 0.4em;
        margin-bottom: 0.4em;
    }

    #username {
        font-size: 40px;
        padding: 0.1em 0.3em;
        margin-bottom: 0;
        margin-top: 0.5em;

        @media (max-width: 600px) {
            text-align: center;
        }
    }

    #user-id {
        font-size: 16px;
        font-style: italic;

        @media (max-width: 600px) {
            text-align: center;
        }
    }

    #icon {
        width: 10em;
        height: 10em;
        position: absolute;
        display: block;
        right: 1em;
        border-radius: 2.5em;
        // background-image: url("https://cdn.discordapp.com/avatars/453297392608083999/297d47dc844b600551f91a0d602bf4c5.webp?size=160");

        @media (max-width: 600px) {
            position: static;
            margin: 1em auto;
        }
    }

    #card {
        position: relative;
        margin: auto;
        width: 80vw;
        max-width: 60em;
        min-height: 30em;
        margin-bottom: 50px;
        background-color: $background-2;
        border-radius: 2em;
        padding: 1em;
    }

    button {
        @extend %button-primary;

        min-width: 10ch;

        @media (max-width: 600px) {
            position: static;
            display: block;
            margin: 1em auto 0.5em;
            width: 80%;
        }
    }
</style>
