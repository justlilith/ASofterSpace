import {  createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { writable, type Writable } from 'svelte/store'
import * as Helpers from '$lib/components/ts/helpers'
// import fetch from 'isomorphic-fetch'
import type { Session, User } from '@supabase/gotrue-js'
import { constants } from '$lib/constants/constants'

interface AuthStore {
	user: User
	session: Session
	error: Error
}

class AuthService {
	sbKeyPublic = constants.keys.public.supabase.sbKeyPublic
	sbUrlPublic = constants.keys.public.supabase.sbUrlPublic

	supabaseClient: SupabaseClient;

	active: {
		user: User,
		isAuthed: boolean
		session: Session
		error: Error
	}
	refreshTokenFetcherActive: boolean

	authDataStore: Writable<AuthStore>

	constructor() {
		this.supabaseClient = createClient(this.sbUrlPublic, this.sbKeyPublic)
		this.active = {
			user: null,
			error: null,
			isAuthed: false,
			session: null
		}
		this.authDataStore = writable({
			user: this.active.user, session: this.active.session, error: this.active.error
		})
	}

	async authCheck(): Promise<boolean> {
		console.log('invoked authCheck ✨')
		// const options = {}
		// await fetch()
		let user: User, session: Session, error: Error

		const appStorage = window.localStorage

		let userData: UserDataT = Helpers.fetchFromLocal(appStorage, 'userData')

		if (userData == null || userData.error || userData.isAuthed == false) {
			this.active.isAuthed = false
			if (userData == null) {
				userData = {
					error: null,
					expiry: null,
					isAuthed: false
				}
			}
			this.authDataStore.update(() => {
				return { user: null, session: null, error }
			})
			Helpers.saveToLocal(appStorage, 'userData', userData)
			return false
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
				isAuthed: true
			}

			// console.log(session.refresh_token)
			// document.cookie.
			document.cookie = 'asofterspace_refresh_token=' + data.session.refresh_token + ';'

			Helpers.saveToLocal(appStorage, 'userData', userData)
			this.authDataStore.update(() => {
				return { user: data.user, session: data.session, error }
			})
		}

		// console.log(get(authDataStore))

		return [data.user, data.session, error]
	}

	async signOut(isAuthed: boolean): Promise<boolean> {
		isAuthed = false
		await this.supabaseClient.auth.signOut()
		window.location.href = '/'
		return isAuthed
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
					return { user: data.user, session: data.session, error }
				})
			}

			if (data.user) {
				this.supabaseClient.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
				let { data: data2, error } = await this.supabaseClient.auth.updateUser({
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