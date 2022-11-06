<script lang="ts">
    import type { Question } from "$lib/types"
    import { createEventDispatcher } from "svelte"
    import Select from "svelte-select"
    import { browser } from "$app/environment"
    import {onMount} from "svelte"
    import QuestionPreview from "./QuestionPreview.svelte"
    import HelpBox from "./HelpBox.svelte"

    export let question: Question
    let synth: SpeechSynthesis
    const dispatch = createEventDispatcher()
    let questionHistory: Question[] = []
    const elements = [
        "H",
        "He",
        "Li",
        "Be",
        "B",
        "C",
        "N",
        "O",
        "F",
        "Ne",
        "Na",
        "Mg",
        "Al",
        "Si",
        "P",
        "S",
        "Cl",
        "Ar",
        "K",
        "Ca",
        "Sc",
        "Ti",
        "V",
        "Cr",
        "Mn",
        "Fe",
        "Co",
        "Ni",
        "Cu",
        "Zn",
        "Ga",
        "Ge",
        "As",
        "Se",
        "Br",
        "Kr",
        "Rb",
        "Sr",
        "Y",
        "Zr",
        "Nb",
        "Mo",
        "Tc",
        "Ru",
        "Rh",
        "Pd",
        "Ag",
        "Cd",
        "In",
        "Sn",
        "Sb",
        "Te",
        "I",
        "Xe",
        "Cs",
        "Ba",
        "La",
        "Ce",
        "Pr",
        "Nd",
        "Pm",
        "Sm",
        "Eu",
        "Gd",
        "Tb",
        "Dy",
        "Ho",
        "Er",
        "Tm",
        "Yb",
        "Lu",
        "Hf",
        "Ta",
        "W",
        "Re",
        "Os",
        "Ir",
        "Pt",
        "Au",
        "Hg",
        "Tl",
        "Pb",
        "Bi",
        "Po",
        "At",
        "Rn",
        "Fr",
        "Ra",
        "Ac",
        "Th",
        "Pa",
        "U",
        "Np",
        "Pu",
        "Am",
        "Cm",
        "Bk",
        "Cf",
        "Es",
        "Fm",
        "Md",
        "No",
        "Lr",
        "Rf",
        "Db",
        "Sg",
        "Bh",
        "Hs",
        "Mt",
        "Ds",
        "Rg",
        "Cn",
        "Nh",
        "Fl",
        "Mc",
        "Lv",
        "Ts",
        "Og",
        "Uue"
    ]


    const categoryNames: Record<string, string> = {
        bio: "Biology",
        earth: "Earth and Space",
        chem: "Chemistry",
        physics: "Physics",
        math: "Math",
        energy: "Energy",
    }

    let questionWords = genQuestionWords(question)
    let answerWords = "The Correct Answer Is " + question.correctAnswer
    let questionUtterance: SpeechSynthesisUtterance
    let answerUtterance: SpeechSynthesisUtterance

    let voices: SpeechSynthesisVoice[] = []
    let listedVoices: string[]

    onMount(()=>{
        synth = window.speechSynthesis
		console.log("mounted")
        voices = synth.getVoices()
        synth.cancel()
        listedVoices = voices.map((v) => v.name)
        console.log("hahafunny",questionWords)
		setTimeout(()=>{
            voices = synth.getVoices()
            listedVoices = voices.map((v) => v.name)
        }, 300)
    })

    let questionRead = false
    let answerRead = false
    let speechRate = 1
    let timeAfterRead = 0
    let timerInterval: NodeJS.Timer
	let interupt :boolean = false
	let timeWarningRead = false

    function genQuestionWords(question:Question){    
        
        let spokenText = (question.bonus ? "Bonus " : "Tossup ") + 
            categoryNames[question.category] + 
            (question.type === "MCQ" ? " Multiple Choice " : " Short Answer ") +
            question.questionText + 
            (question.type === "MCQ"
                ? `. W: ${question.choices.W}. X: ${question.choices.X}. Y: ${question.choices.Y}. Z: ${question.choices.Z}`
                : "")
        spokenText = spokenText.replaceAll(/(-|–|−)([^a-zA-Z0-9]| )/g,(s)=>" minus ")
        spokenText = spokenText.replaceAll(/\[.+?(-|–|−).+?\]/g,"")
        if (question.category=="chem") {
            spokenText = spokenText.replaceAll(new RegExp(` (${elements.join('|')})(${elements.join('|')}|\\d)+(\n|[^a-z])`,'gs'),(s)=>s.replaceAll(/./g,(c)=>c.toUpperCase()+' '))
        }
        
        return spokenText
    }

    function buzz() {
		clearInterval(timerInterval)
		interupt = true
		if (synth.speaking) synth.cancel()
		synth.speak(new SpeechSynthesisUtterance("Buzz"))

	}

	function sendQuery(){
		dispatch("answerClosed", {})
		dispatch("sendQuery", {})
		clearInterval(timerInterval)
		answerRead = false
		questionRead = false
		isSpeaking = false
		timeWarningRead = false
	}

	$: readCues(timeAfterRead)

	function readCues(timeAfterRead:number){
		console.log(timeAfterRead)
		if (question.bonus){
			if (timeAfterRead>=15000 && !timeWarningRead) {
				timeWarningRead = true
				synth.speak(new SpeechSynthesisUtterance("5 seconds"))
			}
			if (timeAfterRead>=20000) {
				synth.speak(new SpeechSynthesisUtterance("Time"))
				clearInterval(timerInterval)
			} 
		} else {
			if (timeAfterRead>=5000) {
				synth.speak(new SpeechSynthesisUtterance("Time"))
				clearInterval(timerInterval)
			}
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
			clearInterval(timerInterval)
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
        if (questionHistory.includes(question)) {
		//	sendQuery()
		//	console.log("querysent")
		} else {
            questionWords = genQuestionWords(q)
			questionHistory.unshift(question)
			questionHistory = questionHistory
            console.log("questionWords", questionWords)
            answerWords = "The Correct Answer Is " + q.correctAnswer
            if (browser) {
                questionUtterance = new SpeechSynthesisUtterance(questionWords)
                answerUtterance = new SpeechSynthesisUtterance(answerWords)
				questionUtterance.addEventListener('end',(event)=>{console.log(event.elapsedTime)})
        		answerUtterance.addEventListener('end',(event)=>{console.log(event.elapsedTime)})
            }
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

    function handleKeydown(e: KeyboardEvent) {
        if (e.code === "Space") buzz()
		if (e.key === ",") readQuestion()
		if (e.key === ".") readAnswer()
		if (e.key === "/") sendQuery()
    }
</script>

<svelte:body on:keydown={handleKeydown} />

<div class="speech">
    <h2>Speech Settings
		<div style="color:black;display:inline;">
			<HelpBox >
				<p style="text-decoration: underline;margin: 0 ">Keyboard Shortcuts</p>
				-  Space - Pause (Buzz) <br>
				-  <p style="background-color:#92ea8a;display:inline;font-family:'Courier New', Courier, monospace">,</p> - Read Question <br>
				-  <p style="background-color:#92ea8a;display:inline;font-family:'Courier New', Courier, monospace">.</p> - Read Answer <br>
				-  <p style="background-color:#92ea8a;display:inline;font-family:'Courier New', Courier, monospace">/</p> - Send Query
			</HelpBox>
		</div>
	</h2>
    <div class="buttons">
        <button id="speak" on:click={() => buzz()}>
            Pause (Buzz)
        </button>
		<button id="readQuestion" on:click={readQuestion}>
			Read Question
		</button>
		<button id="readAnswer" on:click={readAnswer}>
			Read Answer
		</button>
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
            {#if timeAfterRead > 0}
                <p class="timer">Timer: {Math.round(timeAfterRead / 100) / 10}</p>
            {/if}
        </div>
    </div>
    <div class="questions-wrapper">
		<h2>Question History</h2>
        <div id="questionHistory">
            {#each questionHistory as q}
                <QuestionPreview question={q}></QuestionPreview>
            {/each}
        </div>
    </div>

</div>

<style lang="scss">
    .speech {
		@include vertical-scrollable(7px);

        position: relative;
        background-color: $background-2;
        padding: 0.5em 1em 0.5em 2em;
        margin-top: 2em;
        border-radius: 1em;
        max-width: 100ch;
		max-height: calc(100vh - 410px);
        box-sizing: border-box;
		overflow-y: scroll;
		
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

	#questionHistory {
		@include vertical-scrollable(7px);
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        row-gap: 20px;
        column-gap: 20px;
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
		background-color: #{$background-1};
		padding: 1em;
		border-radius: 1em;
    }

</style>
