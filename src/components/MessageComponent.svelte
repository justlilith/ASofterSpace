<script lang='ts'>
	export let message:Message
</script>

<p class={message.sender}>{message.content}</p>

<style lang='scss'>
	p {
		border: thin solid grey;
		border-radius: 2px;
		padding: 1em;
		height:min-content;
		margin: .5em 0;
	}
	.user {
		grid-column: 2 / span 5;
		text-align: end;
		background-color: white;
		color: black;
	}
	
	.theVoid {
		grid-column: 1 / span 5;
		text-align: start;
		background-color: black;
		color: white;
	}
</style>