<script lang="ts">
	import { browser } from '$app/environment'
	import * as Helpers from './ts/helpers'
	import { fade, fly } from 'svelte/transition'
	
	import { addChatToDB } from './ts/database'

	import Modal from './Modal.svelte'
	
	if (browser) {
		const appStorage = window.localStorage;	
	}
	
	const currentDate = new Date();
	let dateString = currentDate.toDateString().replace(/\s/g, "-");
	
	export let showStashSave: boolean = false;
	export let chatPacket:ChatPacketT
	export let theme = ''
	export let isAuthed:boolean = false
	let showModal:boolean = false

	let message =
`Hi, and welcome to A Softer Space.

This is a place where you can vent your feelings, like you're texting a friend, without worrying that they're too heavy to handle.

You can stash your chats to continue later, or save (download) them to your device.

If you want to access your chats from another device, you'll need to sign up and make an account.

We hope you find solace in using this little app.

Thank you.
`
	
	const toggle = (stashToggle: boolean): boolean => {
		stashToggle = !stashToggle;
		console.log(stashToggle);
		return stashToggle;
	}
</script>


{#if showStashSave}
<div class='modal'
transition:fade='{{duration:300}}'
on:click="{() => {
	showStashSave = !showStashSave
}}"></div>
{/if}
<button
id="toggleButton"
class={theme}
on:click={() => {
	showStashSave = toggle(showStashSave);
}}
>
<span class='material-icons-outlined {theme}'>info</span>
<span class={theme} id='toggleButtonText'>Chat Options</span>
</button>

{#if showStashSave}
{#if browser}
<aside
id="stash-component"
class={theme}
transition:fly='{{duration: 300, y:200}}'
>
<input
transition:fade='{{duration: 100, delay:100}}'
class={theme}
id="name"
placeholder="Name this chat, please c:"
bind:value={chatPacket.chatName}
/>
<div id="stash-chat">
	<button
	transition:fade='{{duration: 150, delay:150}}'
	class={theme}
	on:click={async () => {
		Helpers.stashChat(window.localStorage, chatPacket)
		if (isAuthed) {
			let res = await addChatToDB(chatPacket)
			console.log(res)

		}
	}}
	>
	<span>Stash Chat</span>
</button>
</div>
<div id="save-chat">
	<button
	transition:fade='{{duration: 200, delay:200}}'
	class={theme}
	on:click={() => {
		Helpers.saveChat(chatPacket);
	}}
	>
	<span>Save Chat</span>
</button>
</div>
<div id="clear-stash">
	<button
	transition:fade='{{delay:250}}'
	class={theme}
	on:click={() => {
		Helpers.clearStash(window.localStorage);
	}}
	>
	<span>Clear Stash</span>
</button>
</div>
<div id="clear-chat">
	<button
	transition:fade='{{duration: 300, delay:300}}'
	class={theme}
	on:click={() => {
		chatPacket.chatFullText = []
	}}
	>
	<span>Clear Chat</span>
</button>
</div>
<button
class={theme}
id='modalButton'
on:click="{() => {showModal = !showModal}}">
<span class='material-icons-outlined {theme}'>info</span>
	What is A Softer Space?
</button>
</aside>
{/if}
{/if}

{#if showModal}
	<Modal bind:showModal {message} {theme}></Modal>
{/if}


<style lang="scss">
	@import '../themes/allThemes-button';
	@import '../themes/allThemes-menu';

	.modal {
		background-color: black;
		opacity: 0.5;
		height: 100vh;
		width: 100vw;
		position: fixed;
		left:0;
		top: 0;
	}
	
	nav, #toggleButton {
		bottom: 2vh;
		right: 0;
		position: fixed;
		z-index: 10;
		padding: 0 7.5vw;
	}
	
	#toggleButton {
		background: none;
		border: none;
		z-index: 20;
		margin: none;
	}
	
	#toggleButtonText {
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
		padding: 0 5vw 10vh;
		text-align: left;
		width: 5rem;
	}
	
	#stash-component {
		position: fixed;
		left: 0px;
		right: 0px;
		bottom:0px;
		background-color: black;
		padding: 2vh 7.5vw 10vh;
		display: grid;
		grid-template-areas:
		"middle middle middle middle"
		"stash-chat save-chat clear-stash clear-chat"
		"bottom bottom bottom bottom";
		justify-items:stretch;
		min-height: 50px;
		gap: 2vw;
		margin:auto;
	}
	
	#name {
		grid-area: middle;
		width:85vw;
		margin: auto;
		// height:30px;
	}
	
	#stash-chat {
		grid-area: stash-chat;
	}
	#save-chat {
		grid-area: save-chat;
	}
	#clear-stash {
		grid-area: clear-stash;
	}
	#clear-chat {
		grid-area: clear-chat;
	}
	
	#modalButton {
		background:none;
		grid-area: bottom;
	}

	@media (min-width: 500px) {
		#stash-component {
			padding: 2vh 20vw 10vh;
		}
		#name {
			width:60vw;
		}
		
		#toggleButton {
			padding:0 20vw 0 0;
		}
	}
	
	@media (min-width: 1000px) {
		#stash-component {
			padding: 2vh 35vw 10vh;
		}
		#name {
			width:30vw;
		}
		#toggleButton {
			padding:0 35vw 0 0;
		}
	}
	
	@media (max-height: 500px) {
		#toggleButton {
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
