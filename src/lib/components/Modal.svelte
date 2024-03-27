<script lang="ts">
	import { fade } from 'svelte/transition';
	export let theme: string = '';
	export let message: string = '';
	export let showModal: boolean = false;
	export let showByline: boolean = false;

	let paragraphs = message.split('\n');
</script>

<button
	class={theme}
	transition:fade={{ duration: 300 }}
	on:click={() => {
		showModal = false;
		console.log('kay??');
	}}
	id="backdrop"
/>
<aside transition:fade={{ duration: 300 }} id="modal" class="theme">
	<p id="modalMessage">
		{#if message}
			{#each paragraphs as paragraph}
				<p>{paragraph}</p>
			{/each}
			<slot />
			{#if showByline}
				<p>
					<a target="_blank" href="https://twitter.com/imjustlilith">—@imjustlilith</a> / A Softer Space
					Team
				</p>
			{/if}
		{:else}
			test
		{/if}
	</p>
</aside>

<style lang="scss">
	#modal {
		background: white;
		border-radius: 2px;
		margin: auto;
		min-height: 5vh;
		min-width: 20vw;
		padding: 5vh 5vw;
		position: fixed;
		top: 50vh;
		left: 50vw;
		transform: translate(-50%, -50%);
		z-index: 9001;
	}

	#modalMessage {
		vertical-align: middle;
	}

	#backdrop {
		background-color: black;
		height: 100vh;
		left: 0vw;
		opacity: 0.5;
		position: fixed;
		top: 0vh;
		width: 100vw;
		z-index: 9000;
	}

	@media (max-width: 500px) {
		#modal {
			width: 80vw;
		}
	}

	@media (min-width: 1000px) {
		#modal {
			max-width: 30vw;
		}
	}
</style>
