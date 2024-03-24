import preprocess from 'svelte-preprocess';
// import copy from 'rollup-plugin-copy'
// import adapter from '@sveltejs/adapter-static'
import adapter from '@sveltejs/adapter-netlify'

/** @type {import('@sveltejs/kit').Config} */
const config = {
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
		adapter: adapter({
			edge: true,
		}),
		// hydrate the <div id="svelte"> element in src/app.html
		appDir: 'internal'
		// , paths:
		// { base: '/asofterspace'
		// }
		// , ssr: false
		// , vite:
		// { config: {
		// 	// 	optimizeDeps:
		// 	// 	{ exclude:
		// 	// 		[ '@smui/button'
		// 	// 		, '@smui/common'
		// 	// 		, '@smui/fab'
		// 	// 		, '@smui/*'
		// 	// 		, '@smui'
		// 	// 	]
		// 	// },
		// 	// plugins:
		// 	// [ copy (
		// 	// 	{ targets: [
		// 	// 		{ src:'p5'
		// 	// 		, dest:'../docs'
		// 	// 	}
		// 	// 	, { src:'root/**/*'
		// 	// 		, dest: '../docs'
		// 	// 	}
		// 	// ]
		// 	// , flatten:true
		// 	// })

		// 	// ]
		// 	// config options
		// 	// ssr:
		// 	// { noExternal:
		// 	// 	[ '@smui/button'
		// 	// 	, '@smui/common'
		// 	// 	, '@smui/fab'
		// 	// 	, '@smui-theme'
		// 	// 	]
		// 	// }
		// 	}
		// }
	}
};

export default config;
