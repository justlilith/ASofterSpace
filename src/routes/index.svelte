<svelte:head>
<title>a softer space</title>
</svelte:head>

<script lang="ts">
	// import Fab from '@smui/fab'
	import { fade, fly, slide } from 'svelte/transition'
	import { bind } from 'svelte/internal'
	import { onMount } from 'svelte'
	import {v4 as uuidv4 } from 'uuid'
	
	import Input from '../components/Input.svelte'
	import Message from '../components/Message.svelte'
	import Stash from '../components/Stash.svelte'
	import Menu from '../components/Menu.svelte'
	import ThemeSwitcher from '../components/ThemeSwitcher.svelte'
	import themeStore from '../components/ts/themeStore'
	import Toast from '../components/Toast.svelte'
	import * as Helpers from '../components/ts/helpers'
	import * as Auth from '../components/ts/auth';
	
	let theme:string = 'deep-blue'
	let isAuthed:boolean = false
	let date = new Date()
	let showStashSave:boolean = false
	let showMenu:boolean = false
	let name
	
	export let chatPacket:ChatPacketT = {
		chatId: 0,
		chatName: '',
		chatFullText: [],
		timestamp: ''
	}
	
	onMount(async () => {
		const appStorage = window.localStorage
		
		theme = Helpers.fetchTheme(appStorage, themeStore, 'theme')
		
		if (!theme) {
			theme = 'deep-blue'
			themeStore.update(() => {
				return theme
			})
			
			console.log(`theme updated to ${theme} :>`)
			const html = document.getElementsByTagName('html')[0] 
			html.className = theme
			
			Helpers.saveToLocal(appStorage, 'theme', theme)
		}
		
		themeStore.subscribe((newTheme) => {
			theme = newTheme
		})
		
		isAuthed = await Auth.authCheck()
		if (isAuthed) {
			Auth.awaitRefreshToken()
			name = `, ${(await Auth.getUserData()).data.name ?? 'friend'}`
			// name = supabase
		}
		
		try {
			let stash:ChatPacketT = Helpers.fetchFromLocal(appStorage,'chats')
			if (stash) {
				chatPacket = {...stash}
			}
			console.log(stash)
		} catch (error) {
			console.warn('couldn\'t get the chats sowwy')
			console.warn(error.message)
		}
		
		chatPacket.chatId = chatPacket.chatId || uuidv4()
		chatPacket.timestamp = `${date.toUTCString()}`
		
		Helpers.setListenerOpacity(100)
	})
	
	let chatName = ''
	let fileName = ''
	
	const removeMessage = (list:MessageT[]):MessageT[] => {
		console.log(list)
		switch (list.length > 0) {
			case true:
			return list.slice(0,-1)
			case false:
			default:
			return list
		}
	}
	</script>

<main class={theme}>
	<div id='messages'>
		<section id='animatedList'>
			{#if chatPacket.chatFullText.length !== 0}
			{#each chatPacket.chatFullText as message}
			<span
			transition:slide='{{ duration: 200 }}'>
			<Message {theme} {message}></Message>
		</span>
		{/each}
		{:else}
		<p transition:fade|local>Talk to me{name}. 💙</p>
		{/if}
	</section>
</div>
<Input
{theme}
on:click='{()=> {
	console.log('click')
}}'
bind:chatPacket
></Input>
<Menu {theme}
bind:isAuthed
bind:showMenu
bind:chatPacket
></Menu>
<Stash
{theme}
bind:chatPacket
bind:isAuthed
bind:showStashSave></Stash>

<Toast {theme}></Toast>

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
		height: 80vh;
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
	
	.animatedList:first-child {
		margin-top:20vh;
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