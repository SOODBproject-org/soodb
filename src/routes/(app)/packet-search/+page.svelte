<script lang="ts" context="module">
    import type { Load } from "@sveltejs/kit"

    export const load: Load = async function ({ fetch, url }) {
        const setRes = await fetch(`/api/set/search?setName=`)
        const packetRes = await fetch(`/api/packet/search?packetName=`)
        return {
            props: {
                packets: await packetRes.json(),
                sets : await setRes.json()
            },
        }
    }
</script>

<script lang="ts">
    import Set from "$lib/components/Set.svelte"
    import type { PacketSet, Packet } from "$lib/types"
    export let sets: PacketSet[] = []
    export let packets: Packet[] = []

    function getPacketsInSet(set:PacketSet) {
        let packetsInSet: Packet[] = []
        set.packetIds.forEach((p:string) => {
            packetsInSet.push(packets.find((x)=>x.id===p))
        });
        //console.log(packetsInSet)
        return packetsInSet
    }

    function getAllPacketsForSets(packets){
        let packetsInAllSets =sets.map(s=>getPacketsInSet(s))
        sets.forEach((s,n)=>s.packets=packetsInAllSets[n])
        console.log(sets)
        //console.log(packets)
    }

    $:getAllPacketsForSets(packets)
</script>

<main>
    {#each sets as s}
        <Set bind:set={s} />
    {/each}
</main>

<style lang="scss">
</style>
