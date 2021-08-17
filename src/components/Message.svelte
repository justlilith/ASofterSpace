<script lang='ts'>
	import { fade, fly } from 'svelte/transition'
	export let message:MessageT
	// transition:fly='{{y:50}}'
</script>

<div class="timestamp">
	<span class="timestamp">{message.timestamp}</span>
</div>
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
		width: fit-content;
		display:flex;
		flex-direction: column;
	}
	.user {
		// grid-column: 3 / span 5;
		// float:right;
		text-align: end;
		float:right;
		background-color: white;
		color: black;
	}
	
	.theVoid {
		text-align: start;
		float:left;
		background-color: black;
		color: white;
	}
	
	.timestamp {
		font-size:.85em;
		// float:right;
		text-align: right;
		// display: block;
		border: none;
	}
</style>