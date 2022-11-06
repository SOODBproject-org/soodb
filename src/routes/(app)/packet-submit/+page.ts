import { browser } from "$app/environment"
import type { PageLoad } from "./$types"

export const load: PageLoad = async function ({ url }) {
    if (browser) {
        history.replaceState(null, "", "/packet-submit")
    }

    return {
    submitted: url.searchParams.get("submitted"),
}
}
