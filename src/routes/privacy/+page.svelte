<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthMenu from '$lib/components/auth/authMenu.svelte';
	import { constants } from '$lib/constants/constants';
	import { authService } from '$lib/services/authService';
	import { localStorageService } from '$lib/services/localStorageService';

	function toggleStorage() {
		localStorageService.enabled = !localStorageService.enabled;
		if (localStorageService.enabled) {
			localStorageService.saveToLocal({ prop: constants.keys.storageEnableKey, value: 'true' });
		} else {
			async () => authService.signOut()
			localStorageService.clear(constants.keys.storageEnableKey);
		}
	}
</script>

<div class="center main">
	<h1>a softer space privacy information</h1>

	<h2>Cookies</h2>

	<p>The ability to sync chats in a softer space requires cookies. These are deleted when you log out.</p>

	<h2>Device storage</h2>

	<p>
		Device storage status: <strong
			>{#if localStorageService.enabled}enabled{:else}disabled{/if}</strong
		>
	</p>

	<p>
		Local device storage is essential for operation of a softer space's settings and theme
		persistence features. (This saves your selected theme when you reopen a softer space.)
	</p>
	<p>
		a softer space saves some necessary data when you create an account. This allows you to sync
		your chat.
	</p>
	<p>
		Enabling device storage is essential to save your settings. You won't be able to save your
		settings unless device storage is enabled.
	</p>
	<p><strong>Please note: disabling this logs you out immediately.</strong></p>
	<button
		on:click={() => {
			toggleStorage();
		}}
	>
		{#if localStorageService.enabled}
			Disable
		{:else}
			Enable
		{/if} storage</button
	>
</div>

<style lang="scss">
	.main {
		text-align: center;
	}
</style>
