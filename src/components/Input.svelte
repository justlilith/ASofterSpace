<script lang='ts'>
	import { createEventDispatcher } from 'svelte'
	import { bind } from 'svelte/internal';
	// import { stashChat, saveChat, clearChat, clearStash } from './Stash.svelte'
	import * as Helpers from './ts/helpers'
	import themeStore from './ts/themeStore'
	import { onMount } from 'svelte'
	
	
	export let messageList:MessageT[]
	export let timer:number = 0
	// export const animateList = function(){}
	export let chatName
	export let fileName
	
	export let theme = ''
	
	let messageContent:string = ''
	
	let dispatch = createEventDispatcher()
	
	let appStorage:Storage
	
	onMount( async () => {
		appStorage = window.localStorage
	})
	
	const parseMessage = (messageContent:string) => {
		// console.log(messageContent[0])
		switch (messageContent[0]) {
			case '/':
			let command = messageContent
			.slice(1)
			.split(' ')
			switch (command[0]) {
				case 'switch':
				switch(command[1]) {
					case 'theme':
					console.log('%cswitching themes from chatbox', 'color:cyan')
					theme = Helpers.fetchTheme(appStorage, themeStore, 'theme')
					Helpers.updateTheme(window.localStorage, theme)
					break
					case 'listener':
					console.log('%cswitching listeners from chatbox', 'color:teal')
					let listener = Helpers.fetchTheme(appStorage, themeStore, 'listener')
					Helpers.updateListener(window.localStorage, listener)
					break
					default:
					Helpers.notify('Invalid slash command :x',500)
					break
				}
				break
				case 'save':
				Helpers.saveChat(fileName, messageList)
				break
				case 'stash':
				Helpers.stashChat(window.localStorage, chatName, messageList)
				break
				case 'clear':
				console.log(command)
				switch (command[1]) {
					case 'stash':
					Helpers.clearStash(window.localStorage)
					break
					case 'chat':
					messageList = []
					break
					default:
					Helpers.notify('Invalid slash command :x',500)
				}
				break
				default:
				Helpers.notify('Invalid slash command :x',500)
			}
			break
			default:
			sendMessage(messageContent)
		}
	}
	
	const sendMessage = (message:string) => {
		if (!message) {
			return
		}
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
	class={theme}
	bind:value={messageContent}
	on:keypress='{keypressCheck.bind(messageContent)}'>
	<div id='submit'>
		<!-- <Fab  -->
			<button
			class={theme}
			id='submitButton'
			on:mousedown={(event)=> {
				parseMessage(messageContent)
				event.preventDefault()
			}}
			>
			<span id='sendButton' class="material-icons">send</span>
			Send
		</button>
		<!-- </Fab> -->
	</div>
</section>

<style lang='scss'>
	@import '../themes/allThemes';
	
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
	
	#sendButton {
		vertical-align: top;
	}
</style>