<script lang="ts">
	import themeStore from './ts/themeStore';
	// import button, { Label } from '@smui/button/bare.js'
	// import { Label } from '@smui/button/bare.js'
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import * as Helpers from './ts/helpers';
	import Toast from './Toast.svelte';
	import { themeService } from '$lib/services/themeService';
	import { localStorageService } from '$lib/services/localStorageService';

	let themeOption = themeService.theme;

	export let theme: string = '';

	let listener: string;

	onMount(async () => {
		theme = themeService.theme;

		themeStore.subscribe((newTheme) => {
			theme = newTheme;
			themeOption = newTheme;
		});
	});
</script>

<div class={theme}>
	{#if browser}
		<h2>Theme</h2>
		<p>
			current theme: <select
				bind:value={themeOption}
				on:change={(value) => {
					console.log(themeOption);
					themeService.changeTheme(themeOption);
				}}
			>
				<option value="soft-pink">soft pink</option>
				<option value="deep-pink">deep pink</option>
				<option value="soft-blue">soft blue</option>
				<option value="deep-blue">deep blue</option>
			</select>
		</p>
		<button class={theme} on:click={() => Helpers.updateTheme(localStorageService.storage, theme)}>
			<span>switch to next theme</span>
		</button>
		<!-- <p>current listener: {listener}</p>
	<button class={theme} on:click={() => listener = Helpers.updateListener(window.localStorage, listener)}>
		<span>Switch Listener</span>
	</button> -->
	{/if}
	<Toast {theme} />
</div>

<style lang="scss">
	// @import 'src/themes/allThemes-button';
</style>
