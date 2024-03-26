class LocalStorageService {
	constructor() { }
	storage = window.localStorage
}

const localStorageService = new LocalStorageService()

export {
	localStorageService
}