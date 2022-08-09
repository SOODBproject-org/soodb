import preprocess from "svelte-preprocess"
import vercel from "@sveltejs/adapter-vercel"

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: preprocess({
        scss: {
            prependData: `@use './src/lib/styles/_global.scss' as *;`
        }
    }),

    kit: {
        // hydrate the <div id="svelte"> element in src/app.html
        adapter: vercel(),
        files: {
            lib: "src/lib",
        },
    },
}

export default config
