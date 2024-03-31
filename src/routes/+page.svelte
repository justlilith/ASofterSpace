<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthMenu from '$lib/components/auth/authMenu.svelte';
	import { authService } from '$lib/services/authService';
</script>

<div class="center main">
	<h1>welcome to a softer space</h1>

	<p>
		To get started, visit <a href="/chat">the chat</a>. Nothing is stored unless you have an account
		and choose to sync your progress. The chat is a free area to speak.
	</p>
	<button
		on:click={() => {
			goto('/chat');
		}}>Visit the chat</button
	>
	<p>Log in or create an account below to sync your progress.</p>

	{#if authService.active.user }
	<p>You are currently logged in.</p>
	{/if}
	<AuthMenu />
</div>

<style lang="scss">
	.main {
		text-align: center;
	}
</style>
