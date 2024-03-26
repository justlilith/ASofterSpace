<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import * as Helpers from '$lib/helpers';
	import { authService } from '$lib/services/authService';

	export let theme = '';
	export let isAuthed: boolean = false;
	export let showMenu = false;
	export let chatPacket: ChatPacketT = null;

	let appStorage;

	onMount(async () => {
		appStorage = window.localStorage;

		// if (isAuthed == false){
		// 	Auth.authCheck()
		// 	.then(res => {
		// 		isAuthed = res
		// 		if (isAuthed){
		// 			if (!Auth.refreshTokenFetcherActive) {
		// 				setInterval(() => {
		// 					Auth.getRefreshToken()
		// 				},1000 * 60 * 3)
		// 			}
		// 		}
		// 	})
		// }
	});
</script>

{#if showMenu}
	<div class="modal" transition:fade={{ duration: 300 }} />
{/if}

<button id="menuButton" class={theme} on:click={() => {showMenu = !showMenu}}>
	<span class="material-icons-outlined {theme}">menu</span>
	<span class="{theme} menuButtonText">Menu</span>
</button>

{#if showMenu}
	<nav id="side-menu" transition:fly={{ duration: 300, x: -200 }} class={theme}>
		<ul>
			<li>
				<a
					href="/chat"
					transition:fade|local={{ duration: 100, delay: 100 }}
					on:click={() => {
						showMenu = false;
					}}
				>
					<span class="material-icons-outlined {theme}">chat</span>
					<span class="{theme} menuButtonText">chat</span>
				</a>
			</li>
			{#if isAuthed}
				<li>
					<a
						href="/history"
						transition:fade|local={{ duration: 100, delay: 150 }}
						on:click={() => {
							showMenu = false;
						}}
					>
						<span class="material-icons-outlined {theme}">history</span>
						<span class="{theme} menuButtonText">all chats</span>
					</a>
				</li>
			{/if}
			<li>
				<a
					href="/settings"
					transition:fade|local={{ duration: 100, delay: 200 }}
					on:click={() => {
						showMenu = false;
					}}
				>
					<span class="material-icons-outlined {theme}">settings</span>
					<span class="{theme} menuButtonText">settings</span>
				</a>
			</li>
			{#if !isAuthed}
				<li>
					<a
						href="/login"
						transition:fade|local={{ duration: 100, delay: 250 }}
						on:click={() => {
							showMenu = false;
						}}
					>
						<span class="material-icons-outlined {theme}">login</span>
						<span class="{theme} menuButtonText">login</span>
					</a>
				</li>
			{/if}
			{#if isAuthed}
				<li>
					<a
						href="/"
						on:click={async () => {
							if (chatPacket) {
								chatPacket.chatFullText = Helpers.clearChat(chatPacket);
							}
							Helpers.clearStash(appStorage);
							isAuthed = await authService.signOut(isAuthed);
							appStorage.setItem('userData', '');
							appStorage.setItem('chats', '');
							Helpers.notify("You've been successfully logged out ✔️", 2000, 'good');
							showMenu = false;
						}}
						transition:fade|local={{ duration: 100, delay: 300 }}
					>
						<span class="material-icons-outlined {theme}">logout</span>
						<span class="{theme} menuButtonText">logout</span>
					</a>
				</li>
			{/if}
			<li>
				<button
					id="close-button"
					class={theme}
					on:click={() => {
						showMenu = false;
					}}
				>
					<span class="material-icons-outlined {theme}">close</span>
					<span class="{theme} menuButtonText">close menu</span>
				</button>
			</li>
		</ul>
	</nav>
{/if}

<style lang="scss">
	@import 'src/themes/allThemes';

	.modal {
		background-color: black;
		opacity: 0.5;
		height: 100vh;
		width: 100vw;
		position: fixed;
		left: 0;
		top: 0;
	}

	#close-button {
		background: none;
		border: none;
	}

	#side-menu {
		background-color: black;
		z-index: 20;
	}
	nav {
		padding: 0 7.5vw;
		bottom: 2vh;
		left: 2vw;
		position: fixed;
		z-index: 10;
	}

	#menuButton {
		left: 0px;
		bottom: 2vh;
		position: fixed;
		background: none;
		border: none;
		z-index: 20;
		margin: none;
	}

	.menuButtonText {
		vertical-align: middle;
	}

	:global(.material-icons) {
		vertical-align: middle;
	}

	nav {
		bottom: 0vh;
		display: flex;
		flex-direction: column-reverse;
		height: 100%;
		left: 0px;
		line-height: 2;
		margin: 0;
		padding: 0 2vw 10vh 7.5vw;
		text-align: left;
		width: 10rem;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	li {
		color: rgb(0, 100, 200);
		text-decoration: none;
		list-style: none;
		padding: 2vh 0;
	}

	@media (min-width: 500px) {
		nav {
			min-width: 30%;
		}

		#menuButton {
			padding: 0 0 0 20vw;
		}
	}

	@media (min-width: 1000px) {
		nav {
			max-width: 10%;
		}

		#menuButton {
			padding: 0 0 0 35vw;
		}
	}

	@media (max-height: 500px) {
		#menuButton {
			visibility: hidden;
			animation: 500ms fadeout;
		}
	}

	@keyframes fadeout {
		from {
			visibility: visible;
			opacity: 100%;
		}

		to {
			visibility: hidden;
			opacity: 0%;
		}
	}
</style>
