<script lang="ts">
    import type { DatabaseUserSafe } from "$lib/mongo"
    import type { Question } from "$lib/types"
    export let userData: DatabaseUserSafe
    export let questions: Question[]
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

    #card {
        position: relative;
        margin: auto;
        min-height: 30em;
        margin-bottom: 50px;
        background-color: $background-2;
        border-radius: 2em;
        padding: 1em;
    }
</style>
