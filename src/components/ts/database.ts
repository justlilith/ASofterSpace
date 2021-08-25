import { createClient } from '@supabase/supabase-js'
// import { writable, get } from 'svelte/store'
// import * as Helpers from './helpers'
// import fetch from 'isomorphic-fetch'
// import type { Session, User } from '@supabase/gotrue-js'
import {v4 as uuidv4 } from 'uuid'

const sbUrl = 'https://tdoulxkicweqdvxnuqmm.supabase.co'
const sbKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODk0NTUxNCwiZXhwIjoxOTQ0NTIxNTE0fQ.b5JJopf2VUmRy69rF6_jp21phjEHi6NHeVnGsJ7yC_A'

const supabase = createClient(sbUrl, sbKey)
const user = supabase.auth.user()

// let user:User|Session|Error, session:User|Session|Error, error:User|Session|Error
// let user:User, session:Session, error:Error, isAuthed:boolean


async function addChatToDB (chatname?, messageList:MessageT[]):Promise<(Error|string)> {
	return new Promise((resolve, reject) => {
		const date = new Date
		const uuid = uuidv4()
		const uid = user.id
		console.log(uuid)
		supabase
		.from('chatfulltexts')
		.insert([
			{ chatfulltext: JSON.stringify(messageList)
			, chatid: uuid
			, uid: uid
			, chattimestamp: `${date.toUTCString()}`
			, chatname: chatname || null
		}
		])
		.then((data, error) => {
			if (error) {
				reject(error)
			} else {
				resolve(data)
			}
		})
	})
}



export { 
	addChatToDB
}