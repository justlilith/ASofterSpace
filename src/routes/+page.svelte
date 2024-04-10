<script lang="ts">
	import { goto } from '$app/navigation';
	import AuthMenu from '$lib/components/auth/authMenu.svelte';
	import { authService } from '$lib/services/authService';
</script>

<div class="center main">
	<h1>welcome to a softer space</h1>

	<p>
		To get started, visit <a href="/chat">the chat</a>; it's a free area to speak and vent your
		thoughts, as if texting a friend.
	</p>
	<p>Nothing is stored unless you choose to create an account and sync your chat.</p>
	<p><a href="/login">Log in or create an account here</a>.</p>
	<button
		on:click={() => {
			goto('/chat');
		}}>Visit the chat!</button
	>
	<h2>what is this?</h2>
	<p>a softer space is a solitary journaling app, where you can text your emotions and feeling to a void and save them for later review.</p>
</div>

<style lang="scss">
	.main {
		text-align: center;
	}
</style>
