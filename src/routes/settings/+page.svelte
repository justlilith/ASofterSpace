<script lang="ts">
	// import Fab from '@smui/fab'
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Stash from '$lib/components/Stash.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import * as Helpers from '$lib/components/ts/helpers';
	import { authService } from '$lib/services/authService';

	let date = new Date();
	let theme = '';
	let isAuthed: boolean = false;
	let name: string = '';

	async function saveSettings() {
		let data: UserPacketT = await authService.getUserData();
		let userData = {
			id: data.id,
			name: name
		};
		console.log(userData);
		let error = await authService.saveUserData({ userData: userData });
		if (error) {
			console.warn(error);
			return;
		}
		Helpers.notify('Settings saved! ✨', 1000, 'good');
	}

	async function getName(): Promise<string> {
		let data: UserPacketT = await authService.getUserData();
		console.log(data);
		return data.data.name;
	}

	// export let name: string;
</script>

<svelte:head>
	<title>a softer space :: settings</title>

	<!-- <script id='p5' defer src="/p5/sketch.js"></script> -->
	<!-- <script id='p5' defer src="/p5/sketch2.js"></script> -->
</svelte:head>

<main class={theme}>
	<Menu {isAuthed} {theme} />
	{#if isAuthed}
		<h1>Account Settings</h1>
	{:else}
		<h1>Settings</h1>
	{/if}
	<ThemeSwitcher bind:theme />
	{#if isAuthed}
		<form action="/settings" id="settingsForm">
			<p>Change name:</p>
			<input bind:value={name} placeholder={name} />
			<input
				type="submit"
				style="display:none;"
				on:click|preventDefault={() => {
					saveSettings();
				}}
			/>
		</form>
		<button
			on:click|preventDefault={() => {
				saveSettings();
			}}
			>Save
		</button>
	{/if}
</main>

<style lang="scss">
	@use '@material/theme/color-palette';

	$background: #000;

	@use '@material/theme/index' as theme with (
	$primary: color-palette.$blue-500,
	$secondary: color-palette.$teal-600,
	$surface: #fff,
	$background: $background,
	$error: #b00020,
	);

	@import 'src/themes/allThemes';

	main {
		position: relative;
		text-align: center;
		padding: 1em;
		/* min-width: 400px; */
		max-width: 85%;
		/* width:100px; */
		height: 100%;
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
