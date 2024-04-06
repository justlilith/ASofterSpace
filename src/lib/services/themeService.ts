import { writable, type Writable } from "svelte/store"
import { localStorageService } from "./localStorageService"
import { notify } from "$lib/helpers";

class ThemeService {
	constructor() {
		this.appStorage = localStorageService.storage
	}

	appStorage: Storage;
	theme: string
	themeStore: Writable<string> = writable()

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
			localStorageService.saveToLocal({ prop: 'theme', value: theme })
		}

		const html = document.getElementsByTagName('html')[0]
		html.className = theme
	}

	changeTheme(theme: string): void {
		const interstitial = document.createElement('div')
		interstitial.id = 'interstitial'
		document.body.prepend(interstitial)

		setTimeout(() => {
			this.themeStore.update(() => {
				return theme
			})


			console.log(`theme updated to ${theme} :>`)
			const html = document.getElementsByTagName('html')[0]
			html.className = theme

			localStorageService.saveToLocal({ prop: 'theme', value: theme })
		}, 150)

		setTimeout(() => {
			document.getElementById('interstitial') ? document.body.removeChild(document.getElementById('interstitial')) : null
			notify(`your new theme is ${theme}! c:`, 2500)
		}, 300)

	}
}

const themeService = new ThemeService()

export {
	themeService
}