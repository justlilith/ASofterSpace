<script lang='ts'>
	import { fade, fly } from 'svelte/transition'
	export let message:Message
// transition:fly='{{y:50}}'
</script>

<p 
class={message.sender}
>
{message.content}</p>

<style lang='scss'>
	p {
		border: thin solid grey;
		border-radius: 2px;
		padding: 1em;
		height:min-content;
		margin: 0 0 .5em;
	}
	.user {
		// grid-column: 3 / span 5;
		// float:right;
		text-align: end;
		background-color: white;
		color: black;
	}
	
	.theVoid {
		text-align: start;
		background-color: black;
		color: white;
	}
</style>