/* eslint-disable @typescript-eslint/no-empty-interface */
/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
declare namespace App {
    interface Locals {
        userData: import("$lib/mongo").User | null
    }

    interface Platform {}

    interface Session {
        userData: import("$lib/mongo").User | null
        previousQuery?: {
            authorName?: string
            keywords?: string
            types?: string[]
            categories?: string[]
            start?: string
            end?: string
        }
    }

    interface Stuff {}

    interface PrivateEnv extends Record<string, string> {
        CLIENTID: string
        SECRET: string
        DATABASE_URL: string
        DATABASE_KEY: string
    }

    interface PublicEnv extends Record<string, string> {
        HOST_URL: string
    }
}
