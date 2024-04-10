import { browser } from "$app/environment";
import { constants } from "$lib/constants/constants";
import type { Session } from "@supabase/supabase-js"
import type { UserDataT } from "src/types/user";

class LocalStorageService {
	constructor() {
		if (browser) {
			this.storage = window.localStorage
			// this.enabled = this.storage.getItem(constants.keys.storageEnableKey) ? true : false;
			this.enabled = true;
		}
	}

	storage: Storage;

	enabled: boolean;

	clear(prop: string) {
		this.storage.removeItem(prop)
	}

	fetchFromLocal(prop: string) {
		try {
			return JSON.parse(this.storage.getItem(prop))
		} catch (error) {
			console.warn(error?.message)
			return null
		}
	}

	saveToLocal({prop, value }: { prop: string; value: string | Session | UserDataT; }): void {
		if (!this.enabled) {
			return
		}
		this.storage.setItem(prop, JSON.stringify(value))
		console.log(prop, this.storage.getItem(prop))
	}
}

const localStorageService = new LocalStorageService()

export {
	localStorageService
}