import lucia from "lucia-sveltekit";
import AdapterMongo from "$lib/adapter-mongo";
import { dev } from "$app/env";
import { env } from "$env/dynamic/private";

export const auth = lucia({
    adapter: new AdapterMongo(),
    secret: env.LUCIA_SECRET,
    env: dev ? "DEV" : "PROD",
});