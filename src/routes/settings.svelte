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
	import ThemeSwitcher from '../components/ThemeSwitcher.svelte'
	import * as Helpers from '../components/ts/helpers'
	import * as Auth from '../components/ts/auth';
	
	let date = new Date()
	let theme = ''
	let isAuthed:boolean = false
	
	onMount(async () => {
		const appStorage = window.localStorage
		Helpers.setListenerOpacity(25)
		
		isAuthed = await Auth.authCheck()
		if (isAuthed) {
			if (!Auth.refreshTokenFetcherActive) {
				setInterval(() => {
					Auth.getRefreshToken()
				},1000 * 60 * 3)
			}
		}
	})
	
	
	// export let name: string;
	
</script>

<Menu {isAuthed} {theme}></Menu>


<main class={theme}>
	<ThemeSwitcher bind:theme></ThemeSwitcher>
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
		/* min-width: 400px; */
		max-width: 85%;
		/* width:100px; */
		height:100%;
		margin: 0 auto;
	}
	
	/* h1 {
		color: #fff;
		text-transform: lowercase;
		font-size: 3em;
		font-weight: 600;
	} */
	
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