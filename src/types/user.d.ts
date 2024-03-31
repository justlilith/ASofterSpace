import type { User } from "@supabase/supabase-js"

interface UserDataT {
	isAuthed: boolean,
	expiry: number,
	error: null|Error,
	user: User
}

interface UserPacketT {
	id: string,
	data: UserMetaDataT
}

interface UserMetaDataT {
	name: string
}