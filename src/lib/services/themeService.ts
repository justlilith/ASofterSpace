import type { Writable } from "svelte/store"
import { localStorageService } from "./localStorageService"

class ThemeService {
	constructor() { }

	theme: string

	themes: string[] =
		['deep-blue'
			, 'deep-pink'
			, 'soft-blue'
			, 'soft-pink'
		]

	fetchTheme(appStorage: Storage, themeStore: Writable<string>, type: string) {
		const themes =
			['deep-blue'
				, 'deep-pink'
				, 'soft-blue'
				, 'soft-pink']

		let theme
		try {
			theme = JSON.parse(appStorage.getItem('theme'))
			if (!theme) {
				throw new Error('theme not found :<')
			}
			themeStore.update(() => {
				let currentThemeIndex = 0
				currentThemeIndex = themes.indexOf(theme)
				return themes[currentThemeIndex]
			})
			console.log(`theme found: ${theme}`)
			this.theme = theme;
		} catch (error) {
			console.warn(error.message)
			console.warn('%cdefaulting theme to %cdeep-blue', 'color:white;', 'color:cyan;')
			theme = 'deep-blue'
			themeStore.update(() => {
				let currentThemeIndex = 0
				currentThemeIndex = themes.indexOf(theme)
				return themes[currentThemeIndex]
			})
			localStorageService.saveToLocal({ appStorage, prop: 'theme', value: theme })
		}

		const html = document.getElementsByTagName('html')[0]
		html.className = theme
	}
}

const themeService = new ThemeService()

export {
	themeService
}