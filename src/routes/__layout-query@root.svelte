<script lang="ts">
    import "$lib/styles/page.scss"

    import DatabaseHeader from "$lib/components/DatabaseHeader.svelte"
</script>

<DatabaseHeader />
<div class="layout">
    <slot />
</div>

<style lang="scss">
    .layout {
        display: grid;
        grid-template-columns: min(40vw, 50ch) 1fr;
        gap: 2em;
        position: relative;
        width: 100%;
        padding: 2em;
        box-sizing: border-box;
    }

    @media (max-width: 650px) {
        .layout {
            padding-left: 60px;
            grid-template-columns: 1fr;
        }
    }
</style>
