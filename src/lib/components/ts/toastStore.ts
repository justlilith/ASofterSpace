import { writable } from 'svelte/store'

const toastStore = writable([])

export { toastStore }