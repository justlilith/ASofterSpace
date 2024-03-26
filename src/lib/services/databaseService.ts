import { constants } from '$lib/constants/constants'
import { createClient } from '@supabase/supabase-js'
// import { dataset_dev } from 'svelte/internal'
// import { writable, get } from 'svelte/store'
// import * as Helpers from './helpers'
// import fetch from 'isomorphic-fetch'
// import type { Session, User } from '@supabase/gotrue-js'
// import {v4 as uuidv4 } from 'uuid'
import type PostgrestResponse from '@supabase/supabase-js'



const supabase = createClient(constants.keys.public.supabase.sbUrlPublic, constants.keys.public.supabase.sbKeyPublic)
const user = supabase.auth.getUser()

// let user:User|Session|Error, session:User|Session|Error, error:User|Session|Error
// let user:User, session:Session, error:Error, isAuthed:boolean


async function addChatToDB (chatPacket:ChatPacketT):Promise<(Error|PostgrestResponse.PostgrestResponse<string>)> {
	return new Promise(async (resolve, reject) => {
		const date = new Date
		const uid = (await user).data.user.id ?? null
		
		chatPacket.chatName = chatPacket.chatName ? chatPacket.chatName : "Saved Chat"
		const chatNameFinal = `${chatPacket.chatName} (from ${date.toDateString()})`
		
		supabase
		.from('chatfulltexts')
		.upsert([
			{ chatfulltext: JSON.stringify(chatPacket.chatFullText)
				, chatid: chatPacket.chatId
				, uid: uid
				, chattimestamp: `${date.toUTCString()}`
				, chatname: chatNameFinal || chatPacket.chatName
			}
		])
		.then((res) => {
			if (res.error) {
				reject(res.error)
			} else {
				resolve(res)
			}
		})
	})
}


async function deleteChatFromDB(chat:ChatPacketT): Promise<PostgrestResponse.PostgrestResponse<string>>{
	console.log(chat.chatId)
	return new Promise((resolve, reject) => {
		supabase
		.from('chatfulltexts')
		// .select('*')
		.delete()
		.match({chatid:chat.chatId})
		.then((res) => {
			if (res.error) {
				console.warn(res.error)
				reject(res)
			} else {
				resolve(res)
			}
		})
	})
}

async function fetchChatsFromDB ():Promise<ChatPacketT[]> {
	
	const { data, error } = await supabase
	.from('chatfulltexts')
	.select('chatid, chatname, chattimestamp, chatfulltext')
	
	return new Promise((resolve, reject) => {
		if (error) {
			reject(error)
		}
		
		const results = data.map(chunk => {
			const chatPacket:ChatPacketT = {
				chatId: 0,
				chatName: '',
				chatFullText: [],
				timestamp: ''
			}
			chatPacket.chatId = chunk.chatid
			chatPacket.chatName = chunk.chatname
			chatPacket.chatFullText = JSON.parse(chunk.chatfulltext)
			chatPacket.timestamp = chunk.chattimestamp
			return chatPacket
		})
		
		resolve(results)
	})
}


export { 
	addChatToDB
	, deleteChatFromDB
	, fetchChatsFromDB
}