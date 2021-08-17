<svelte:head>
<title>a softer space</title>
</svelte:head>

<script lang="ts">
	// import Fab from '@smui/fab'
	import { fade, slide } from 'svelte/transition'
	import { bind } from 'svelte/internal'
	import { onMount } from 'svelte'
	import Input from '../components/Input.svelte'
	import Message from '../components/Message.svelte'
	import Stash from '../components/Stash.svelte'
	import ThemeSwitcher from '../components/ThemeSwitcher.svelte'
	
	let theme:string = 'soft-blue'
	
	let date = new Date()
	
	export let messageList:MessageT[] = [], timer:number = 8
	
	onMount(async () => {

		const appStorage = window.localStorage
		
		try {
			let stash = JSON.parse(appStorage.getItem('chats'))
			messageList = stash || messageList
			console.log(stash)
		} catch (error) {
			console.warn(error)
		}
	})
	
	
	// export let name: string;
	
	let chatName = ''
	let fileName = ''
	
	const removeMessage = (list:Array<MessageT>):Array<MessageT> => {
		console.log(list)
		switch (list.length > 0) {
			case true:
			return list.slice(0,-1)
			case false:
			default:
			return list
		}
	}
	
	const responses:string[] =
	[ `I'm just here to listen. :)`
	, `Your feelings are valid. Keep talking. It's okay.`
	, 'Keep going. :)'
	, '*nods* Okay...'
	]
	
	let voidFlag = 0
	
	const voidResponse = (timer:number, listofResponses:string[], messages:Array<MessageT>,voidFlag,innerVoidFlag,) => {
		if (voidFlag !== innerVoidFlag) {
			return messageList
		}
		switch (timer){
			case (8):
			break
			case (0):
			let multiplier = Math.random()
			let index:number = (100 * multiplier) % 4
			index = Math.floor(index)
			console.log(listofResponses[index])
			let date = new Date()
			let localTime = date.toLocaleTimeString()
			let localDate = date.toLocaleDateString()
			.split('/')
			.reverse()
			.join('.')
			messageList = [...messages,
			{ content:listofResponses[index]
				, sender:'theVoid'
				, timestamp: `${localDate} - ${localTime}`
			}
			]
			voidFlag = 0
			timer = 8
			return messageList
			default:
			voidFlag = 1
			setTimeout(()=> {
				console.log('void called')
				timer = timer - 1
				voidResponse(timer, listofResponses, messages,voidFlag,1)
			},1000)
		}
	}
	
	const invokeVoid = (event) => {
		console.log(event)
		messageList = voidResponse(timer, responses, messageList,voidFlag,voidFlag)
	}
	
	// setInterval(function() {
		// 	messageList = removeMessage(messageList)
		// }.bind(messageList),
		// 	3000)
	</script>
	
	<main class={theme}>
		<div id='messages'>
			<section id='animatedList'>
				{#if messageList.length !== 0}
				{#each messageList as message}
				<span
				transition:slide='{{ duration: 200 }}'>
				<Message message={message}></Message>
			</span>
			{/each}
			{:else}
			<p transition:fade|local>Talk to me.</p>
			{/if}
		</section>
	</div>
	<Input
	on:voidInvoked='{invokeVoid.bind(timer,responses,messageList)}'
	bind:messageList
	bind:timer
	bind:chatName
	bind:fileName></Input>
	<Stash
	bind:messageList
	bind:chatName></Stash>
	<ThemeSwitcher bind:theme></ThemeSwitcher>
	
	
</main>
<style lang='scss'>
	@use '@material/theme/color-palette';
	
	$background: #000;
	
	@use '@material/theme/index' as theme with (
	$primary: color-palette.$blue-500,
	$secondary: color-palette.$teal-600,
	$surface: #fff,
	$background: $background,
	$error: #b00020,
	);
	
	@import '../themes/allThemes';
	
	main {
		position:relative;
		text-align: center;
		padding: 1em;
		/* min-width: 400px; */
		max-width: 85%;
		/* width:100px; */
		height:100%;
		margin: 0 auto;
	}
	
	#messages {
		display:flex;
		/* align-items:flex-end; */
		flex-direction: column-reverse;
		/* justify-content: flex-end; */
		height: 75vh;
		min-height:1px;
		overflow:scroll;
		-webkit-mask-image: linear-gradient(to top, black 0%, transparent 80%);
		mask-image: linear-gradient(to top, black 0%, transparent 80%);
		scrollbar-width: none;
		/* border: thin solid white; */
	}
	
	#animatedList {
		display:flex;
		flex-direction: column;
	}
	
	#animatedList > p {
		color:white;
	}
	
	#messages::-webkit-scrollbar {
		display:none;
	}
	
	/* h1 {
		color: #fff;
		text-transform: lowercase;
		font-size: 3em;
		font-weight: 600;
	} */
	
	@media (min-width: 500px) {
		main {
			max-width: 60%;
		}
	}
	
	@media (min-width: 1000px) {
		main {
			max-width: 30%;
		}
	}
</style>