<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import * as Auth from '$lib/components/ts/auth';
	import * as Helpers from '$lib/helpers';

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
	<button
		class="modal"
		transition:fade={{ duration: 300 }}
		on:click={() => {
			showMenu = !showMenu;
		}}
	></button>
{/if}

<button id="menuButton" class={theme} on:click={() => (showMenu = !showMenu)}>
	<span class="material-icons-outlined {theme}">menu</span>
	<span class="{theme} menuButtonText">Menu</span>
</button>

{#if showMenu}
	<nav transition:fly={{ duration: 300, x: -200 }} class={theme}>
		<ul>
			<li>
				<a href="/chat" transition:fade|local={{ duration: 100, delay: 100 }}>
					<span class="material-icons-outlined {theme}">chat</span>
					<span class="{theme} menuButtonText">Chat</span>
				</a>
			</li>
			{#if isAuthed}
				<li>
					<a href="/history" transition:fade|local={{ duration: 100, delay: 150 }}>
						<span class="material-icons-outlined {theme}">history</span>
						<span class="{theme} menuButtonText">History</span>
					</a>
				</li>
			{/if}
			<li>
				<a href="/settings" transition:fade|local={{ duration: 100, delay: 200 }}>
					<span class="material-icons-outlined {theme}">settings</span>
					<span class="{theme} menuButtonText">Settings</span>
				</a>
			</li>
			{#if !isAuthed}
				<li>
					<a href="/login" transition:fade|local={{ duration: 100, delay: 250 }}>
						<span class="material-icons-outlined {theme}">login</span>
						<span class="{theme} menuButtonText">Login</span>
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
							isAuthed = await Auth.signOut(isAuthed);
							appStorage.setItem('userData', '');
							appStorage.setItem('chats', '');
							Helpers.notify("You've been successfully logged out ✔️", 2000, 'good');
						}}
						transition:fade|local={{ duration: 100, delay: 300 }}
					>
						<span class="material-icons-outlined {theme}">logout</span>
						<span class="{theme} menuButtonText">Logout</span>
					</a>
				</li>
			{/if}
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

	nav,
	button {
		bottom: 2vh;
		left: 2vw;
		position: fixed;
		z-index: 10;
		padding: 0 7.5vw;
	}

	#menuButton {
		left: 0px;
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
