<svelte:head>
<title>a softer space :: history</title>

<!-- <script id='p5' defer src="/p5/sketch.js"></script> -->
<!-- <script id='p5' defer src="/p5/sketch2.js"></script> -->
</svelte:head>

<script lang="ts">
	// import Fab from '@smui/fab'
	import { fade, slide } from 'svelte/transition'
	import { bind } from 'svelte/internal'
	import { onMount } from 'svelte'
	import { browser } from '$app/env'
	
	import Stash from '../components/Stash.svelte'
	import Menu from '../components/Menu.svelte'
	import themeStore from '../components/ts/themeStore'
	import { fetchChatsFromDB } from '../components/ts/database'
	import * as Helpers from '../components/ts/helpers'
	import Message from '../components/Message.svelte'
	
	let date = new Date()
	
	export let theme = ''
	
	themeStore.subscribe((newTheme) => {
		theme = newTheme
	})
	
	let chats:ChatPacketT[]

	let chatPacket:ChatPacketT
	
	onMount(async () => {
		const appStorage = window.localStorage
		theme = Helpers.fetchTheme(appStorage, themeStore, 'theme')
		Helpers.setListenerOpacity(25)
		
		chats = await fetchChatsFromDB()
	})
	
	
	// export let name: string;
	
</script>

<main class={theme}>
	{#if chats}
	{#each chats as chat}
	<div class={theme}>
		<h2>{chat.chatName || 'Saved Chat'}</h2>
		<div class='messages'>
			<section class='animatedList'>
				{#each chat.chatFullText as message}
				<span transition:slide='{{ duration: 200 }}'>
					<Message {theme} {message}></Message>
				</span>
				{/each}
			</section>
		</div>
	</div>
	{/each}
	{/if}
	<Menu {chatPacket} {theme}></Menu>
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
	
	.messages {
		display:flex;
		/* align-items:flex-end; */
		flex-direction: column-reverse;
		/* justify-content: flex-end; */
		height: 20vh;
		min-height:1px;
		overflow:scroll;
		-webkit-mask-image: linear-gradient(to top, black 0%, transparent 80%);
		mask-image: linear-gradient(to top, black 0%, transparent 80%);
		scrollbar-width: none;
		/* border: thin solid white; */
	}
	
	.animatedList {
		display:flex;
		flex-direction: column;
	}

	.animatedList:first-child {
		margin-top:15vh;
	}
	
	.animatedList > p {
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