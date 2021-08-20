<script lang='ts'>
	import { fly } from 'svelte/transition'
	export let theme = ''
	
	let flyoutStatus = false
</script>

<button
id='menuButton'
class={theme}
on:click="{() => flyoutStatus = !flyoutStatus}"
>
<span class='material-icons {theme}'>menu</span>
<span class={theme} id='menuButtonText'>Menu</span>
</button>

{#if flyoutStatus}
<nav
transition:fly='{{duration: 300, x: -200}}'
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
	@import '../themes/allThemes';

	nav, button {
		bottom: 2vh;
		left: 2vw;
		position: fixed;
		z-index: 10;
		padding: 0 5vw;
	}

	#menuButton {
		left: 0px;
		background: none;
		border: none;
		z-index: 20;
		margin: none;
	}
	
	#menuButtonText {
		vertical-align: top;
	}
	
	nav {
		bottom: 0vh;
		display: flex;
		flex-direction: column-reverse;
		height: 100%;
		left: 0px;
		line-height: 2;
		margin: 0;
		padding: 0 5vw 10vh;
		text-align: left;
		width: 5rem;
	}
	
	ul {
		list-style: none;
		padding: 0;
	}
	
	li {
		text-decoration: none;
		list-style: none;
	}

	@media (max-width: 500px) {
		nav {
			min-width: 30%;
		}
	}
	
	@media (min-width: 1000px) {
		nav {
			max-width: 10%;
		}
	}
	
</style>