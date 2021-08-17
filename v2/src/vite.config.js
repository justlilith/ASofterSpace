import copy from 'rollup-plugin-copy'

// vite.config.js
const config = {
// 	optimizeDeps:
// 	{ exclude:
// 		[ '@smui/button'
// 		, '@smui/common'
// 		, '@smui/fab'
// 		, '@smui/*'
// 		, '@smui'
// 	]
// },
plugins:
[ copy (
	{ targets:
		[ { src:'./p5'
		, dest:'../docs'
	}
	, { src:'./root/**/*'
	, dest: '../docs'
}
]
, flatten:true
})

]
// config options
, ssr:
{ noExternal:
	[ '@smui/button'
	, '@smui/common'
	, '@smui/fab'
	, '@smui-theme'
	]
}
}

export default config