interface Listener {
	name: string
	hidden: boolean
}

interface Settings {
	listener: Listener
}

class SettingsService {
	constructor() {
		this.listeners['sun'].hidden = false;
	}
	
	listeners: Record<string, Listener> = {
		'sun': {
			name: 'sun',
			hidden: true
		},
		'cube': {
			name: 'cube',
			hidden: true
		}
	}

	settings: Settings = {
		listener: this.listeners['sun']
	}
}

const settingsService = new SettingsService()

export {
	settingsService
}