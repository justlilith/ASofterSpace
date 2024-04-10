<script lang="ts">
	import { onMount } from 'svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import * as Helpers from '$lib/components/ts/helpers';
	import { authService } from '$lib/services/authService';
	import type { UserPacketT } from 'src/types/user';
	import { localStorageService } from '$lib/services/localStorageService';
	import { constants } from '$lib/constants/constants';

	let date = new Date();
	let theme = '';
	let isAuthed: boolean = authService.active?.isAuthed;
	let name: string = authService.active?.user?.user?.user_metadata?.name;
	let newName = name;

	onMount(async () => {
		console.log(name);
		await getName()
	});

	async function saveSettings() {
		let data: UserPacketT = await authService.getUserMetadata();
		let error = await authService.saveUserMetadata({ name: newName });
		if (error) {
			console.warn(error);
			Helpers.notify('Settings were not saved! ❌', 1000, 'bad');
			return;
		}
		console.log(authService.active.user.user.user_metadata);
		Helpers.notify('Settings saved! ✨', 1000, 'good');
	}

	async function getName() {
		let data: UserPacketT = await authService.getUserMetadata();
		console.log(data);
		name = data.data.name;
	}
	// export let name: string;
</script>

<svelte:head>
	<title>a softer space :: settings</title>
</svelte:head>

<main class="center">
	<h1>Settings</h1>

	<ThemeSwitcher bind:theme />

	{#if authService.active.isAuthed}
		<h2>Account options</h2>
	{/if}

	{#if isAuthed}
		<form action="/settings" id="settingsForm">
			<p>Current name: {name}</p>
			<p>Change name:</p>
			<input bind:value={newName} placeholder={name} />
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
			>Save account options
		</button>
	{/if}
</main>

<style lang="scss">
	@import 'src/themes/allThemes';

	main {
		position: relative;
		text-align: center;
		padding: 1em;
		/* min-width: 400px; */
		// max-width: 85%;
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
