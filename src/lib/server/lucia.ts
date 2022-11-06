import lucia from "lucia-auth"
import AdapterMongo from "$lib/server/adapter-mongo"
import { collections } from "./mongo";
import { dev } from "$app/environment"

export const auth = lucia({
	adapter: AdapterMongo(collections), // TODO: initialize Prisma client
	env: dev ? "DEV" : "PROD",
	transformUserData: d => d
});

export type Auth = typeof auth;
