<script lang="ts">
    import type { PacketCategories } from "$lib/functions/packetSubmitUtils"
    import HelpBox from "./HelpBox.svelte"

    type Parameters = {
        keywords: {
            tossUp: string
            bonus: string
            shortAnswer: string
            multipleChoice: string,
            answer: string
        }
        categories: PacketCategories
        ignoreCase: boolean
    }

    export let parameters: Parameters
    export let regexPattern: RegExp
    export let editableRegex: string

    function calcRegexPattern(params: Parameters) {
        let catString = Object.values(params.categories).flat().filter(x => x).join("|")
        editableRegex = `/(${params.keywords.tossUp}|${params.keywords.bonus})[\\s\\S]*?(${catString})[\\s\\S]*?(${params.keywords.shortAnswer}|${params.keywords.multipleChoice}):?[\\n\\r\\s]*((?:.|[\\n\\r\\s])+)${params.keywords.answer}:?\\s*(.+)/g${params.ignoreCase ? "i" : ""}`
        const regex = new RegExp(
            `(${params.keywords.tossUp}|${params.keywords.bonus})[\\s\\S]*?(${catString})[\\s\\S]*?(${params.keywords.shortAnswer}|${params.keywords.multipleChoice}):?[\\n\\r\\s]*((?:.|[\\n\\r\\s])+?)${params.keywords.answer}:?\\s*(.+)`,
            `g${parameters.ignoreCase ? "i" : ""}`
        )

        return regex
    }

    function manualRegex() {
        const res = editableRegex.match(/\/((\n|.)+?)\/(.{0,6})/)
        try {
            regexPattern = res ? new RegExp(res[1], res[3]) : /^\b$/
        } catch (error) {
            console.log(error)
        }
    }

    regexPattern = calcRegexPattern(parameters)
    let settingsType: 'keywords' | 'raw' = 'keywords'
</script>

<div class="parsing-settings">
    <label for="keywords-settings-input" class="radio-label">
        <input 
            id="keywords-settings-input"
            type="radio"
            name="settings-type"
            value="keywords"
            bind:group={settingsType}
        />
        <span />
        Edit Keywords
    </label>
    <label for="raw-settings-input" class="radio-label">
        <input 
            id="raw-settings-input"
            type="radio"
            name="settings-type"
            value="raw"
            bind:group={settingsType}
        />
        <span />
        Edit Raw Regex
    </label>

    {#if settingsType === "keywords"}
        <h3>Keywords:</h3>
        <div class="options" on:input={() => (regexPattern = calcRegexPattern(parameters))}>
            <p>Tossup:</p>
            <input type="text" bind:value={parameters.keywords.tossUp} />
            
            <p>Bonus:</p>
            <input type="text" bind:value={parameters.keywords.bonus} />
            
            <p>Short Answer:</p>
            <input type="text" bind:value={parameters.keywords.shortAnswer} />
            
            <p>Multiple Choice:</p>
            <input type="text" bind:value={parameters.keywords.multipleChoice} />
            
            <p>Answer:</p>
            <input type="text" bind:value={parameters.keywords.answer} />
            
            <p>Biology:</p>
            <input type="text" bind:value={parameters.categories.bio} />
            
            <p>Chemistry:</p>
            <input type="text" bind:value={parameters.categories.chem} />
            
            <p>Earth and Space:</p>
            <input type="text" bind:value={parameters.categories.earth} />
            
            <p>Physics:</p>
            <input type="text" bind:value={parameters.categories.physics} />
            
            <p>Math:</p>
            <input type="text" bind:value={parameters.categories.math} />
            
            <p>Energy:</p>
            <input type="text" bind:value={parameters.categories.energy} />
            
            <p style:align-self="start">Other:</p>
            <div>
                {#each Array(parameters.categories.custom.length) as _, i}
                    <div class="removableCat">
                        <input
                            type="text"
                            bind:value={parameters.categories.custom[i]}
                            style="width:12ch;border-radius:.3em 0 0 .3em "
                        />
                        <button
                            type="button"
                            class="minus"
                            on:click={() => {
                                parameters.categories.custom = [
                                    ...parameters.categories.custom.slice(i),
                                    ...parameters.categories.custom.slice(i + 1),
                                ]
                                regexPattern = calcRegexPattern(parameters)
                            }}
                        >
                            -
                        </button>
                    </div>
                {/each}
                <button
                    class="plus"
                    type="button"
                    on:click={() => {
                        parameters.categories.custom = [
                            ...parameters.categories.custom,
                            ""
                        ]
                        regexPattern = calcRegexPattern(parameters)
                    }}
                >
                    +
                </button>
            </div>
        </div>
        <label for="ignore-case-input" class="checkbox-label">
            <input
                type="checkbox"
                name="ignoreCase"
                bind:checked={parameters.ignoreCase}
                on:change={() => (regexPattern = calcRegexPattern(parameters))}
            />
            <span />
            Ignore case
        </label>
    {:else}
        <label for="raw-regex-input">
            Raw Regex:
            <HelpBox>
                Edit this if your questions aren't detected by the current regex filter. Questions are
                identified and sorted using the keywords entered, so try editing the keywords
                first before editing the regex. Changes to the keywords will edit the regex below and
                overwrite any changes you make to it.
            </HelpBox>
        </label>
        <br />
        <textarea
            id="raw-regex-input"
            bind:value={editableRegex}
            on:input|stopPropagation={manualRegex}
        />
    {/if}
</div>

<style lang="scss">
    .options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;

        p {
            margin: 0.85em;
            font-size: 18px;
        }
    }

    .plus {
        @extend %button-secondary;
        padding-top: 0.3em;
        width: 6ch;
    }

    .minus {
        @extend %button-secondary;

        width: 3ch;
        font-size: 22px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        margin-left: 0;
        padding-top: 0.2em;
        box-sizing: border-box;
        height: 1.9em;
    }

    .removableCat {
        display: flex;
        flex-direction: row;
    }

    .checkbox-label {
        @extend %checkbox-label;

        font-size: 18px;
    }

    .radio-label {
        @extend %radio-label;

        font-size: 18px;
    }

    input[type="text"] {
        @extend %text-input;

        font-size: 22px;
        width: 20ch;
        max-width: 80vw;
        text-align: center;
    }

    textarea {
        @extend %textarea;

        font-size: 18px;
        width: 90%;
        resize: vertical;
        min-height: 3.2em;
        height: 3.2em;
        position: relative;
        vertical-align: middle;

        &:focus::placeholder {
            color: transparent;
        }
    }
</style>