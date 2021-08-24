<script lang="ts">
	import { browser } from '$app/env'
	import * as Helpers from './ts/helpers'
	import { fade, fly } from 'svelte/transition'
	
	if (browser) {
		const appStorage = window.localStorage;	
	}
	
	const currentDate = new Date();
	let dateString = currentDate.toDateString().replace(/\s/g, "-");
	
	let showStashSave: boolean = false;
	
	export let chatName: string = "";
	export let messageList: MessageT[];
	
	export let theme = ''
	
	const toggle = (stashToggle: boolean): boolean => {
		stashToggle = !stashToggle;
		console.log(stashToggle);
		return stashToggle;
	}
</script>

<button
id="toggleButton"
class={theme}
on:click={() => {
	showStashSave = toggle(showStashSave);
}}
>
<span class='material-icons {theme}'>info</span>
<span class={theme} id='toggleButtonText'>Chat Options</span>
</button>

{#if showStashSave == true}
{#if browser}
<aside
id="stash-component"
transition:fly='{{duration: 300, y:200}}'
>
<input
transition:fade='{{duration: 100, delay:100}}'
class={theme}
id="name"
placeholder="Name this chat, please c:"
bind:value={chatName}
/>
<div id="stash-chat">
	<button
	transition:fade='{{duration: 150, delay:150}}'
	class={theme}
	on:click={() => {
		Helpers.stashChat(window.localStorage, chatName, messageList);
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
		Helpers.saveChat(chatName, messageList);
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
		messageList = []
	}}
	>
	<span>Clear Chat</span>
</button>
</div>
</aside>
{/if}
{/if}

<style lang="scss">
	@import '../themes/allThemes';
	
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
		"stash-chat save-chat clear-stash clear-chat";
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
</style>
