<script lang='ts'>
	import { fade, fly } from 'svelte/transition'
	import { onMount } from 'svelte'
	import { authCheck, authDataStore, login, signOut, testHeaders } from '../components/ts/auth'
	
	export let theme = ''
	
	export let isAuthed:boolean = false
	
	export let showMenu = false
	
	onMount(async () => {
		authCheck()
		.then(res => {
			console.log(res)
			isAuthed =  res
		})
	})
</script>

{#if showMenu}
<div class='modal'
transition:fade='{{duration:300}}'
on:click="{() => {
	showMenu = !showMenu
}}"></div>
{/if}
<button
id='menuButton'
class={theme}
on:click="{() => showMenu = !showMenu}"
>
<span class='material-icons {theme}'>menu</span>
<span class='{theme} menuButtonText'>Menu</span>
</button>

{#if showMenu}
<nav
transition:fly='{{duration: 300, x: -200}}'
class={theme}>
<ul>
	<li>
		<a href="/">
			<span class='material-icons {theme}'>chat</span>
			<span class='{theme} menuButtonText'>Chat</span>
		</a>
	</li>
	{#if isAuthed == true}
	<li>
		<a href="/history">
			<span class='material-icons {theme}'>info</span>
			History
		</a>
	</li>
	{/if}
	<li>
		<a href="/settings">
			<span class='material-icons {theme}'>settings</span>
			Settings
		</a>
	</li>
	<li>
		<a href="/login">
			<span class='material-icons {theme}'>login</span>
			Login
		</a>
	</li>
</ul>
</nav>
{/if}

<style lang="scss">
	@import '../themes/allThemes';
	
	.modal {
		background-color: black;
		opacity: 0.5;
		height: 100vh;
		width: 100vw;
		position: fixed;
		left:0;
		top: 0;
	}
	
	nav, button {
		bottom: 2vh;
		left: 2vw;
		position: fixed;
		z-index: 10;
		padding: 0 7.5vw;
	}
	
	#menuButton {
		left: 0px;
		background: none;
		border: none;
		z-index: 20;
		margin: none;
	}
	
	.menuButtonText {
		vertical-align: middle;
	}
	
	:global(.material-icons) {
		vertical-align: middle;
	}
	
	nav {
		bottom: 0vh;
		display: flex;
		flex-direction: column-reverse;
		height: 100%;
		left: 0px;
		line-height: 2;
		margin: 0;
		padding: 0 2vw 10vh 7.5vw;
		text-align: left;
		width: 10rem;
	}
	
	ul {
		list-style: none;
		padding: 0;
	}
	
	li {
		text-decoration: none;
		list-style: none;
		padding: 2vh 0;
	}
	
	@media (min-width: 500px) {
		nav {
			min-width: 30%;
		}
		
		#menuButton {
			padding: 0 0 0 20vw;
		}
	}
	
	@media (min-width: 1000px) {
		nav {
			max-width: 10%;
		}
		
		#menuButton {
			padding: 0 0 0 35vw;
		}
	}
	
	@media (max-height: 500px) {
		#menuButton {
			visibility: hidden;
			animation: 500ms fadeout;
		}	
	}
	
	@keyframes fadeout {
		from {
			visibility: visible;
			opacity: 100%;
		}
		
		to {
			visibility: hidden;
			opacity: 0%;
		}
	}
	
	
</style>