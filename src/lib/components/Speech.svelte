<script lang="ts">
    import playButton from "$lib/icons/play-button.svg?raw"
    import pauseButton from "$lib/icons/pause-button.svg?raw"
    import Icon from "svelte-icon/Icon.svelte"
    import type { Question } from "$lib/types"
    import { createEventDispatcher } from "svelte"
    import Select from "svelte-select"
    import { browser } from "$app/env"
    import {onMount} from "svelte"
    import QuestionPreview from "./QuestionPreview.svelte"

    export let question: Question
    let synth: SpeechSynthesis
    const dispatch = createEventDispatcher()
    let correct: Question[] = []
    let incorrect: Question[] = []

    const categoryNames: Record<string, string> = {
        bio: "Biology",
        earth: "Earth and Space",
        chem: "Chemistry",
        physics: "Physics",
        math: "Math",
        energy: "Energy",
    }

    let questionWords =
        (question.bonus ? "Bonus " : "Tossup ") +
        categoryNames[question.category] +
        (question.type === "MCQ" ? " Multiple Choice " : " Short Answer ") +
        question.questionText +
        (question.type === "MCQ"
            ? " W " +
              question.choices.W +
              " X " +
              question.choices.X +
              " Y " +
              question.choices.Y +
              " Z " +
              question.choices.Z
            : "")
    let answerWords = "The Correct Answer Is " + question.correctAnswer
    let questionUtterance: SpeechSynthesisUtterance
    let answerUtterance: SpeechSynthesisUtterance

    let voices: SpeechSynthesisVoice[] = []
    let listedVoices: string[]
    onMount(()=>{
        synth = window.speechSynthesis
        voices = synth.getVoices()
        synth.cancel()
        listedVoices = voices.map((v) => v.name)
        questionUtterance = new SpeechSynthesisUtterance(questionWords)
        answerUtterance = new SpeechSynthesisUtterance(answerWords)
        questionUtterance.addEventListener('end',(event)=>{console.log(event.elapsedTime)})
        answerUtterance.addEventListener('end',(event)=>{console.log(event.elapsedTime)})
        setTimeout(()=>{
            voices = synth.getVoices()
            listedVoices = voices.map((v) => v.name)
        },300)
    })

    let questionRead = false
    let answerRead = false
    let speechRate = 1
    let timeAfterRead = 0
    let timerInterval: NodeJS.Timer

    function toggleSpeech() {
        clearInterval(timerInterval)
        if (synth.speaking) synth.cancel()
        else if (!questionRead) readQuestion()
        else if (!answerRead) readAnswer()
        else {
            dispatch("sendQuery", {})
            answerRead = false
            questionRead = false
            isSpeaking = false
        }
    }
    function readQuestion(){
        synth.cancel()
        if (selectedVoice) questionUtterance.voice = selectedVoice
        questionUtterance.rate = speechRate
        synth.speak(questionUtterance)
        // TODO: pausing starts timer
        questionUtterance.addEventListener('end', () => {
            timeAfterRead = 0
            timerInterval = setInterval(() => {
                timeAfterRead += 100
            }, 100)
        })
        questionRead = true
    }
    function readAnswer(){
        clearInterval(timerInterval)
        synth.cancel()
        if (selectedVoice) answerUtterance.voice = selectedVoice
        answerUtterance.rate = speechRate
        synth.speak(answerUtterance)
        dispatch("answerRead")
        answerRead = true
    }

    function questionUpdate(q: Question) {
        questionWords = [
            (q.bonus ? "Bonus " : "Tossup ")
            + (q.category === "custom"
                ? q.customCategory
                : categoryNames[q.category])
            + (q.type === "MCQ" ? " Multiple Choice" : " Short Answer"),
            q.questionText,
            q.type === "MCQ"
                ? `W: ${q.choices.W}. X: ${q.choices.X}. Y: ${q.choices.Y}. Z: ${q.choices.Z}`
                : ""
        ].join(". ")
        console.log("questionWords", questionWords)
        answerWords = "The Correct Answer Is " + q.correctAnswer
        if (browser) {
            questionUtterance = new SpeechSynthesisUtterance(questionWords)
            answerUtterance = new SpeechSynthesisUtterance(answerWords)
        }
    }

    let isSpeaking = false
    setInterval(() => {
        isSpeaking = synth?.speaking
    }, 50)

    let selectedVoice: SpeechSynthesisVoice | undefined
    function handleVoiceSelect(e: CustomEvent<{ index: number; label: string; value: string }>) {
        console.dir(e.detail)
        selectedVoice = voices.find((v) => v.name === e.detail.label)
    }

    $: questionUpdate(question)

    function markIncorrect() {
        if (!incorrect.includes(question)) incorrect.push(question);incorrect=incorrect
    }
    function markCorrect() {
        if (!correct.includes(question)) correct.push(question);correct=correct
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "k") toggleSpeech()
        if (e.key === "l") markIncorrect()
        if (e.key === "j") markCorrect()
    }
