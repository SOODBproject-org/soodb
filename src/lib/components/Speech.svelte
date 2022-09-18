<script lang="ts">
    import { onMount } from "svelte";
    import playButton from '$lib/icons/play-button.svg?raw'
    import pauseButton from '$lib/icons/pause-button.svg?raw'
    import Icon from "svelte-icon/Icon.svelte";
    import type { Question } from '$lib/types';
    import { createEventDispatcher } from "svelte"
    import Select from "svelte-select";
    import { browser } from "$app/env";

    export let question: Question
    let synth: SpeechSynthesis
    const dispatch = createEventDispatcher()
    const categoryNames: Record<string, string> = {
        bio: "Biology",
        earth: "Earth and Space",
        chem: "Chemistry",
        physics: "Physics",
        math: "Math",
        energy: "Energy",
    }
    
    let questionWords  = (question.bonus ? "Bonus " : "Tossup ") + categoryNames[question.category] + (question.type === "MCQ" ? "Multiple Choice " : "Short Answer ")  +" "+ question.questionText + (question.type === "MCQ" ? " W " + question.choices.W +" X " + question.choices.X+" Y " + question.choices.Y+" Z " + question.choices.Z :"" ) 
    let answerWords = "The Correct Answer Is " + question.correctAnswer
    let questionUtterance: SpeechSynthesisUtterance
    let answerUtternance: SpeechSynthesisUtterance
    
    let voices: SpeechSynthesisVoice[] = []  
    let listedVoices: string[]
    if (browser) {
        synth = window.speechSynthesis
        voices = synth.getVoices()
        synth.cancel()
        console.dir(voices)
        listedVoices = voices.map((v)=>v.name)
        questionUtterance = new SpeechSynthesisUtterance(questionWords)
        answerUtternance = new SpeechSynthesisUtterance(answerWords)
    }

    let questionRead :boolean= false
    let answerRead : boolean = false
    let speechRate :number = 1
    function toggleSpeech() {
        if (synth.speaking){
            synth.cancel()
        } else if (!questionRead) {
            if (selectedVoice) questionUtterance.voice = selectedVoice
            questionUtterance.rate = speechRate
            synth.speak(questionUtterance)
            questionRead = true
        } else if (!answerRead) {
            if (selectedVoice) answerUtternance.voice = selectedVoice
            answerUtternance.rate = speechRate
            synth.speak(answerUtternance)
            answerRead = true
        } else {
            dispatch("sendQuery", {})
            answerRead = false
            questionRead = false
            isSpeaking = false
        }
    }
    
    function questionUpdate(question:Question){
        questionWords  = (question.bonus ? "Bonus " : "Tossup ") + categoryNames[question.category] + (question.type === "MCQ" ? "Multiple Choice " : "Short Answer ")  +" "+ question.questionText + (question.type === "MCQ" ? " W " + question.choices.W +" X " + question.choices.X+" Y " + question.choices.Y+" Z " + question.choices.Z :"" ) 
        answerWords = "The Correct Answer Is " + question.correctAnswer
        questionUtterance = new SpeechSynthesisUtterance(questionWords)
        answerUtternance = new SpeechSynthesisUtterance(answerWords)
    }

    let isSpeaking = false
    setInterval(()=>{
        isSpeaking = synth?.speaking
    },50)

    let selectedVoice : SpeechSynthesisVoice | undefined
    function handleVoiceSelect(e: CustomEvent<{index:number,label:string,value:string}>) {
        console.dir(e.detail)
        selectedVoice = voices.find(v=>v.name==e.detail.label) 
    }

    $: questionUpdate(question)
</script>

<svelte:body
    on:keydown={(e) => { if (e.key === "k")  toggleSpeech() }} />

<main>
    <h1>Speech Settings</h1>
    <button id="speak"  on:click={()=>toggleSpeech()}>
        {#if isSpeaking}
            <Icon data={pauseButton} class="icon" />
        {:else if answerRead}
            Next
        {:else}
            <Icon data={playButton} class="icon" />
        {/if}
    </button>
    <div class='select'>
        <Select 
            items={listedVoices} 
            isSearchable={true} 
            on:select={handleVoiceSelect}
        />
    </div>
    <div id="rate-control">
        <label for="rate">Rate:</label>
        <input type="range" min="0.5" max="2.5" bind:value={speechRate} step="0.1" id="rate">
    </div>
</main>

<style lang="scss">
    main {
        position: relative;
        background-color: $background-2;
        padding: 0.5em 1em 0.5em 2em;
        margin: 20px;
        border-radius: 1em;
        overflow: hidden;
        max-width: min(100ch, 60vw);
        height: 30em;
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
    .select {
        --inputFontSize: 20px;
        --placeholderColor: #757575;
        --background: hsl(48, 18%, 9%);
        --listBackground:hsl(48, 18%, 9%);
        --itemHoverBG: #{$accent-2};
        --multiItemBG: #{$accent-2};
        --multiItemActiveBG: #{scale($accent-2, $saturation: 20%, $lightness: -10%)};
        --itemColor: hsl(32, 30%, 87%);
        --listMaxHeight: 6em;
        --border: transparent 1.5px solid;
        --borderHoverColor: #{$accent-2};
        --borderFocusColor: #{$accent-2};
        --border-radius: .2em;

        font-size: 20px;
        border: none;
        margin: .5em 0;        
        box-sizing: border-box;
        max-width: min(300px,80%);
        position: relative;
        text-align: left;
        font-family: 'Ubuntu';

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
</style>