import lucia from "lucia-sveltekit";
import AdapterMongo from "$lib/adapter-mongo";
import { dev } from "$app/env";
import { env } from "$env/dynamic/private";
import type { UserData } from "./types";

export const auth = lucia<UserData>({
    adapter: new AdapterMongo(),
    secret: env.LUCIA_SECRET,
    env: dev ? "DEV" : "PROD",
});