</script>

<svelte:body on:keydown={handleKeydown} />

<div class="speech">
    <h2>Speech Settings</h2>
    <div class="buttons">
        <button id="speak" on:click={() => toggleSpeech()}>
            {#if isSpeaking}
                <Icon data={pauseButton} class="icon" />
            {:else if answerRead}
                Next
            {:else}
                <Icon data={playButton} class="icon" />
            {/if}
        </button>
        <div class="question-buttons">
            <button id="readQuestion" on:click={readQuestion}>
                Read Question
            </button>
            <button id="readAnswer" on:click={readAnswer}>
                Read Answer
            </button>
        </div>
        <div class="score-buttons">
            <button id="Correct" on:click={()=>{markCorrect}}>
                Mark Correct (J)
            </button>
            <button id="Incorrect" on:click={()=>{markIncorrect}}>
                Mark Incorrect (L)
            </button>
        </div>
    </div>
    <div class="select">
        <Select items={listedVoices} isSearchable={true} placeholder="Custom Voice"
            on:select={handleVoiceSelect} />
    </div>
    <div id="rate-control">
        <label for="rate">Rate:</label>
        <input type="range" min="0.5" max="2.5" bind:value={speechRate} step="0.1" id="rate" />
    </div>
    <div class="stats">
        <div>
            <p>Correct: {correct.length}</p>
            <p>Incorrect: {incorrect.length}</p>
        </div>
        <div>
            {#if timeAfterRead > 0}
                <p class="timer">{Math.round(timeAfterRead / 100) / 10}</p>
            {/if}
        </div>
    </div>
    <div class="questions-wrapper">
        <div class="incorrect-questions">
            {#each incorrect as q}
                <QuestionPreview question={q}></QuestionPreview>
            {/each}
        </div>
    </div>

</div>

<style lang="scss">
    .speech {
        position: relative;
        background-color: $background-2;
        padding: 0.5em 1em 0.5em 2em;
        margin-top: 2em;
        border-radius: 1em;
        max-width: 100ch;
        box-sizing: border-box;

        &::before {
            content: "";
            position: absolute;
            left: 0;
            top: -20px;
            width: 0.4em;
            height: 150%;
        }

        @media (max-width: 800px) {
            max-width: min(100ch, 90vw);
        }
    }

    .buttons, .question-buttons, .score-buttons {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 1.5em;

        > * {
            flex-grow: 1;
        }
    }

    button {
        @extend %button-secondary;

        font-size: 24px;
        margin: 0;
        text-align: center;
        white-space: nowrap;
        box-sizing: border-box;
    }

    .select {
        --inputFontSize: 20px;
        --placeholderColor: #757575;
        --background: hsl(48, 18%, 9%);
        --listBackground: hsl(48, 18%, 9%);
        --itemHoverBG: #{$accent-2};
        --multiItemBG: #{$accent-2};
        --multiItemActiveBG: #{scale($accent-2, $saturation: 20%, $lightness: -10%)};
        --itemColor: hsl(32, 30%, 87%);
        --listMaxHeight: 6em;
        --border: transparent 1.5px solid;
        --borderHoverColor: #{$accent-2};
        --borderFocusColor: #{$accent-2};
        --border-radius: 0.2em;

        font-size: 20px;
        border: none;
        margin: 0.5em 0;
        box-sizing: border-box;
        max-width: min(300px, 80%);
        position: relative;
        text-align: left;
        font-family: "Ubuntu";

        & :global(.listContainer) {
            @include vertical-scrollable(7px);

            &::-webkit-scrollbar-track-piece:start {
                margin-top: 0.2em;
            }

            &::-webkit-scrollbar-track-piece:end {
                margin-bottom: 0.2em;
            }

            overscroll-behavior: contain;
        }
    }

    .stats {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        > * {
            flex-basis: max-content;
        }
    }

    .questions-wrapper {
        max-height: max(30em, 40vh);
        overflow-y: auto;
    }

    .incorrect-questions {
        display: flex;
        flex-direction: column;
        gap: 1em;
    }
</style>
