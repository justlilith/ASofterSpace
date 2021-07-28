<script lang='ts'>
	import Button, { Label } from '@smui/button'
	
	const appStorage = window.localStorage

	export let messageList:Array<Message>
	
	let showStashSave:boolean = false
	
	const currentDate = new Date()
	let dateString = currentDate.toDateString().replace(/\s/g,'-')
	let chatName:string = ''
	
	const stashChat = (chatName:string):void => {
		let stashName:string = `${dateString}-${chatName.replace(/\s/g,'-')}`
		let messages = new Set(messageList)
		appStorage.setItem('chats',JSON.stringify(messageList))
		console.log(appStorage.getItem('chats'))
	}

	const saveChat = ():void => {
		
	}

	const clearStash = ():void => {
		appStorage.clear()
	}

	const clearChat = ():void => {
		messageList = []
		console.log('chat cleared')
	}

	const toggle = (stashToggle:boolean):boolean => {
		stashToggle = !stashToggle
		console.log(stashToggle)
		return stashToggle
	}
</script>

<aside id='stash-component'>
	<div id='toggle-button'>
		<Button variant='unelevated' on:click={() => {showStashSave = toggle(showStashSave)}}>
			<Label>Chat Options</Label>
		</Button>
	</div>
	{#if showStashSave == true}
	<input
	id='name'
	placeholder="Name this chat, please c:"
	bind:value={chatName}
	>
	<div id='stash-chat'>
		<Button variant='unelevated' on:click={() => {stashChat(chatName)}}>
			<Label>Stash Chat</Label>
		</Button>
	</div>
	<div id='save-chat'>
		<Button variant='unelevated' on:click={() => {saveChat()}}>
			<Label>Save Chat</Label>
		</Button>
	</div>
	<div id='clear-stash'>
		<Button variant='unelevated' on:click={() => {clearStash()}}>
			<Label>Clear Stash</Label>
		</Button>
	</div>
	<div id='clear-chat'>
		<Button variant='unelevated' on:click={() => {clearChat()}}>
			<Label>Clear Chat</Label>
		</Button>
	</div>
	{/if}
</aside>

<style lang='scss'>
	#stash-component {
		display:grid;
		grid-template-areas:'top top top top'
		'middle middle middle middle'
		'stash-chat save-chat clear-stash clear-chat';
		justify-items: stretch;
		width:100%;
		min-height:50px;
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