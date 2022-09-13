<script lang="ts" context="module">
    import type { Load } from "@sveltejs/kit"
    import Cookie from "js-cookie"

    export const load: Load = async function ({ fetch, url }) {
        const packetRes = await fetch("/api/packet")
        return {
            props: {
                sets: await packetRes.json(),
            },
        }
    }
</script>

<script lang="ts">
    import Set from "$lib/components/Set.svelte"
    import type { set } from "$lib/types"
    export let sets : set[] = []
</script>


<main>
    {#each sets as s}
        <Set bind:set={s} />
    {/each}
</main>


<style lang="scss">

</style>