<svelte:head>
<title>a softer space :: settings</title>

<!-- <script id='p5' defer src="/p5/sketch.js"></script> -->
<!-- <script id='p5' defer src="/p5/sketch2.js"></script> -->
</svelte:head>

<script lang="ts">
	// import Fab from '@smui/fab'
	import { fade, slide } from 'svelte/transition'
	import { bind } from 'svelte/internal'
	import { onMount } from 'svelte'
	import Stash from '../components/Stash.svelte'
	import Menu from '../components/Menu.svelte'
	import themeStore from '../components/ts/themeStore'
	import * as Helpers from '../components/ts/helpers'
	
	export let theme = ''
	
	onMount(async () => {
		const appStorage = window.localStorage
		Helpers.setListenerOpacity(25)
		
		theme = Helpers.fetchTheme(appStorage, themeStore, 'theme')
		
		if (!theme) {
			theme = 'deep-blue'
		}
		
		themeStore.subscribe((newTheme) => {
			theme = newTheme
		})
	})
	// export let name: string;
</script>



<Menu {theme}></Menu>

<main class={theme}>
	<h1>Login</h1>
	
	<input 
	transition:fade='{{duration: 100, delay:100}}'
	id='email' placeholder="email@mailboxx.com">
	
	<input 
	transition:fade='{{duration: 100, delay:150}}'
	id='pass' type="password" placeholder="password">
	
	<div>
		<button
		class={theme}
		transition:fade='{{duration: 100, delay:200}}'
		on:click='{() => {}}'
		>
		Login
	</button>
</div>

<p transition:fade='{{duration: 100, delay:250}}'>New to A Softer Space?
	<a href='/signup'>Sign up here, okay?</a>
</p>

</main>




<style lang='scss'>
	@use '@material/theme/color-palette';
	
	$background: #000;
	
	@use '@material/theme/index' as theme with (
	$primary: color-palette.$blue-500,
	$secondary: color-palette.$teal-600,
	$surface: #fff,
	$background: $background,
	$error: #b00020,
	);
	
	@import '../themes/allThemes';
	
	main {
		position:relative;
		text-align: center;
		padding: 1em;
		/* min-width: 400px; */
		max-width: 85%;
		/* width:100px; */
		height:100%;
		margin: 0 auto;
	}
	
	h1 {
		// text-transform: lowercase;
		font-size: 3em;
		font-weight: 600;
	}
	
	@media (min-width: 500px) {
		main {
			max-width: 60%;
		}
	}
	
	@media (min-width: 1000px) {
		main {
			max-width: 30%;
		}
	}
</style>