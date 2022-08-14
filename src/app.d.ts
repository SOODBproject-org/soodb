/* eslint-disable @typescript-eslint/no-empty-interface */
/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
declare namespace App {
    interface Locals {
        
    }

    interface Platform {}

    interface Session {
        lucia: import("lucia-sveltekit/types").SvelteKitSession<import("$lib/mongo").UserData>
    }

    interface Stuff {}

    interface PrivateEnv extends Record<string, string> {
        CLIENTID: string
        SECRET: string
        DATABASE_APP_ID: string
        DATABASE_KEY: string
        LUCIA_SECRET: string
    }

    interface PublicEnv extends Record<string, string> {
        HOST_URL: string
    }
}
