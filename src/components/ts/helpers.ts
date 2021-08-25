import { browser } from '$app/env'
import themeStore from './themeStore'
import { toastStore } from './toastStore'
import { get } from 'svelte/store'
import type { Session } from '@supabase/gotrue-js';


if (browser) {
	const appStorage = window.localStorage;
	console.log(appStorage)
}

// const currentDate = new Date();
// const dateString = currentDate.toDateString().replace(/\s/g, "-");
// const chatName: string = "";


const clearStash = (appStorage: Storage): void => {
	// appStorage.clear();
	appStorage.setItem("chats",'')
	notify(`stash cleared! c:`, 3000)
};


const clearChat = (messageList:MessageT[]):MessageT[] => {
	messageList = [];
	console.log("chat cleared");
	notify(`chat cleared! c:`, 3000)
	return messageList
};


function fetchFromLocal (appStorage:Storage, prop:string) {
	try {
		const value = JSON.parse(appStorage.getItem(prop))
		return value
	} catch (error) {
		console.warn(error)
		return error
	}
}


const fetchTheme = (appStorage:Storage, themeStore, type:string):string => {
	const themes = 
	[ 'deep-blue'
	, 'deep-pink'
	, 'soft-blue'
	, 'soft-pink' ]
	
	let theme
	let listener
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
		console.warn(error.message)
		console.warn('%cdefaulting theme to %cdeep-blue', 'color:white;', 'color:cyan;')
		theme = 'deep-blue'
		themeStore.update(() => {
			let currentThemeIndex = 0
			currentThemeIndex = themes.indexOf(theme)
			return themes[currentThemeIndex]
		})
		saveToLocal(appStorage,'theme',theme)
	}
	
	try {
		listener = JSON.parse(appStorage.getItem('listener'))
		if (!listener) {
			throw new Error('no listener stored')
		}
		console.log(`listener found: ${listener}`)
	} catch (error) {
		listener = 'the sun'
		console.warn(error.message)
		console.warn('%cdefaulting listener to %cthe sun)))', 'color:white;','color:red')
		saveToLocal(appStorage,'listener',listener)
	}
	listener = setListener(listener)
	
	const html = document.getElementsByTagName('html')[0]
	html.className = theme
	
	switch (type) {
		case 'theme':
		return theme
		case 'listener':
		return listener
		default:
		return
	}
}


function notify(toastMessage:string, duration?:number, mood = 'neutral'):void {
	// const marshmallow = document.createElement(div)
	// marshmallow.innerText = message
	// document.body.appendChild(marshmallow)
	
	if (!duration) {
		duration = 2000
	}
	
	const array = new Int8Array(1)
	const toast:ToastT = {
		message: toastMessage,
		duration: duration,
		id: crypto.getRandomValues(array)[0],
		mood: mood
	}
	
	// const toastQueue = get(toastStore)
	// console.log(toastQueue)
	
	toastStore.update((toastQueue:ToastT[]) => {
		// console.log(toastQueue)
		// console.log('message added: ' + JSON.stringify(toast))
		return [...toastQueue, toast]
	})
}


const saveChat = (filename:string, messageList:MessageT[]): void => {
	notify('downloading chat! c:', 1000)
	filename = filename ? filename : "Saved Chat"
	const chat = messageList
	.map((message) => `${message.timestamp} from ${message.sender}:
	${message.content}
	`)
	.join("\n");
	console.log(chat);
	const date = new Date()
	const filenameFinal = `${filename} (from ${date.toDateString()})`
	const file = new File([chat], filenameFinal, {
		type: 'text/plain'
	})
	const download = document.createElement('a')
	download.setAttribute('id',file.name)
	download.setAttribute('download',filenameFinal)
	const link = URL.createObjectURL(file)
	download.setAttribute('href',link)
	document.body.append(download)
	download.click()
	download.onload = () => {URL.revokeObjectURL(link)}
	document.body.removeChild(download)
};


function saveToLocal (appStorage, prop:string, value:string|Session|UserData):void {
	appStorage.setItem(prop,JSON.stringify(value))
	console.log(appStorage.getItem(prop))
}


function setListener (currentListener:string):string {
	const sun = document.getElementById('p5Sketch')
	const cube = document.getElementById('p5Sketch2')
	switch (currentListener){
		case 'the sun':
		sun.classList.remove('hidden')
		cube.classList.add('hidden')
		break
		default:
		case 'the cube':
		sun.classList.add('hidden')
		cube.classList.remove('hidden')
		break
	}
	// notify(`${currentListener} is now listening to you! c:`, 1000)
	return currentListener
}


function setListenerOpacity (opacity):void {
	const regex = /opacity*/
	const listeners = Array.from(document.getElementsByClassName('p5Sketch'))
	listeners.forEach(element => {
		const array = Array.from(element.classList)
		const oldClass = array.filter(className => {
			return className.search(regex) == 0
		})?.[0]?.toString()
		oldClass ? element.classList.remove(oldClass) : null
		element.classList.add(`opacity-${opacity}`)
	})
}


const stashChat = (appStorage:Storage, chatName:string, messageList:MessageT[]): void => {
	// const stashName: string = `${dateString}-${chatName.replace(/\s/g, "-")}`;
	// const messages = new Set(messageList);
	appStorage.setItem("chats", JSON.stringify(messageList));
	console.log(appStorage.getItem("chats"));
	notify('chat stashed! c:', 1000)
};


function updateListener (appStorage, currentListener:string):string {
	// console.log(listener)
	const sun = document.getElementById('p5Sketch')
	const cube = document.getElementById('p5Sketch2')
	switch (currentListener){
		case 'the sun':
		sun.classList.add('hidden')
		cube.classList.remove('hidden')
		// console.log(listener)
		currentListener = 'the cube'
		break
		default:
		case 'the cube':
		sun.classList.remove('hidden')
		cube.classList.add('hidden')
		currentListener = 'the sun'
		break
	}
	saveToLocal(appStorage, 'listener',currentListener)
	notify(`${currentListener} is now listening to you~ c:`, 500)
	
	return currentListener
}


function updateTheme (appStorage:Storage, theme:string):void {	
	const themes = 
	[ 'deep-blue'
	, 'deep-pink'
	, 'soft-blue'
	, 'soft-pink' ]
	
	const themeIndex = (themes.indexOf(theme) + 1) % themes.length
	
	theme = themes[themeIndex]
	
	const interstitial = document.createElement('div')
	interstitial.id = 'interstitial'
	document.body.prepend(interstitial)
	
	setTimeout(() => {
		
		themeStore.update(() => {
			return theme
		})
		
		
		console.log(`theme updated to ${theme} :>`)
		const html = document.getElementsByTagName('html')[0] 
		html.className = theme
		
		saveToLocal(appStorage, 'theme',theme)
	},150)
	
	setTimeout(() => {
		document.getElementById('interstitial') ? document.body.removeChild(document.getElementById('interstitial')) : null
		notify(`your new theme is ${theme}! c:`, 500)
	},300)
	
}

export {
	clearChat
	, clearStash
	, fetchTheme
	, fetchFromLocal
	, notify
	, saveChat
	, saveToLocal
	, setListener
	, setListenerOpacity
	, stashChat
	, updateListener
	, updateTheme
}