<script lang='ts'>
	import Modal from './Modal.svelte'
	import { createEventDispatcher } from 'svelte'
	export let theme = ''
	
	export let showModal:boolean = false

	export const message:string = 'Are you sure you want to delete this chat? It will NOT be recoverable 🥺'

	const dispatch = createEventDispatcher()
	function sendMessage(message){
		dispatch('message', {directive: message})
	}
</script>

<nav>
	<button on:pointerdown='{event => {
		sendMessage('save')
	}}'>
		<span class='material-icons-outlined {theme}'>download</span>
		Save Chat
	</button>
	<button on:pointerdown='{event => {
		showModal = true
	}}'>
		<span class='material-icons-outlined {theme}'>delete</span>
		Delete Chat
	</button>
</nav>

{#if showModal}
<Modal bind:showModal {message}>
	<button on:pointerdown='{event => {
		showModal = false
	}}'>
		<span class='material-icons-outlined {theme}'>cancel</span>
		Go back!
	</button>
	<button on:pointerdown='{event => {
		sendMessage('delete')
		showModal = false
	}}'>
		<span class='material-icons-outlined {theme}'>delete</span>
		Confirm Delete
	</button>
</Modal>
{/if}

<style lang='scss'>
	
</style>