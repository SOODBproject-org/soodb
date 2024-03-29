import preprocess from "svelte-preprocess"
import node from "@sveltejs/adapter-node"

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: preprocess({
        scss: {
            prependData: `@use './src/lib/styles/_global.scss' as *;`,
        },
    }),

    kit: {
        // hydrate the <div id="svelte"> element in src/app.html
        adapter: node(),
        files: {
            lib: "src/lib",
        },
        prerender: {
            enabled: false
        },
    },
}

export default config
