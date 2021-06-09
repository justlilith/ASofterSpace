<script lang="ts">
	import InputComponent from './components/InputComponent.svelte'
	import MessageComponent from './components/MessageComponent.svelte'
	
	export let messageList:Array<Message> = []
		
		// export let name: string;
	</script>
	
	<main>
		<div id='messages'>
			{#if messageList.length !== 0}
			{#each messageList as message}
			<MessageComponent message={message}></MessageComponent>
			{/each}
			{:else}
			<p>Talk to me.</p>
			{/if}
		</div>
		<InputComponent bind:messageList></InputComponent>
		
	</main>
	
	<style>
		main {
			position:relative;
			text-align: center;
			padding: 1em;
			/* min-width: 400px; */
			max-width: 25%;
			/* width:100px; */
			height:100%;
			margin: 0 auto;
		}
		
		#messages {
			display:flex;
			flex-direction: column-reverse;
			height: 75vh;
			overflow:overlay;
		}
		
		/* h1 {
			color: #fff;
			text-transform: lowercase;
			font-size: 3em;
			font-weight: 600;
		} */
		/* 	
		@media (min-width: 640px) {
			main {
				max-width: none;
			}
		} */
	</style>