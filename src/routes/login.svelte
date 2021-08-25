<svelte:head>
<title>a softer space :: login</title>

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
	import themeStore from '../components/ts/themeStore'
	import Toast from '../components/Toast.svelte'
	import * as Helpers from '../components/ts/helpers'
	import fetch from 'isomorphic-fetch'
	
	
	import { authCheck, authDataStore, login, signOut, testHeaders } from '../components/ts/auth'
	import type { Session, User } from '@supabase/gotrue-js';
	import Settings from './settings.svelte';
	
	export let theme = ''
	
	let isAuthed:boolean
	
	
	
	onMount(async () => {
		const appStorage = window.localStorage
		Helpers.setListenerOpacity(25)
		
		theme = Helpers.fetchTheme(appStorage, themeStore, 'theme')
		
		if (!theme) {
			theme = 'deep-blue'
		}
		
		themeStore.subscribe((newTheme) => {
			theme = newTheme
		})
		authCheck()
		.then(res => {
			console.log(res)
			isAuthed =  res
		})
		
	})
	// export let name: string;
	
	let email:string
	let password:string
	
	
	async function signin () {
		// console.log('signin invoked')
		let user, session, error
		
		[user, session, error] = await login(email, password)
		
		if (error) {
			Helpers.notify(error.message,2000, 'bad')
		}
		if (session) {
			Helpers.notify('way to go! login successful ✨',2000, 'good')
			setTimeout(() => {
					window.location.href='/'
				},2000)
				// Helpers.notify('login successful :>')
			}
			console.log(user, session, error)
			isAuthed = true
			const form:HTMLFormElement = document.querySelector('#loginForm')
			form.reset()
		}
	</script>
	
	
	
	<Menu {theme}></Menu>
	
	<main class={theme}>
		<h1>Login</h1>
		{#if isAuthed}
		<!-- <h2>Authed</h2> -->
		{/if}
		
		<form action='/login' id='loginForm'>
			<input 
			bind:value={email}
			transition:fade='{{duration: 100, delay:100}}'
			id='email' placeholder="email@mailboxx.com">
			
			<input
			bind:value={password}
			transition:fade='{{duration: 100, delay:150}}'
			id='pass' type="password" placeholder="password">
			
			<input type='submit' style='display:none'
			on:click|preventDefault="{() => {
				signin()
			}}">
		</form>
		
		
		<div>
			<button class={theme}
			transition:fade='{{duration: 100, delay:200}}'
			on:click='{() => {
				signin()
			}}'>Login
		</button>
		<!-- <button class={theme}
		transition:fade='{{duration: 100, delay:200}}'
		on:click='{() => {
			testHeaders()
		}}' >Test Headers -->
	<!-- </button> -->
</div>

<p transition:fade='{{duration: 100, delay:250}}'>New to A Softer Space?
	<a href='/signup'>Sign up here, okay?</a>
</p>

<Toast {theme}></Toast>

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