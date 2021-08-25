<script lang='ts'>
	import themeStore from './ts/themeStore'
	// import button, { Label } from '@smui/button/bare.js'
	// import { Label } from '@smui/button/bare.js'
	import { browser } from '$app/env'
	import { onMount } from 'svelte'
	import * as Helpers from './ts/helpers'
	import Toast from './Toast.svelte'
	
	let themes = 
	[ 'deep-blue'
	, 'deep-pink'
	, 'soft-blue'
	, 'soft-pink'
	]
	
	export let theme:string = ''	
	
	let appStorage
	
	let listener:string
	
	onMount(async () => {
		const appStorage = window.localStorage
		theme = Helpers.fetchTheme(appStorage, themeStore, 'theme')
		listener = Helpers.fetchTheme(appStorage, themeStore, 'listener')
		
		themeStore.subscribe((newTheme) => {
			theme = newTheme
		})
	})

	
	
</script>

<div class={theme}>
	{#if browser}
	<p>current theme: {theme.replace('-', ' ')}</p>
	<button class={theme} on:click={() => Helpers.updateTheme(window.localStorage, theme)}>
		<span>Switch Theme</span>
	</button>
	<p>current listener: {listener}</p>
	<button class={theme} on:click={() => listener = Helpers.updateListener(window.localStorage, listener)}>
		<span>Switch Listener</span>
	</button>
	{/if}
	<Toast {theme}></Toast>
</div>

<style lang='scss'>
	@import '../themes/allThemes-button';
</style>