<script lang='ts'>
	import themeStore from './ts/themeStore'
	import Button, { Label } from '@smui/button'
	
	let themes = 
	[ 'deep-blue'
	, 'deep-pink'
	, 'soft-blue'
	, 'soft-pink'
	]
	
	export let theme:string = ''
	
	const appStorage = window.localStorage
	
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
	} catch (error) {
		theme = ''
		console.log(error)
	}

	themeStore.subscribe((newTheme) => {
		theme = newTheme
	})
	
	const saveTheme = (theme:string):void => {
		appStorage.setItem('theme',JSON.stringify(theme))
		console.log(appStorage.getItem('theme'))
	}
	
	const updateTheme = () => {
		let interstitial = document.createElement('div')
		document.body.prepend(interstitial)
		interstitial.id = 'interstitial'
		
		setTimeout(() => {
			themeStore.update(() => {
				let currentThemeIndex = 0
				currentThemeIndex = (themes.indexOf(theme) + 1) % themes.length
				return themes[currentThemeIndex]
			})
			
			console.log(`theme updated to ${theme} :>`)
			let html = document.getElementsByTagName('html')[0] 
			html.className = theme
			
			saveTheme(theme)
		},150)
		
		setTimeout(() => {
			document.getElementById('interstitial') ? document.body.removeChild(document.getElementById('interstitial')) : null
		},300)
		
	}
	
	let html = document.getElementsByTagName('html')[0]
	html.className = theme
</script>

<div class={theme}>
	<Button variant='unelevated' on:click={() => updateTheme()}>
		<Label>Switch Theme</Label>
	</Button>
	<p>Current theme: {theme.replace('-', ' ')}</p>
</div>

<style lang='scss'>
	
</style>