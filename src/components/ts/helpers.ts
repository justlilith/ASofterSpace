import { browser } from '$app/env'
import themeStore from './themeStore'
import { toastStore } from './toastStore'
// import { get } from 'svelte/store'
import type { Session } from '@supabase/gotrue-js';
import type { Writable } from 'svelte/store';


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


const clearChat = (chatPacket:ChatPacketT):MessageT[] => {
	chatPacket.chatFullText = [];
	console.log("chat cleared");
	notify(`chat cleared! c:`, 3000)
	return chatPacket.chatFullText
};


function fetchFromLocal (appStorage:Storage, prop:string) {
	try {
		const value = JSON.parse(appStorage.getItem(prop))
		return value
	} catch (error) {
		console.warn(error?.message)
		return null
	}
}


const fetchTheme = (appStorage:Storage, themeStore:Writable<string>, type:string):string => {
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


function newModal(message?:string):void {
	const modal:HTMLElement = document.createElement('aside')
	const backdrop:HTMLElement = document.createElement('div')

	modal.innerText = message || `test`
	modal.setAttribute('id','modalPopup')
	modal.setAttribute('style',`
	margin: auto;
	position: fixed;
	min-height: 20vh;
	min-width: 20vw;
	top: 40vh;
	`)
	backdrop.setAttribute('id','backdrop')
	backdrop.setAttribute('style',`
background-color: black;
position:fixed;
height: 100vh;
opacity: 0.5;
width: 100vw;
top: 0vh;
	`)
	backdrop.addEventListener('click', function removeModal(){
		document.body.removeChild(document.getElementById('modalPopup'))
		document.body.removeChild(document.getElementById('backdrop'))
	})
	document.body.appendChild(backdrop)
	document.body.appendChild(modal)
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
		mood: mood,
		remaining: duration / 1000
	}
	
	// const toastQueue = get(toastStore)
	// console.log(toastQueue)
	
	toastStore.update((toastQueue:ToastT[]) => {
		// console.log(toastQueue)
		// console.log('message added: ' + JSON.stringify(toast))
		return [...toastQueue, toast]
	})
}


const saveChat = (chatPacket:ChatPacketT): void => {
	notify('downloading chat! c:', 1000)
	chatPacket.chatName = chatPacket.chatName ? chatPacket.chatName : "Saved Chat"
	const chat = chatPacket.chatFullText
	.map((message) => `${message.timestamp} from ${message.sender}:
	${message.content}
	`)
	.join("\n");
	console.log(chat);
	const date = new Date()
	const filenameFinal = `${chatPacket.chatName} (from ${date.toDateString()})`
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


function saveToLocal (appStorage:Storage, prop:string, value:string|Session|UserDataT):void {
	appStorage.setItem(prop,JSON.stringify(value))
	console.log(prop, appStorage.getItem(prop))
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


function setListenerOpacity (opacity:number):void {
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


const stashChat = (appStorage:Storage, chatPacket:ChatPacketT): void => {
	// const stashName: string = `${dateString}-${chatName.replace(/\s/g, "-")}`;
	// const messages = new Set(messageList);
	appStorage.setItem("chats", JSON.stringify(chatPacket));
	console.log(appStorage.getItem("chats"));
	notify('chat stashed! c:', 1000)
};


function updateListener (appStorage:Storage, currentListener:string):string {
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
	, newModal
	, notify
	, saveChat
	, saveToLocal
	, setListener
	, setListenerOpacity
	, stashChat
	, updateListener
	, updateTheme
}