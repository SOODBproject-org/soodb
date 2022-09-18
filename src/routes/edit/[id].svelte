<script lang="ts" context="module">
    import type { Load } from "@sveltejs/kit"

    export const load: Load = async function ({ params, session, fetch }) {
        if (!session.lucia) {
            return {
                status: 302,
                redirect: "/login",
            }
        }

        const res = await fetch(`/api/question/${params.id}`)
        if (res.status === 200) {
            return {
                props: {
                    question: await res.json(),
                },
            }
        } else {
            return {
                status: 302,
                redirect: "/login",
            }
        }
    }
</script>

<script lang="ts">
    import EditQuestion from "$lib/components/EditQuestion.svelte"
    import type { Question } from "$lib/types"

    export let question: Question
</script>

<svelte:head>
    <title>Edit Question</title>
</svelte:head>

<main>
    <div id="question-wrapper">
        <EditQuestion {question} />
    </div>
</main>

<style lang="scss">
    #question-wrapper {
        width: 100%;
        text-align: center;
    }
</style>
