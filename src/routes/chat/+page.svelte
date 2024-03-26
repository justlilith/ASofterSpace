<script lang="ts">
	// import Fab from '@smui/fab'
	import { fade, fly, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	import Input from '$lib/components/Input.svelte';
	import Message from '$lib/components/Message.svelte';
	import Stash from '$lib/components/Stash.svelte';
	import themeStore from '$lib/components/ts/themeStore';
	import * as Helpers from '$lib/components/ts/helpers';
	import { authService } from '$lib/services/authService';
	import { browser } from '$app/environment';
	import { settingsService } from '$lib/services/settingsService';

	let theme: string = 'deep-blue';
	let isAuthed: boolean = false;
	let date = new Date();
	let showStashSave: boolean = false;
	let showMenu: boolean = false;
	let name = '';
	let listener = settingsService.settings.listener;

	export let chatPacket: ChatPacketT = {
		chatId: 0,
		chatName: '',
		chatFullText: [],
		timestamp: ''
	};

	onMount(async () => {
		if (browser) {
			const appStorage = window.localStorage;

			isAuthed = authService.active.isAuthed;
			if (isAuthed) {
				name = `, ${(await authService.getUserData()).data.name ?? 'friend'}`;
				// name = supabase
			}

			try {
				let stash: ChatPacketT = Helpers.fetchFromLocal(appStorage, 'chats');
				if (stash) {
					chatPacket = { ...stash };
				}
				console.log(stash);
			} catch (error) {
				console.warn("couldn't get the chats sowwy");
				console.warn(error.message);
			}

			chatPacket.chatId = chatPacket.chatId || uuidv4();
			chatPacket.timestamp = `${date.toUTCString()}`;

			Helpers.setListener('the sun');
			Helpers.setListenerOpacity(50);
		}
	});

	let chatName = '';
	let fileName = '';

	const removeMessage = (list: MessageT[]): MessageT[] => {
		console.log(list);
		switch (list.length > 0) {
			case true:
				return list.slice(0, -1);
			case false:
			default:
				return list;
		}
	};
</script>

<svelte:head>
	<title>a softer space</title>

	<script defer src="https://cdn.jsdelivr.net/npm/p5@1.4.0/lib/p5.min.js"></script>
	<!-- <script id="p5sun" defer src="p5/sketch.js"></script>
	<script id="p5cube" defer src="p5/sketch2.js"></script> -->
</svelte:head>

<!-- <section id="p5Sketch" class="p5SketchSun" hidden={settingsService.listeners['sun'].hidden}/>
<section id="p5Sketch2" class="p5SketchCube" hidden={settingsService.listeners['cube'].hidden}/> -->
<main class={theme}>
	<div id="messages">
		<section id="animatedList">
			{#if chatPacket.chatFullText.length !== 0}
				{#each chatPacket.chatFullText as message}
					<span transition:slide={{ duration: 200 }}>
						<Message {theme} {message} />
					</span>
				{/each}
			{:else}
				<p transition:fade|local>Talk to me{name ? `, ${name}` : ``}. 💙</p>
			{/if}
		</section>
	</div>
	<Input
		{theme}
		on:click={() => {
			console.log('click');
		}}
		bind:chatPacket
	/>
	<Stash {theme} bind:chatPacket bind:isAuthed bind:showStashSave />
</main>

<style lang="scss">
	#p5Sketch,
	#p5Sketch2 {
		z-index: -66;
		width: 100%;
		position: absolute;
		display: grid;
		justify-items: center;
	}

	main {
		position: relative;
		text-align: center;
		padding: 1em;
		/* min-width: 400px; */
		max-width: 85%;
		/* width:100px; */
		height: 100%;
		margin: 0 auto;
	}

	#messages {
		display: flex;
		/* align-items:flex-end; */
		flex-direction: column-reverse;
		/* justify-content: flex-end; */
		height: 80vh;
		min-height: 1px;
		overflow: scroll;
		-webkit-mask-image: linear-gradient(to top, black 0%, transparent 80%);
		mask-image: linear-gradient(to top, black 0%, transparent 80%);
		scrollbar-width: none;
		/* border: thin solid white; */
	}

	#animatedList {
		display: flex;
		flex-direction: column;
	}

	.animatedList:first-child {
		margin-top: 20vh;
	}

	#animatedList > p {
		color: white;
	}

	#messages::-webkit-scrollbar {
		display: none;
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
