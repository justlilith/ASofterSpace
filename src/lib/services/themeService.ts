class ThemeService {
	constructor() { }
	
	theme: string

	themes: string[] =
		['deep-blue'
			, 'deep-pink'
			, 'soft-blue'
			, 'soft-pink'
		]
}

const themeService = new ThemeService()

export {
	themeService
}