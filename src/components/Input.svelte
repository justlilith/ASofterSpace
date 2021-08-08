<script lang='ts'>
	import { createEventDispatcher } from 'svelte'
	import Button, { Label } from '@smui/button'
	import { Icon } from '@smui/common'
	import Fab from '@smui/fab'
	import { bind } from 'svelte/internal';
	// import { stashChat, saveChat, clearChat, clearStash } from './Stash.svelte'
	import * as Helpers from './ts/helpers'

	export let messageList:Array<MessageT>
	export let timer:number = 0
	// export const animateList = function(){}
	export let chatName
	export let fileName

	let messageContent:string = ''

	let dispatch = createEventDispatcher()

	const parseMessage = (messageContent:string) => {
		// console.log(messageContent[0])
		switch (messageContent[0]) {
			case '/':
				let command = messageContent
					.slice(1)
					.split(' ')
				switch (command[0]) {
					case 'save':
						Helpers.saveChat(fileName, messageList)
						break
					case 'stash':
						Helpers.stashChat(chatName, messageList)
						break
					case 'clear':
						console.log(command)
						switch (command[1]) {
							case 'stash':
								Helpers.clearStash()
								break
							case 'chat':
								messageList = []
								break
							default:
								messageContent = 'invalid input'
						}
						break
					default:
						messageContent = 'invalid input'
				}
				break
			default:
				sendMessage(messageContent)
		}
	}

	const sendMessage = (message:string) => {
		let date = new Date()
		let localTime = date.toLocaleTimeString()
		let localDate = date.toLocaleDateString()
		.split('/')
		.reverse()
		.join('.')
		messageList = [
			...messageList
			, { content: message
			, sender: 'user'
			,	timestamp: `${localDate} - ${localTime}`
			}
		]
			messageContent = ''
			// dispatch('voidInvoked')
		// animateList('messages')
	}

	const keypressCheck = (event) => {
		// console.log(event)
		if (event.key.toLowerCase() == 'enter') {
			parseMessage(messageContent)
			messageContent = ''
			// dispatch('voidInvoked')
		}
		timer = 7
		
	}
</script>

<section id='inputArea' on:click|preventDefault>
	<input id='textInput'
	bind:value={messageContent}
	on:keypress='{keypressCheck.bind(messageContent)}'>
	<div id='submit'>
		<!-- <Fab  -->
		<Button variant='raised'
		on:mousedown={(event)=> {
			parseMessage(messageContent)
			event.preventDefault()
			}}
		b>
			<Icon class="material-icons">send</Icon>
			<Label>Send</Label>
		</Button>
		<!-- </Fab> -->
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