<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthMenu from '$lib/components/auth/authMenu.svelte';
	import { authService } from '$lib/services/authService';
</script>

<div class="center main">
	<h1>Account management</h1>

	{#if authService.active.user}
		<p>You are currently logged in.</p>
		<button
			on:click={() => {
				authService.signOut();
			}}>Log out</button
		>
	{:else}
		<p>Log in or create an account below to sync your chat.</p>
		<AuthMenu />
	{/if}
</div>

<style lang="scss">
	.main {
		text-align: center;
	}
</style>
