<script lang='ts'>
	import { toastStore } from './ts/toastStore'
	import { Jumper } from 'svelte-loading-spinners'
	// import button, { Label } from '@smui/button/bare.js'
	// import { Label } from '@smui/button/bare.js'
	import { browser } from '$app/env'
	import { onMount } from 'svelte'
	import * as Helpers from './ts/helpers'
	import { fly, fade, slide } from 'svelte/transition'
	import { prevent_default } from 'svelte/internal'
	
	
	export let theme:string = ''	
	
	let currentToastQueue:ToastT[]
	let currentToast:ToastT
	let index = 0
	let toasterOccupied:boolean = false
	
	toastStore.subscribe((toastQueue:ToastT[]) => {
		if (toastQueue) {
			currentToastQueue = toastQueue
		}
	})
	
	function discardToast (args) {
		let newQueue:ToastT[] = args.stack.filter(toast => {
			return args.toast.id != toast.id
		})
		// args.stack = newQueue
		toastStore.update(() => {
			return newQueue
		})
	}
	
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
		}, currentToast.duration)
		
		const timer = setInterval(() => interval(toast), 1000)
		
		function interval (toast:ToastT) {
			if (toast.remaining > 0) {
				toast.remaining = toast.remaining - 1
			}
			else {
				console.log(toast.remaining)
				clearInterval(timer)
			}
		}
		
		return toast.message
	}
</script>


{#if currentToastQueue?.length > 0}
<div out:fade='{{duration:200}}' class={theme} id='toastContainer'>
	{#each currentToastQueue as toast}
	<div class='toast-message-box {theme} {toast.mood}' in:fly='{{duration: 300, y: -100}}' out:fade='{{duration:200}}'>
		<div class='toast-slot {theme} {toast.mood}'>
			<Jumper color="#666666"></Jumper>
			<div class="toast-message">{serveToast(toast)}</div>
		</div>
		<div>
			<button class='close-button' on:click|preventDefault="{() => {discardToast({stack: currentToastQueue, toast})}}">x</button>
		</div>
	</div>
	{/each}
</div>
{/if}


<style lang='scss'>
	@import '../themes/allThemes-toast';
	
	#toastContainer {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		left: 0px;
		// z-index:10;
		// height: 2vh;
		margin: auto;
		overflow: visible;
		position: fixed;
		top: 0vh;
		width: 100%;
		
	}
	
	.toast-message-box {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		height: min-content;
		margin: auto;
		text-align: center;
		width: 100%;
	}
	
	.toast-slot {
		align-items: center;
		display: flex;
		flex-direction: row;
		flex-grow: 100;
		justify-content: center;
	}

	.toast-message {
		margin: 0 .5em;
	}
	
	.close-button {
		background: none;
		border: none;
		display: block;
		color: #666666;
		font-size: 1.5em;
	}
	
	.bad {
		background-color: hsl(0, 100%, 75%) !important;
	}
	
	.good {
		background-color: hsl(90, 100%, 75%) !important;
	}
</style>