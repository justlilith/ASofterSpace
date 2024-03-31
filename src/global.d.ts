/// <reference types="@sveltejs/kit" />


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
	remaining: number
}