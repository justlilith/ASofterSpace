<script lang="ts">
	import { browser } from '$app/env'
	import * as Helpers from './ts/helpers'
	import { fade } from 'svelte/transition'
	
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

<aside id="stash-component">
	<div id="toggle-button">
		<button
		class={theme}
		on:click={() => {
			showStashSave = toggle(showStashSave);
		}}
		>
		Chat Options
	</button>
</div>
{#if showStashSave == true}
{#if browser}
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
transition:fade='{{duration: 250, delay:250}}'
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
{/if}
{/if}
</aside>

<style lang="scss">
	@import '../themes/allThemes';
	
	#stash-component {
		display: grid;
		grid-template-areas:
		"top top top top"
		"middle middle middle middle"
		"stash-chat save-chat clear-stash clear-chat";
		justify-items: stretch;
		width: 100%;
		min-height: 50px;
		gap: 5px;
	}
	
	#toggle-button {
		grid-area: top;
	}
	
	#name {
		grid-area: middle;
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
</style>
