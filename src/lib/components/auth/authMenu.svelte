<script lang="ts">
	import { authService } from '$lib/services/authService';
	import { fade } from 'svelte/transition';
	import * as Helpers from '$lib/helpers'
	import { theme } from '$lib/services/themeService';

	let loginPage = true;
	let signupPage = false;

	let name;
	let email;
	let password;

	async function signin () {
		// console.log('signin invoked')
		let user, session, error
		
		[user, session, error] = await authService.login(email, password)
		
		if (error) {
			Helpers.notify(error.message,2000, 'bad')
		}
		if (session) {
			Helpers.notify(`way to go! login successful ✨ you'll now be redirected`, 1500, `good`)
			setTimeout(() => {
				window.location.href='/'
			},2000)
			// Helpers.notify('login successful :>')
		}
		console.log(user, session, error)
		authService.active.isAuthed = true
		const form:HTMLFormElement = document.querySelector('#loginForm')
		form.reset()
	}

	async function newAccount() {
		let user, session, error;

		[user, session, error] = await authService.signUp(email, password, name);
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

{#if loginPage}
	<h1>Login</h1>
	{#if authService.active.isAuthed}
		<!-- <h2>Authed</h2> -->
	{/if}

	<form action="/login" id="loginForm">
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
				signin();
			}}
		/>
	</form>

	<div>
		<button
			class={theme}
			transition:fade={{ duration: 100, delay: 200 }}
			on:click={() => {
				signin();
			}}
			>Login
		</button>
		<!-- <button class={theme}
	transition:fade='{{duration: 100, delay:200}}'
	on:click='{() => {
		testHeaders()
	}}' >Test Headers -->
		<!-- </button> -->
	</div>

	<p transition:fade={{ duration: 100, delay: 250 }}>
		New to A Softer Space?
		<a href="/signup">Sign up here, okay?</a>
	</p>
{/if}

{#if signupPage}
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
{/if}
