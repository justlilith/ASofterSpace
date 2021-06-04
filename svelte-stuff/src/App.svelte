<script lang="ts">
	export let name: string;
</script>

<main>
	<h1>here's a softer space</h1>
	<br>
	<p>Let's talk.</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
	
	h1 {
		color: #fff;
		text-transform: lowercase;
		font-size: 3em;
		font-weight: 600;
	}
	
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>