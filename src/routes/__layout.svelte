<script lang="ts">
    import "$lib/styles/page.scss"

    import DatabaseHeader from "$lib/components/DatabaseHeader.svelte"
    import { Lucia } from "lucia-sveltekit/client"
    import { session } from "$app/stores"
</script>

<Lucia {session}>
    <DatabaseHeader />
    <slot />
</Lucia>
