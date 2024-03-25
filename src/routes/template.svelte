<svelte:head>
<title>a softer space :: settings</title>

<!-- <script id='p5' defer src="/p5/sketch.js"></script> -->
<!-- <script id='p5' defer src="/p5/sketch2.js"></script> -->
</svelte:head>

<script lang="ts">
	// import Fab from '@smui/fab'
	import { fade, slide } from 'svelte/transition'
	import { onMount } from 'svelte'
	import Stash from '../lib/components/Stash.svelte'
	import Menu from '../components/Menu.svelte'
	import themeStore from '../lib/components/ts/themeStore'
	import * as Helpers from '../lib/components/ts/helpers'
	
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
</script>




<main class={theme}>
	<section id="p5Sketch"></section>
	<section id="p5Sketch2"></section>
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
		max-width: 85%;
		height:100%;
		margin: 0 auto;
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