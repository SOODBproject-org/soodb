<script lang="ts">
    let username: string
    let password: string
</script>

<main>
    <h1>Login</h1>
    <form action="/api/login" method="POST">
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

    input[type="text"], input[type="password"] {
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
</style>