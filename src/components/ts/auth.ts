import { createClient } from '@supabase/supabase-js'
import * as Helpers from './helpers'

const sbUrl = 'https://tdoulxkicweqdvxnuqmm.supabase.co'
const sbKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODk0NTUxNCwiZXhwIjoxOTQ0NTIxNTE0fQ.b5JJopf2VUmRy69rF6_jp21phjEHi6NHeVnGsJ7yC_A'

const supabase =
createClient(sbUrl, sbKey)

// :Promise<(User | Session | Error)[]>
async function login (email:string, password:string) {
	const { user, session, error } = await supabase.auth.signIn({
		email: email,
		password: password,
	})

	if (session) {
		Helpers.saveToLocal(window.localStorage, 'session', session)
	}

	console.log(user, session, error)
	
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

export { login, signup }