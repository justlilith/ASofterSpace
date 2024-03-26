<script lang="ts">
	import AuthMenu from '$lib/components/auth/authMenu.svelte';
</script>

<h1>welcome to a softer space</h1>

<AuthMenu />

<style lang="scss">
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
</style>
