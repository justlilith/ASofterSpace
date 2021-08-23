import { createClient } from '@supabase/supabase-js'
import { writable, get } from 'svelte/store'
import * as Helpers from './helpers'
import fetch from 'isomorphic-fetch'

const sbUrl = 'https://tdoulxkicweqdvxnuqmm.supabase.co'
const sbKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODk0NTUxNCwiZXhwIjoxOTQ0NTIxNTE0fQ.b5JJopf2VUmRy69rF6_jp21phjEHi6NHeVnGsJ7yC_A'

const supabase =
createClient(sbUrl, sbKey)

const authData = writable()

// :Promise<(User | Session | Error)[]>
async function login (email:string, password:string) {
	const { user, session, error } = await supabase.auth.signIn({
		email: email,
		password: password,
	}, {
		redirectTo: 'https://asofter.space/'
		// redirectTo: 'localhost:3000'
	})
	
	console.log(user, session, error)
	
	if (session) {
		const data = 
			{ user: null
			, session: null
		}
		data.user = user
		data.session = session
		authData.update(() => {
			return data
		})
	}
	
	console.log(get(authData))
	
	return [user, session, error]
}

async function signup (email:string, password:string, name:string) {
	let user, session, error
	
	try {
		({ user, session, error } = await supabase.auth.signUp({
			email: email,
			password: password,
		}))
		
		if (user) {
			supabase.auth.setSession(session)
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


async function authCheck () {
	// const options = {}
	// await fetch()
	
}

export { login, signup, authCheck }