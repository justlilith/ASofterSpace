import { createClient } from '@supabase/supabase-js'
import { writable } from 'svelte/store'
import * as Helpers from './helpers'
// import fetch from 'isomorphic-fetch'
import type { Session, User } from '@supabase/gotrue-js'

const sbUrlPublic = 'https://tdoulxkicweqdvxnuqmm.supabase.co'
const sbKeyPublic = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODk0NTUxNCwiZXhwIjoxOTQ0NTIxNTE0fQ.b5JJopf2VUmRy69rF6_jp21phjEHi6NHeVnGsJ7yC_A'

const supabase = createClient(sbUrlPublic, sbKeyPublic)

// let user:User|Session|Error, session:User|Session|Error, error:User|Session|Error
let user: User, session: Session, error: Error, isAuthed: boolean, refreshTokenFetcherActive: boolean

const authDataStore = writable({
	user, session, error
})


async function authCheck(): Promise<boolean> {

	console.log('invoked authCheck ✨')
	// const options = {}
	// await fetch()
	let user: User, session: Session, error: Error

	const appStorage = window.localStorage

	let userData: UserDataT = Helpers.fetchFromLocal(appStorage, 'userData')

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
			return { user: null, session: null, error }
		})
		Helpers.saveToLocal(appStorage, 'userData', userData)
		return false
	}
}


function awaitRefreshToken(): void {
	if (!refreshTokenFetcherActive) {
		setInterval(() => {
			getRefreshToken()
		}, 1000 * 60 * 3)
	}
}


async function getRefreshToken(): Promise<void> {
	if (refreshTokenFetcherActive) {
		return
	}
	console.log('%cchecking refresh token . . .', 'color:hsl(120,100%,50%); font-weight:bold;')
	refreshTokenFetcherActive = true
	const date = new Date()
	const timeRemaining = date.getTime() - (session.expires_at * 1000)
	if (timeRemaining < (1000 * 60 * 4)) {
		console.log('%cfetching refresh token~', 'color:hsl(120,100%,50%); font-weight:bold;')
		const fetched: boolean = await authCheck()
		console.log(fetched)
		refreshTokenFetcherActive = false
	}
}


async function getUserData(): Promise<UserPacketT | null> {
	// const session = supabase.auth.session()
	// const {user, data, error} = await supabase.auth.api.getUser(session.user.)
	return new Promise(async (resolve, reject) => {
		// resolve()
		const session = await supabase.auth.getSession()
		if (session == null) {
			reject(null)
		}
		// console.log(session.user.id)
		resolve(
			{
				id: session.data.session.user.id,
				data: {
					name: session.data.session.user.user_metadata.name
				}
			})
		// supabase
		// .from('userdata')
		// .select('username')
		// .match({uid:session.user.id})
		// .then((res)=> {
		// 	if (!res.error) {
		// 		console.log(res)
		// 		const userData = {
		// 			id: session.user.id,
		// 			name: res.data[0].username
		// 		}
		// 		resolve(userData)
		// 	} else {
		// 		reject(null)
		// 	}
		// })
	})
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
async function login(email: string, password: string): Promise<(User | Session | Error)[]> {
	const appStorage = window.localStorage;

	let { data, error } = await supabase.auth.signInWithPassword({
		email: email,
		password: password
	});

	// console.log(user, session, error)

	if (data.session) {
		const userData: UserDataT = {
			error: null,
			expiry: data.session.expires_at,
			isAuthed: true
		}

		// console.log(session.refresh_token)
		// document.cookie.
		document.cookie = 'asofterspace_refresh_token=' + session.refresh_token + ';'

		Helpers.saveToLocal(appStorage, 'userData', userData)
		authDataStore.update(() => {
			return { user, session, error }
		})
	}

	// console.log(get(authDataStore))

	return [user, session, error]
}


async function saveUserData(args: Record<string, User | any>): Promise<Error | void> {
	console.log(args.user)
	const { data, error } = await supabase.auth.updateUser({
		data: {
			name: args.userData.name
		}
	})
	return new Promise((resolve, reject) => {
		if (error) {
			reject(error)
		}
		resolve()
		// supabase
		// .from('userdata')
		// .upsert({
		// 	username:userData.name,
		// 	uid:userData.id
		// })
		// .match({uid:userData.id})
		// .then(res => {
		// 	if (res.error) {
		// 		console.warn(res.error)
		// 		reject(null)
		// 	} else {
		// 		resolve('OK')
		// 	}
		// })
	})
}


async function signOut(isAuthed: boolean): Promise<boolean> {
	isAuthed = false
	await supabase.auth.signOut()
	window.location.href = '/'
	return isAuthed
}


async function signup(email: string, password: string, name?: string): Promise<Array<User | Session | Error>> {
	try {
		let { data, error } = await supabase.auth.signUp({
			email: email,
			password: password,
		})

		if (error) {
			throw error
		}

		if (session) {
			authDataStore.update(() => {
				return { user, session, error }
			})
		}

		if (user) {
			supabase.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
			let { data: data2, error } = await supabase.auth.updateUser({
				data: { name: name }
			})
			if (error) {
				throw error
			}
			await login(email, password)
		}

		return [user, session, error]
	} catch (error) {
		console.warn(error)
		return [null, null, error]
	}
}

export {
	authDataStore
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
}