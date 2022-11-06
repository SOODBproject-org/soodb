/* eslint-disable @typescript-eslint/no-empty-interface */
/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
declare namespace App {
    interface Locals {
        getSession: import("@lucia-auth/sveltekit").GetSession;
		getSessionUser: import("@lucia-auth/sveltekit").GetSessionUser;
		setSession: import("@lucia-auth/sveltekit").SetSession;
		clearSession: import("@lucia-auth/sveltekit").ClearSession;
    }

    interface Platform {}

    interface Session {
        lucia: import("lucia-sveltekit/types").SvelteKitSession<import("$lib/types").UserData>
    }

    interface Stuff {}

    interface PrivateEnv extends Record<string, string> {
        DISCORD_SECRET: string
        DATABASE_APP_ID: string
        DATABASE_KEY: string
        LUCIA_SECRET: string
        GITHUB_SECRET: string
        GOOGLE_SECRET: string
        ATLAS_ENDPOINT_KEY: string
    }

    interface PublicEnv extends Record<string, string> {
        PUBLIC_HOST_URL: string
        PUBLIC_GITHUB_CLIENT_ID: string
        PUBLIC_DISCORD_CLIENT_ID: string
        PUBLIC_GOOGLE_CLIENT_ID: string
    }
}

/// <reference types="lucia-auth" />
declare namespace Lucia {
    type Auth = import("$lib/server/lucia").Auth
	type UserAttributes = import("$lib/types").UserData
}