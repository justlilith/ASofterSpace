async function load ({ page }) {
	return {
		props: {
			key: page.path,
		},
	}
}