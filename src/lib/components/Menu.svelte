<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import * as Helpers from '$lib/helpers';
	import { authService } from '$lib/services/authService';
	import { localStorageService } from '$lib/services/localStorageService';

	export let theme = '';
	export let isAuthed: boolean = authService.active.isAuthed;
	export let showMenu = false;
	export let chatPacket: ChatPacketT = null;
	
	authService.authDataStore.subscribe(update => {
		isAuthed = update.isAuthed
	})

	let appStorage;

	onMount(async () => {
		appStorage = localStorageService.storage;
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

<div id="menu">
	<button
		id="menuButton"
		class={theme}
		on:click={() => {
			showMenu = !showMenu;
		}}
	>
		<span class="material-icons-outlined {theme}">menu</span>
		<span class="{theme} menuButtonText">Menu</span>
	</button>

	<div id="user">
		<span class="material-icons-outlined {theme}">person</span>
		{#if isAuthed}
			<span>{authService?.active?.user?.user?.email}</span>
			::
			<span>{authService?.active?.user?.user?.user_metadata?.name}</span>
		{:else}
			<a href="/login">log in</a>
		{/if}
	</div>
</div>

<!-- side menu -->

{#if showMenu}
	<nav id="side-menu" transition:fly={{ duration: 300, x: -200 }} class={theme}>
		<ul>
			<li>
				<a
					href="/"
					transition:fade|local={{ duration: 100, delay: 100 }}
					on:click={() => {
						showMenu = false;
					}}
				>
					<span class="material-icons-outlined {theme}">home</span>
					<span class="{theme} menuButtonText">about</span>
				</a>
			</li>
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
						<span class="{theme} menuButtonText">log in / sign up</span>
					</a>
				</li>
			{/if}
			{#if isAuthed}
				<li>
					<a
						href="/logout"
						on:click={async () => {
							if (chatPacket) {
								chatPacket.chatFullText = Helpers.clearChat(chatPacket);
							}
							Helpers.clearStash(appStorage);
							isAuthed = await authService.signOut();
							appStorage.setItem('userData', '');
							appStorage.setItem('chats', '');
							Helpers.notify("You've been successfully logged out ✔️", 2000, 'good');
							showMenu = false;
						}}
						transition:fade|local={{ duration: 100, delay: 300 }}
					>
						<span class="material-icons-outlined {theme}">logout</span>
						<span class="{theme} menuButtonText">log out</span>
					</a>
				</li>
			{/if}
			<li>
				<a
					href="/privacy"
					transition:fade|local={{ duration: 100, delay: 200 }}
					on:click={() => {
						showMenu = false;
					}}
				>
					<span class="material-icons-outlined {theme}">shield</span>
					<span class="{theme} menuButtonText">privacy</span>
				</a>
			</li>
			<li>
				<button
					id="close-side-menu-button"
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

	#menu {
		display: flex;
		flex-direction: row;
	}

	#user {
		text-align: right;
		flex-grow: 100;
	}
	.modal {
		background-color: black;
		opacity: 0.5;
		height: 100vh;
		width: 100vw;
		position: fixed;
		left: 0;
		top: 0;
	}

	#close-side-menu-button {
		background: none;
		border: none;
		padding: 0px;
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
	}

	@media (min-width: 1000px) {
		nav {
			max-width: 10%;
		}
	}

	// @media (max-height: 500px) {
	// 	#menuButton {
	// 		visibility: hidden;
	// 		animation: 500ms fadeout;
	// 	}
	// }

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
