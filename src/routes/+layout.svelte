<script context="module">
	export const load = async ({ page }) => {
		console.log(page.path)
		return {
			props: {
				key: page.path,
			},
		}
	}
</script>

<script>
	let key
</script>

<slot></slot>