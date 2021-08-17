<script lang='ts'>
	import { fly } from 'svelte/transition'
	export let theme = ''
	
	let flyoutStatus = false
</script>

<button
id='menuButton'
on:click="{() => flyoutStatus = !flyoutStatus}"
><span class='material-icons'>menu</span></button>
{#if flyoutStatus}
<nav 
transition:fly='{{duration: 300, x: 200}}'
class={theme}>
	<ul>
		<li>
			<a href="/">Chat</a>
		</li>
		<li>
			<a href="/settings">Settings</a>
		</li>
	</ul>
</nav>
{/if}

<style lang="scss">
	#menuButton {
		border:none;
		background: none;
		z-index: 10;
	}
	nav, button {
		z-index: 10;

		position: fixed;
		top:2vh;
		right:2vw;
	}
	
	nav {
		top:5vh;
	}

	li {
		text-decoration: none;
		list-style: none;
	}
	
</style>