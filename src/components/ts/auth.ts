import { createClient } from '@supabase/supabase-js'
import { writable, get } from 'svelte/store'
import * as Helpers from './helpers'
// import fetch from 'isomorphic-fetch'
import type { Session, User } from '@supabase/gotrue-js'

const sbUrl = 'https://tdoulxkicweqdvxnuqmm.supabase.co'
const sbKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODk0NTUxNCwiZXhwIjoxOTQ0NTIxNTE0fQ.b5JJopf2VUmRy69rF6_jp21phjEHi6NHeVnGsJ7yC_A'

const supabase = createClient(sbUrl, sbKey)

// let user:User|Session|Error, session:User|Session|Error, error:User|Session|Error
let user:User, session:Session, error:Error, isAuthed:boolean

const authDataStore = writable({
	user, session, error
})

async function authCheck ():Promise<boolean> {
	
	// const options = {}
	// await fetch()
	let user:User, session:Session, error:Error
	
	const appStorage = window.localStorage
	
	const userData:UserData = Helpers.fetchFromLocal(appStorage,'userData')
	console.log('invoked authCheck ✨')
	
	if (userData == null || userData.error || userData.isAuthed == false) {
		isAuthed = false
		authDataStore.update(() => {
			return {user: null, session: null, error}
		})
		Helpers.saveToLocal(appStorage,'userData',userData)
		return false
	}
	if (userData.isAuthed) {
		({user, session, error} = await tryRefreshToken())
		if (error) {
			console.log('oh noooo', error);
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
			
			document.cookie = 'asofterspace_refresh_token=' + session.refresh_token + ';'
			
			Helpers.saveToLocal(appStorage,'userData',userData)
			authDataStore.update(() => {
				return {user, session, error}
			})
			return true
		}
	}
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
			console.log('parsed')
			console.log(refreshToken);
			({ user, session, error } = await supabase.auth.signIn({
				refreshToken: refreshToken
			}))
			return new Promise((resolve) => {
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
		const userData:UserData = {
			error: null,
			expiry: session.expires_at,
			isAuthed: true
		}
		
		console.log(session.refresh_token)
		// document.cookie.
		document.cookie = 'asofterspace_refresh_token=' + session.refresh_token + ';'
		
		Helpers.saveToLocal(appStorage,'userData',userData)
		authDataStore.update(() => {
			return { user, session, error }
		})
	}
	
	console.log(get(authDataStore))
	
	return [user, session, error]
}


async function signOut() {
	await supabase.auth.signOut()
}


async function signup (email:string, password:string, name?:string) {
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
			supabase.auth.setSession(session.refresh_token)
			let user
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
	, isAuthed
	, login
	, signOut
	, signup
	, authCheck
	, testHeaders
}