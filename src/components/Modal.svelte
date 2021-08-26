<script lang='ts'>
	import { fade } from 'svelte/transition'
	export let theme = ''
	export let message = ''
	export let showModal:boolean = false

	let paragraphs = message.split('\n')

</script>

<div transition:fade='{{duration:300}}' on:click='{()=>{showModal = !showModal}}' id='backdrop'>
</div>
<aside transition:fade='{{duration:300}}' id='modal' class='theme'>
	<p id='modalMessage'>
		{#if message}
		{#each paragraphs as paragraph}
		<p>{paragraph}</p>
		{/each}
		<p><a target=_blank href='https://twitter.com/imjustlilith'>—@imjustlilith</a> / A Softer Space Team</p>
		{:else}
		test
		{/if}
	</p>
</aside>

<style lang='scss'>
	@import '../themes/allThemes-modal';

	#modal {
		background: white;
		border-radius: 2px;
		margin: auto;
		min-height: 20vh;
		min-width: 20vw;
		padding: 5vh 5vw;
		position: fixed;
		top: 50vh;
		left: 50vw;
		transform: translate(-50%, -50%);
	}
	
	#modalMessage {
		vertical-align: middle;
	}
	
	#backdrop {
		background-color: black;
		height: 100vh;
		left: 0vw;
		opacity: 0.5;
		position:fixed;
		top: 0vh;
		width: 100vw;
	}

	@media (max-width: 500px) {
		#modal {
			width: 80vw;
		}
	}
	
	@media (min-width: 1000px) {
		#modal {
			max-width: 30vw;
		}
	}
	
</style>