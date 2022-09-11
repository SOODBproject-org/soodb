<script lang="ts">
    import { onMount } from "svelte";
    import playButton from '$lib/icons/play-button.svg?raw'
    import pauseButton from '$lib/icons/pause-button.svg?raw'
    import Icon from "svelte-icon/Icon.svelte";
    import type Question from '$lib/types';

    export let question : Question

    $: questionWords  = (question.bonus ? "Bonus " : "Tossup ") + question.category + (question.type === "MCQ" ? "Multiple Choice " : "Short Answer ")  +" "+ question.questionText 
    $: questionUtterance = new SpeechSynthesisUtterance(questionWords)
    $: answerWords = "The Correct Answer Is " + question.correctAnswer
    $: answerUtternance = new SpeechSynthesisUtterance(answerWords)
    let synth : SpeechSynthesis

    onMount(()=>{
        synth = window.speechSynthesis
        synth.getVoices()
        synth.cancel()
        
    })

    let questionRead = false
    let answerRead = false
    function toggleSpeech() {
        if (synth.speaking){
            synth.cancel()
        } else if (!questionRead) {
            synth.speak(questionUtterance)
            questionRead = true
        } else if (!answerRead) {
            synth.speak(answerUtternance)
            answerRead = true
        } else {
            
        }
    }
    
    let isSpeaking = false
    setInterval(()=>{
        isSpeaking = synth?.speaking
    },50)
</script>

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
}</style>