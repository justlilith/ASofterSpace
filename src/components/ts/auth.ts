import { createClient } from '@supabase/supabase-js'
import { writable } from 'svelte/store'
import * as Helpers from './helpers'
// import fetch from 'isomorphic-fetch'
import type { Session, User } from '@supabase/gotrue-js'
import { dataset_dev } from 'svelte/internal'

const sbUrl = 'https://tdoulxkicweqdvxnuqmm.supabase.co'
const sbKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODk0NTUxNCwiZXhwIjoxOTQ0NTIxNTE0fQ.b5JJopf2VUmRy69rF6_jp21phjEHi6NHeVnGsJ7yC_A'

const supabase = createClient(sbUrl, sbKey)

// let user:User|Session|Error, session:User|Session|Error, error:User|Session|Error
let user:User, session:Session, error:Error, isAuthed:boolean, refreshTokenFetcherActive:boolean

const authDataStore = writable({
	user, session, error
})


async function authCheck ():Promise<boolean> {
	
	console.log('invoked authCheck ✨')
	// const options = {}
	// await fetch()
	let user:User, session:Session, error:Error
	
	const appStorage = window.localStorage
	
	let userData:UserDataT = Helpers.fetchFromLocal(appStorage,'userData')
	
	if (userData == null || userData.error || userData.isAuthed == false) {
		isAuthed = false
		if (userData == null) {
			userData = {
				error: null,
				expiry: null,
				isAuthed: false
			}
		}
		authDataStore.update(() => {
			return {user: null, session: null, error}
		})
		Helpers.saveToLocal(appStorage,'userData',userData)
		return false
	}
	if (userData.isAuthed) {
		({user, session, error} = await tryRefreshToken())
		if (error) {
			console.warn('%coh noooo', 'color:red;', error);
			isAuthed = false
			userData.error = error
			userData.expiry = null
			userData.isAuthed = false
			Helpers.saveToLocal(appStorage,'userData',userData)
			authDataStore.update(() => {
				return {user: null, session: null, error}
			})
			return false
		}
		if (session) {
			isAuthed = true
			userData.error = null
			userData.expiry = session.expires_at
			userData.isAuthed = true
			// console.log(session.refresh_token)
			document.cookie = 'asofterspace_refresh_token=' + session.refresh_token + ';'
			
			Helpers.saveToLocal(appStorage,'userData',userData)
			authDataStore.update(() => {
				return {user, session, error}
			})
			return true
		}
	}
}


function awaitRefreshToken():void {
	if (!refreshTokenFetcherActive) {
		setInterval(() => {
			getRefreshToken()
		},1000 * 60 * 3)
	}
}


async function getRefreshToken():Promise<void> {
	if (refreshTokenFetcherActive) {
		return
	}
	console.log('%cchecking refresh token . . .', 'color:hsl(120,100%,50%); font-weight:bold;')
	refreshTokenFetcherActive = true
	const date = new Date()
	const timeRemaining = date.getTime() - (session.expires_at * 1000)
	if (timeRemaining < (1000 * 60 * 4)) {
		console.log('%cfetching refresh token~', 'color:hsl(120,100%,50%); font-weight:bold;')
		const fetched:boolean = await authCheck()
		console.log(fetched)
		refreshTokenFetcherActive = false
	}
}


async function getUserData ():Promise<UserPacketT|null> {
	return new Promise((resolve, reject) => {
		const session = supabase.auth.session()
		console.log(session.user.id)
		supabase
		.from('userdata')
		.select('username')
		.match({uid:session.user.id})
		.then((res)=> {
			if (!res.error) {
				console.log(res)
				const userData = {
					id: session.user.id,
					name: res.data[0].username
				}
				resolve(userData)
			} else {
				reject(null)
			}
		})
	})
}



async function tryRefreshToken ():Promise<{
	session: Session | null
	user: User | null
	error: Error | null
}> {
	try {
		const refreshToken = document.cookie
		.split(';')
		.find(chunk => chunk.includes('asofterspace_refresh_token='))
		.split('=')[1];
		
		if (refreshToken) {
			console.log('%cparsed', 'color:hsl(120,100%,50%); font-weight:bold;')
			console.log(refreshToken);
			({ user, session, error } = await supabase.auth.signIn({
				refreshToken: refreshToken
			}))
			return new Promise((resolve, reject) => {
				if (error) {
					reject( {user:null, session:null, error})
				}
				// console.log(session)
				resolve( { user, session, error } )
			})
		} else {
			throw new Error('Couldn\'t find token :/')
		}
	} catch (error) {
		return new Promise((resolve) => {
			resolve ({ user:null, session: null, error })
		})
	}
}


// function getNewRefreshToken () {

// }
// {user, session, error}

// if (session) {
// 	authDataStore.update(() => {
// 		return {user, session, error}
// 	})
// }


// :Promise<(User | Session | Error)[]>
async function login (email:string, password:string):Promise<(User|Session|Error)[]> {
	const appStorage = window.localStorage;
	
	({ user, session, error } = await supabase.auth.signIn({
		email: email,
		password: password,
	}, {
		redirectTo: 'https://asofter.space/'
		// redirectTo: 'localhost:3000'
	}))
	
	// console.log(user, session, error)
	
	if (session) {
		const userData:UserDataT = {
			error: null,
			expiry: session.expires_at,
			isAuthed: true
		}
		
		// console.log(session.refresh_token)
		// document.cookie.
		document.cookie = 'asofterspace_refresh_token=' + session.refresh_token + ';'
		
		Helpers.saveToLocal(appStorage,'userData',userData)
		authDataStore.update(() => {
			return { user, session, error }
		})
	}
	
	// console.log(get(authDataStore))
	
	return [user, session, error]
}


async function saveUserData (userData) {
	console.log(userData)
	return new Promise((resolve, reject) => {
		supabase
		.from('userdata')
		.upsert({
			username:userData.name,
			uid:userData.id
		})
		.match({uid:userData.id})
		.then(res => {
			if (res.error) {
				console.warn(res.error)
				reject(null)
			} else {
				resolve('OK')
			}
		})
	})
}


async function signOut(isAuthed:boolean):Promise<boolean> {
	isAuthed = false
	await supabase.auth.signOut()
	window.location.href = '/'
	return isAuthed
}


async function signup (email:string, password:string, name?:string):Promise<Array<User|Session|Error>> {
	try {
		({ user, session, error } = await supabase.auth.signUp({
			email: email,
			password: password,
		}))
		
		if (session) {
			authDataStore.update(() => {
				return {user, session, error}
			})
		}
		
		if (user) {
			supabase.auth.setSession(session.refresh_token);
			({ user, error } = await supabase.auth.update({ 
				data: { name: name } 
			}))
		}
		
		return [user, session, error]
	} catch (error) {
		console.warn(error)
		return [null, null, error]
	}
}


async function testHeaders ():Promise<void> {
	// const headers = {
	// }
	// fetch(headers,sbUrl)
	const currentSession = supabase.auth.session()
	const currentUser = supabase.auth.user()
	console.log(currentSession, currentUser)
	
	const { user, session, error } = await supabase.auth.signIn({
		refreshToken: currentSession.refresh_token
	})
	console.log(`%c${JSON.stringify(user)}
	%c${JSON.stringify(session)}
	%c${error}`, 'color:red;', 'color:yellow;', 'color:cyan;')
}

export { authDataStore
	, awaitRefreshToken
	, isAuthed
	, getRefreshToken
	, getUserData
	, login
	, refreshTokenFetcherActive
	, saveUserData
	, signOut
	, signup
	, authCheck
	, testHeaders
}