<script lang="ts">
	import Button, { Label } from "@smui/button";
	import * as Helpers from './ts/helpers'

	const appStorage = window.localStorage;

	export let messageList: Array<MessageT>;

	let showStashSave: boolean = true;

	const currentDate = new Date();
	let dateString = currentDate.toDateString().replace(/\s/g, "-");
	export let chatName: string = "";

	const toggle = (stashToggle: boolean): boolean => {
		stashToggle = !stashToggle;
		console.log(stashToggle);
		return stashToggle;
	};
</script>

<aside id="stash-component">
	<div id="toggle-button">
		<Button
			variant="unelevated"
			on:click={() => {
				showStashSave = toggle(showStashSave);
			}}
		>
			<Label>Chat Options</Label>
		</Button>
	</div>
	{#if showStashSave == true}
		<input
			id="name"
			placeholder="Name this chat, please c:"
			bind:value={chatName}
		/>
		<div id="stash-chat">
			<Button
				variant="unelevated"
				on:click={() => {
					Helpers.stashChat(chatName, messageList);
				}}
			>
				<Label>Stash Chat</Label>
			</Button>
		</div>
		<div id="save-chat">
			<Button
				variant="unelevated"
				on:click={() => {
					Helpers.saveChat(chatName, messageList);
				}}
			>
				<Label>Save Chat</Label>
			</Button>
		</div>
		<div id="clear-stash">
			<Button
				variant="unelevated"
				on:click={() => {
					Helpers.clearStash();
				}}
			>
				<Label>Clear Stash</Label>
			</Button>
		</div>
		<div id="clear-chat">
			<Button
				variant="unelevated"
				on:click={() => {
					messageList = []
				}}
			>
				<Label>Clear Chat</Label>
			</Button>
		</div>
	{/if}
</aside>

<style lang="scss">
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
