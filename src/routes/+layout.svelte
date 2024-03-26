<script lang="ts">
	import { onMount } from 'svelte';
	import Menu from '$lib/components/Menu.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import * as Helpers from '$lib/components/ts/helpers';
	import * as Auth from '$lib/services/authService';
	import themeStore from '$lib/components/ts/themeStore';

	let name;
	let theme;
	let showMenu;
	let isAuthed;

	let authService = Auth.authService;

	onMount(async () => {
		const appStorage = window.localStorage;

		theme = Helpers.fetchTheme(appStorage, themeStore, 'theme');

		if (!theme) {
			theme = 'deep-blue';
			themeStore.update(() => {
				return theme;
			});

			console.log(`theme updated to ${theme} :>`);
			const html = document.getElementsByTagName('html')[0];
			html.className = theme;

			Helpers.saveToLocal(appStorage, 'theme', theme);
		}

		themeStore.subscribe((newTheme) => {
			theme = newTheme;
		});

		let isAuthed = await authService.authCheck();
		if (isAuthed) {
			name = `, ${(await authService.getUserData()).data.name ?? 'friend'}`;
			// name = supabase
		}
	});
</script>

<svelte:head>
	<title>a softer space</title>
</svelte:head>

<main class={theme}>
	<Menu {theme} bind:isAuthed bind:showMenu/>

	<slot />
	<Toast {theme} />
</main>
