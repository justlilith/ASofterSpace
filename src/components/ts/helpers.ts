const appStorage = window.localStorage;

const currentDate = new Date();
let dateString = currentDate.toDateString().replace(/\s/g, "-");
let chatName: string = "";


export const stashChat = (chatName: string, messageList:Array<MessageT>): void => {
	let stashName: string = `${dateString}-${chatName.replace(/\s/g, "-")}`;
	let messages = new Set(messageList);
	appStorage.setItem("chats", JSON.stringify(messageList));
	console.log(appStorage.getItem("chats"));
};

export const saveChat = (filename:string, messageList:Array<MessageT>): void => {
	filename = filename ? filename : "Saved Chat"
	let chat = messageList
		.map((message) => `${message.timestamp} from ${message.sender}:
${message.content}
`)
		.join("\n");
	console.log(chat);
	let date = new Date()
	let filenameFinal = `${filename} (from ${date.toDateString()})`
	let file = new File([chat], filenameFinal, {
		type: 'text/plain'
	})
	let download = document.createElement('a')
	download.setAttribute('id',file.name)
	download.setAttribute('download',filenameFinal)
	let link = URL.createObjectURL(file)
	download.setAttribute('href',link)
	document.body.append(download)
	download.click()
	download.onload = () => {URL.revokeObjectURL(link)}
	document.body.removeChild(download)
};

export const clearStash = (): void => {
	// appStorage.clear();
	appStorage.setItem("chats",'')
};

export const clearChat = (messageList:Array<MessageT>):MessageT[] => {
	messageList = [];
	console.log("chat cleared");
	return []
};