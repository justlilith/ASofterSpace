<script lang="ts">
	import { onMount } from 'svelte';
	import Menu from '$lib/components/Menu.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import * as Helpers from '$lib/components/ts/helpers';
	import { authService } from '$lib/services/authService';
	import themeStore from '$lib/components/ts/themeStore';
	import Construction from '$lib/components/banners/construction.svelte';
	import { themeService } from '$lib/services/themeService';
	import { localStorageService } from '$lib/services/localStorageService';

	let name;
	let theme;
	let showMenu;
	let isAuthed;

	authService.authDataStore.subscribe((update) => {
		isAuthed = update.isAuthed;
	});

	onMount(async () => {
		const appStorage = window.localStorage;

		themeService.fetchTheme(appStorage, themeStore, 'theme');

		theme = themeService.theme;

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

		if (localStorageService.enabled) {
			authService.checkLocalAuth();
		}
	});
</script>

<svelte:head>
	<title>a softer space</title>
</svelte:head>

<Construction />
<main class={theme}>
	<Menu {theme} bind:isAuthed bind:showMenu />

	<slot />
	<Toast {theme} />
</main>

<style lang="scss">
	main {
		margin-left: auto;
		margin-right: auto;
	}
	@media (min-width: 500px) {
		main {
			min-width: 80%;
		}
	}

	@media (min-width: 1000px) {
		main {
			max-width: 60%;
		}
	}
</style>
