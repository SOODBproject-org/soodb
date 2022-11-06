<script lang="ts">
    import "$lib/styles/page.scss"

    import DatabaseHeader from "$lib/components/DatabaseHeader.svelte"
</script>

<div class="layout">
    <DatabaseHeader />
    <div>
        <slot />
    </div>
</div>

<style lang="scss">
    .layout {
        width: 100%;
        height: calc(100vh - 10px);
        display: grid;
        grid-template-rows: auto 1fr;
        align-items: stretch;

        > * {
            min-height: 0;
        }
    }
</style>
