<script lang='ts'>
	import Fab from '@smui/fab'
	
	let stashToggle:boolean = false
	
	const stashChat = ():void => {
	}
	const saveChat = ():void => {
		
	}
	const toggle = (stashToggle:boolean):boolean => {
		stashToggle = !stashToggle
		console.log(stashToggle)
		return stashToggle
	}

	let chatName:string
</script>

<aside id='stash-component'>
	<div id='toggle-button'>
		<Fab on:click={() => {stashToggle = toggle(stashToggle)}}>
			Stash or Download Chat
		</Fab>
	</div>
	{#if stashToggle == true}
	<input
	id='name'
	placeholder="Name this chat, please c:"
	bind:value={chatName}
	>
	<div id='stash-button'>
		<Fab on:click={stashChat()}>
			Stash Chat
		</Fab>
	</div>
	<div id='save-button'>
		<Fab on:click={saveChat()}>
			Save Chat
		</Fab>
	</div>
	{/if}
</aside>

<style lang='scss'>
	#stash-component {
		display:grid;
		grid-template-areas:'top top'
		'middle middle'
		'left right';
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
		// width:100%;
	}
	
	#stash-button {
		grid-area: left;
		// width: 20%;
	}
	
	#save-button {
		grid-area: right;
		// width: 20%;
	}
</style>