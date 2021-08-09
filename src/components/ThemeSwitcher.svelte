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

	let listener:string

	try {
		listener = JSON.parse(appStorage.getItem('listener'))
		if (!listener) {
			throw new Error('no listener stored')
		}
		console.log(`listener found: ${listener}`)
	} catch (error) {
		listener = 'the sun'
		console.warn(error)
		console.log('defaulting to sun)))')
	}
	listener = setListener(listener)


	themeStore.subscribe((newTheme) => {
		theme = newTheme
	})
	


	function saveToLocal (prop:string, value:string):void {
		appStorage.setItem(prop,JSON.stringify(value))
		console.log(appStorage.getItem(prop))
	}
	
	const updateTheme = () => {
		let interstitial = document.createElement('div')
		interstitial.id = 'interstitial'
		document.body.prepend(interstitial)
		
		setTimeout(() => {
			themeStore.update(() => {
				let currentThemeIndex = 0
				currentThemeIndex = (themes.indexOf(theme) + 1) % themes.length
				return themes[currentThemeIndex]
			})
			
			console.log(`theme updated to ${theme} :>`)
			let html = document.getElementsByTagName('html')[0] 
			html.className = theme
			
			saveToLocal('theme',theme)
		},150)
		
		setTimeout(() => {
			document.getElementById('interstitial') ? document.body.removeChild(document.getElementById('interstitial')) : null
		},300)
		
	}

	function setListener (currentListener:string):string {
		let sun = document.getElementById('p5Sketch')
		let cube = document.getElementById('p5Sketch2')
		switch (currentListener){
			case 'the sun':
				sun.setAttribute('class', '')
				cube.setAttribute('class', 'hidden')
				break
			default:
			case 'the cube':
				sun.setAttribute('class', 'hidden')
				cube.setAttribute('class', '')
				break
		}
		return currentListener
	}

	function updateListener (currentListener:string):string {
		// console.log(listener)
		let sun = document.getElementById('p5Sketch')
		let cube = document.getElementById('p5Sketch2')
		switch (currentListener){
			case 'the sun':
				sun.setAttribute('class', 'hidden')
				cube.setAttribute('class', '')
				// console.log(listener)
				currentListener = 'the cube'
				break
			default:
			case 'the cube':
				sun.setAttribute('class', '')
				cube.setAttribute('class', 'hidden')
				currentListener = 'the sun'
				break
		}
		saveToLocal('listener',currentListener)
		return currentListener
	}
	
	let html = document.getElementsByTagName('html')[0]
	html.className = theme
</script>

<div class={theme}>
	<Button variant='unelevated' on:click={() => updateTheme()}>
		<Label>Switch Theme</Label>
	</Button>
	<Button variant='unelevated' on:click={() => listener = updateListener(listener)}>
		<Label>Switch Listener</Label>
	</Button>
	<p>current theme: {theme.replace('-', ' ')}</p>
	<p>current listener: {listener}</p>
</div>

<style lang='scss'>
	
</style>