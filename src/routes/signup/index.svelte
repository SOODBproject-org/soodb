<script lang="ts">
    let username: string
    let password: string
    let confirmPassword: string
</script>

<main>
    <h1>Sign up</h1>
    <form action="/api/signup" method="POST">
        <input type="text" name="username" placeholder="Username" bind:value={username} />
        <input type="password" name="password" placeholder="Password" autocomplete="new-password" bind:value={password} />
        <input type="password" name="confirm-password" placeholder="Confirm Password" autocomplete="new-password" bind:value={confirmPassword} />
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