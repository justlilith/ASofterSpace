<script lang="ts">
	import { authService } from '$lib/services/authService';
	import * as Helpers from '$lib/helpers';
	import { themeService } from '$lib/services/themeService';
	import { goto } from '$app/navigation';

	let loginPage = true;
	let signupPage = false;

	let name;
	let email;
	let password;

	let theme = themeService.theme;

	async function signin() {
		// console.log('signin invoked')
		let user, session, error;

		[user, session, error] = await authService.login(email, password);

		if (error) {
			Helpers.notify(error.message, 2000, 'bad');
		}
		if (session) {
			Helpers.notify(`way to go! login successful ✨ you'll now be redirected`, 1500, `good`);
			setTimeout(() => {
				window.location.href = '/';
			}, 2000);
			// Helpers.notify('login successful :>')
		}
		console.log(user, session, error);
		authService.active.isAuthed = true;
		const form: HTMLFormElement = document.querySelector('#loginForm');
		form.reset();
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
			setTimeout(() => {
				goto('/chat');
			}, 2000);
		}
	}

	function clearForm() {
		name = null;
		email = null;
		password = null;
	}
</script>

<section class="center">
	{#if loginPage}
		<div class="center">
			<h2>Log in</h2>
			{#if authService.active.isAuthed}
				<!-- <h2>Authed</h2> -->
			{/if}

			<form id="loginForm">
				<input bind:value={email} id="email" placeholder="email" />

				<input bind:value={password} id="pass" type="password" placeholder="password" />

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

			<p>
				New to A Softer Space?
				<button
					on:click={() => {
						clearForm();
						loginPage = false;
						signupPage = true;
					}}>Sign up here, okay?</button
				>
			</p>
		</div>
	{/if}

	{#if signupPage}
		<div class="center">
			<h2>Sign up</h2>

			<form action="/signup" id="signupForm">
				<input bind:value={name} id="name" placeholder="name" />

				<input bind:value={email} id="email" placeholder="email" />

				<input bind:value={password} id="pass" type="password" placeholder="password" />

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
					on:click={() => {
						newAccount();
					}}
				>
					Sign up
				</button>
			</div>

			<p>
				Already have an account?
				<button
					on:click={() => {
						clearForm();
						loginPage = true;
						signupPage = false;
					}}>Log in here, okay?</button
				>
			</p>
		</div>
	{/if}
</section>

<style lang="scss">
	section {
		width: 100%;
		margin-left: auto;
		margin-right: auto;
		align-content: center;
		text-emphasis: center;
	}

	form {
		display: inline-flex;
		flex-direction: column;
	}
</style>
