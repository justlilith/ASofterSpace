import { browser } from '$app/env'

if (browser) {
const appStorage = window.localStorage;
console.log(appStorage)
}

// const currentDate = new Date();
// const dateString = currentDate.toDateString().replace(/\s/g, "-");
// const chatName: string = "";

export const stashChat = (appStorage:Storage, chatName:string, messageList:Array<MessageT>): void => {
	// const stashName: string = `${dateString}-${chatName.replace(/\s/g, "-")}`;
	// const messages = new Set(messageList);
	appStorage.setItem("chats", JSON.stringify(messageList));
	console.log(appStorage.getItem("chats"));
};

export const saveChat = (filename:string, messageList:Array<MessageT>): void => {
	filename = filename ? filename : "Saved Chat"
	const chat = messageList
		.map((message) => `${message.timestamp} from ${message.sender}:
${message.content}
`)
		.join("\n");
	console.log(chat);
	const date = new Date()
	const filenameFinal = `${filename} (from ${date.toDateString()})`
	const file = new File([chat], filenameFinal, {
		type: 'text/plain'
	})
	const download = document.createElement('a')
	download.setAttribute('id',file.name)
	download.setAttribute('download',filenameFinal)
	const link = URL.createObjectURL(file)
	download.setAttribute('href',link)
	document.body.append(download)
	download.click()
	download.onload = () => {URL.revokeObjectURL(link)}
	document.body.removeChild(download)
};

export const clearStash = (appStorage: Storage): void => {
	// appStorage.clear();
	appStorage.setItem("chats",'')
};

export const clearChat = (messageList:MessageT[]):MessageT[] => {
	messageList = [];
	console.log("chat cleared");
	return messageList
};