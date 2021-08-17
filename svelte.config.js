import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(
			{ pages:'docs'
			, assets:'docs'
			, fallback: null
		})
		// hydrate the <div id="svelte"> element in src/app.html
	,	target: '#svelte'
	// , ssr: false
	, vite:
	{ config: 'vite.config.js'
	}
}
};

export default config;
