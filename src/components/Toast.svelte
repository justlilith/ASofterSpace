<script lang='ts'>
	import { toastStore } from './ts/toastStore'
	// import button, { Label } from '@smui/button/bare.js'
	// import { Label } from '@smui/button/bare.js'
	import { browser } from '$app/env'
	import { onMount } from 'svelte'
	import * as Helpers from './ts/helpers'
	import { fly, fade, slide } from 'svelte/transition'

	
	export let theme:string = ''	
	
	let currentToastQueue:ToastT[]
	let currentToast:ToastT
	let index = 0
	let toasterOccupied:boolean = false

	toastStore.subscribe((toastQueue:ToastT[]) => {
		if (toastQueue) {
			console.log(toastQueue)
			currentToastQueue = toastQueue
			// let popup = toastQueue[toastQueue.length - 1]
			// duration = popup?.duration
			// toast = popup?.message
			// console.log(popup)
		}
	})
	
	function serveToast (toast:ToastT) {
		toasterOccupied = true
		console.log('now serving')
		currentToast = currentToastQueue.filter(slice => toast.id == slice.id)[0]
		let index = currentToastQueue.indexOf(toast)
		setTimeout(()=> {
			console.log('loading next toast')
			// toast = currentToast[0].message
			currentToastQueue = currentToastQueue.filter(slice => toast.id !== slice.id)
			toastStore.update(()=>{
				return currentToastQueue
			})
			toasterOccupied = false;
		}, currentToast.duration * 2)
		return toast.message
	}
</script>

<div class={theme} id='toastContainer'>
	{#if currentToastQueue?.length > 0}
	<!-- {serveToast()} -->
	{#each currentToastQueue as toast}
	{#if !toasterOccupied}
	<div class='toastMessage' in:fly='{{duration: 500, y: -100}}' out:fade='{{duration:400}}'>
		{serveToast(toast)}
	</div>
	{/if}
	{/each}
	{/if}
</div>

<style lang='scss'>
	#toastContainer {
		position:absolute;
		transform: translateX(50%);
		// z-index:10;
		top:5vh;
		left:0px;
		overflow: hidden;
		height:20vh;
		margin:auto;
		width:50%;
		
	}

	.toastMessage {
		height:3em;
		width:10em;
		border: thin solid grey;
		border-radius: 2px;
		padding: 1em;
		height:min-content;
		margin: auto;
		// width: fit-content;
		// display:flex;
		// flex-direction: column;
		text-align: center;
		background-color: white;
		color: black;
		opacity: 75%;
	}
</style>