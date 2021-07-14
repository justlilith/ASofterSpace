<script lang='ts'>
	import { createEventDispatcher } from 'svelte'
	import Button from '@smui/button'
	import { Icon } from '@smui/common'
	import Fab from '@smui/fab'
import { bind } from 'svelte/internal';

	export let messageList:Array<Message>
	export let timer:number = 0
	// export const animateList = function(){}
	
	let messageContent:string

	let dispatch = createEventDispatcher()

	const sendMessage = (message:string) => {
		messageList = [
			...messageList
			, { content: message
			, sender: 'user'
			}
			]
			messageContent = ''
			// dispatch('voidInvoked')
		// animateList('messages')
	}

	const keypressCheck = (event) => {
		// console.log(event)
		if (event.key.toLowerCase() == 'enter') {
			sendMessage(messageContent)
			messageContent = ''
			// dispatch('voidInvoked')
		}
		timer = 7
		
	}
</script>

<section id='inputArea'>
	<input id='textInput'
	bind:value={messageContent}
	on:keypress='{keypressCheck.bind(messageContent)}'>
	<div id='submit'>
		<!-- <Button> -->
			<Fab on:click={
				sendMessage(messageContent)}>
				<Icon class="material-icons">send</Icon></Fab>
		<!-- </Button> -->
	</div>
</section>

<style lang='scss'>
	#inputArea {
		width: 100%;
		// height: 2em;
		// background-color: theme.$primary;
		display:grid;
		// grid-template-columns: repeat(30px);
		grid-template-rows: auto;
		grid-template-columns: repeat(6, 1fr);
		// grid-auto-columns: min-content;
	}
	#textInput {
		grid-column: 1 / span 6;
	}
	#submit {
		// background-color: #fff;
		color:purple;
		grid-column: 7;
		border:none;
		text-decoration: none;
		width:100%;
	}
</style>