import { sequence } from "@sveltejs/kit/hooks"
import { auth } from "$lib/lucia"

export const handle = sequence(auth.handleAuth)

export const getSession = auth.getAuthSession
