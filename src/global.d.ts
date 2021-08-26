/// <reference types="@sveltejs/kit" />

declare module '@smui/common';
declare module '@smui/fab';
declare module '@smui/button';

interface ChatPacketT {
	timestamp: string,
	chatFullText: MessageT[],
	chatName: string,
	chatId: uuid
}

interface MessageT {
	content: string,
	sender: string,
	timestamp: string,
}

interface ToastT {
	message: string,
	duration: number,
	id: number,
	mood: string
}

interface UserData {
	isAuthed: boolean,
	expiry: number,
	error: null|Error
}