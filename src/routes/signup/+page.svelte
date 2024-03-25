<script lang="ts">
	// import Fab from '@smui/fab'
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Stash from '$lib/components/Stash.svelte';
	import Menu from '$lib/components/Menu.svelte';
	import themeStore from '$lib/components/ts/themeStore';
	import Toast from '$lib/components/Toast.svelte';
	import * as Helpers from '$lib/components/ts/helpers';

	import { signup } from '$lib/components/ts/auth';

	export let theme = '';

	onMount(async () => {
		const appStorage = window.localStorage;
		Helpers.setListenerOpacity(25);

		theme = Helpers.fetchTheme(appStorage, themeStore, 'theme');

		if (!theme) {
			theme = 'deep-blue';
		}

		themeStore.subscribe((newTheme) => {
			theme = newTheme;
		});
	});
	// export let name: string;

	let email: string;
	let password: string;
	let name: string;

	async function newAccount() {
		let user, session, error;

		[user, session, error] = await signup(email, password, name);
		if (error) {
			Helpers.notify(JSON.stringify(error.message), 2000);
		}
		if (user) {
			const form: HTMLFormElement = document.querySelector('#signupForm');
			form.reset();
			Helpers.notify('congrats! your account is active c:', 2000, 'good');
			// Helpers.notify('congrats! check your email to confirm your account c:', 2000, 'good')
			setTimeout(() => {
				window.location.href = '/';
			}, 2000);
		}
	}
</script>

<svelte:head>
	<title>a softer space :: signup</title>

	<!-- <script id='p5' defer src="/p5/sketch.js"></script> -->
	<!-- <script id='p5' defer src="/p5/sketch2.js"></script> -->
</svelte:head>

<main class={theme}>
	<h1>Sign Up</h1>

	<form action="/signup" id="signupForm">
		<input
			bind:value={name}
			transition:fade={{ duration: 100, delay: 100 }}
			id="name"
			placeholder="Your Name"
		/>

		<input
			bind:value={email}
			transition:fade={{ duration: 100, delay: 100 }}
			id="email"
			placeholder="email@mailboxx.com"
		/>

		<input
			bind:value={password}
			transition:fade={{ duration: 100, delay: 150 }}
			id="pass"
			type="password"
			placeholder="password"
		/>

		<input
			type="submit"
			style="display:none"
			on:click|preventDefault={() => {
				newAccount();
			}}
		/>
	</form>

	<div>
		<button
			class={theme}
			transition:fade={{ duration: 100, delay: 200 }}
			on:click={() => {
				newAccount();
			}}
		>
			Sign up
		</button>
	</div>

	<p transition:fade={{ duration: 100, delay: 250 }}>
		Already have an account?
		<a href="/login">Log in here, okay?</a>
	</p>

	<Toast {theme} />
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
