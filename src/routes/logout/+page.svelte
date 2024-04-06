<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthMenu from '$lib/components/auth/authMenu.svelte';
	import { authService } from '$lib/services/authService';
	import { onMount } from 'svelte';

	onMount(async() => {
		authService.signOut()
	})
</script>

<div class="center main">
	{#if !authService.active.user}
		<p>You are not logged in.</p>
	{/if}
</div>

<style lang="scss">
	.main {
		text-align: center;
	}
</style>
