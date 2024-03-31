import preprocess from 'svelte-preprocess';
// import copy from 'rollup-plugin-copy'
// import adapter from '@sveltejs/adapter-static'
import adapter from '@sveltejs/adapter-netlify'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	onwarn: (warning, handler) => {
		if (warning.code.startsWith('css-unused')){
			return
		}
		handler(warning)
	},
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// svelte adapter-static:
		// adapter: adapter(
		// 	{ pages:'docs'
		// 	, assets:'docs'
		// 	, fallback: null
		// })
		alias: {
			"$lib": "src/lib",
			"$lib/*": "src/lib/*"
		},
		adapter: adapter({
			edge: true,
		}),
	}
};

export default config;
