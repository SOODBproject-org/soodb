import type { PageLoad } from "./$types"

export const load: PageLoad = async function ({ fetch }) {
    const packetRes = await fetch("/api/packet")
    return {
        sets: await packetRes.json(),
    }
}
