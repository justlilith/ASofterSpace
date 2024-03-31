import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { writable, type Writable } from 'svelte/store'
import * as Helpers from '$lib/components/ts/helpers'
// import fetch from 'isomorphic-fetch'
import type { Session, User } from '@supabase/gotrue-js'
import { constants } from '$lib/constants/constants'
import { localStorageService } from './localStorageService'
import type { UserDataT, UserPacketT } from 'src/types/user'
import { browser } from '$app/environment'

interface AuthStore {
	user: User
	session: Session
	error: Error,
	isAuthed: boolean
}

class AuthService {
	sbKeyPublic = constants.keys.public.supabase.sbKeyPublic
	sbUrlPublic = constants.keys.public.supabase.sbUrlPublic

	supabaseClient: SupabaseClient;

	active: {
		user: UserDataT,
		isAuthed: boolean
		session: Session
		error: Error
	}
	refreshTokenFetcherActive: boolean

	authDataStore: Writable<AuthStore>

	nullUser: UserDataT = {
		error: null,
		expiry: null,
		isAuthed: false,
		user: null
	}

	constructor() {
		this.supabaseClient = createClient(this.sbUrlPublic, this.sbKeyPublic)
		this.active = {
			user: null,
			error: null,
			isAuthed: false,
			session: null
		}
		this.authDataStore = writable({
			user: null, session: null, error: null, isAuthed: false
		})
		this.checkLocalAuth()
	}

	checkLocalAuth() {
		if (browser) {
			console.log('invoked checkLocalAuth ✨')
			// const options = {}
			// await fetch()
			let user: User, session: Session, error: Error

			const appStorage = localStorageService.storage

			let userData: UserDataT = localStorageService.fetchFromLocal(appStorage, 'userData')

			if (userData == null || userData.error || userData.isAuthed == false) {
				this.active.isAuthed = false
				if (userData == null) {
					userData = this.nullUser
				}
				this.authDataStore.update(() => {
					return { user: null, session: null, error, isAuthed: false }
				})
				localStorageService.saveToLocal({ appStorage, prop: 'userData', value: userData })
				return false
			}

			this.active.user = userData

			this.authDataStore.update(()=> {
				return {
					error: null,
					isAuthed: true,
					session: null,
					user: userData.user
				}
			})
		}
	}

	async login(email: string, password: string): Promise<(User | Session | Error)[]> {
		const appStorage = window.localStorage;

		let { data, error } = await this.supabaseClient.auth.signInWithPassword({
			email: email,
			password: password
		});

		// console.log(user, session, error)

		if (data.session) {
			const userData: UserDataT = {
				error: null,
				expiry: data.session.expires_at,
				isAuthed: true,
				user: data.user
			}

			// console.log(session.refresh_token)
			// document.cookie.
			document.cookie = 'asofterspace_refresh_token=' + data.session.refresh_token + ';'

			Helpers.saveToLocal(appStorage, 'userData', userData)
			this.authDataStore.update(() => {
				return { user: data.user, session: data.session, error, isAuthed: true }
			})
		}

		// console.log(get(authDataStore))

		return [data.user, data.session, error]
	}

	async signOut(): Promise<boolean> {
		this.active.isAuthed = false
		let { error } = await this.supabaseClient.auth.signOut()
		if (error) {
			console.error(error)
			Helpers.notify(error.message, 4000, 'bad')
		}
		this.authDataStore.update(()=> {
			return {
				user: null,
				error: null,
				isAuthed: false,
				session: null
			}
		})
		return this.active.isAuthed
	}

	async signUp(email: string, password: string, name?: string): Promise<Array<User | Session | Error>> {
		try {
			let { data, error } = await this.supabaseClient.auth.signUp({
				email: email,
				password: password,
			})

			if (error) {
				throw error
			}

			if (data.session) {
				this.authDataStore.update(() => {
					return { user: data.user, session: data.session, error, isAuthed: false }
				})
			}

			if (data.user) {
				this.supabaseClient.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
				let { error } = await this.supabaseClient.auth.updateUser({
					data: { name: name }
				})
				if (error) {
					throw error
				}
				await this.login(email, password)
			}

			return [data.user, data.session, error]
		} catch (error) {
			console.warn(error)
			return [null, null, error]
		}
	}

	async getUserData(): Promise<UserPacketT | null> {
		return new Promise(async (resolve, reject) => {
			const session = await this.supabaseClient.auth.getSession()
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
		})
	}

	async saveUserData(args: Record<string, User | any>): Promise<Error | void> {
		console.log(args.user)
		const { data, error } = await this.supabaseClient.auth.updateUser({
			data: {
				name: args.userData.name
			}
		})
		return new Promise((resolve, reject) => {
			if (error) {
				reject(error)
			}
			resolve()
		})
	}

}

const authService = new AuthService();

export {
	authService
}