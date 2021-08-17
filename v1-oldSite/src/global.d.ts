/// <reference types="svelte" />
declare module '@smui/common';
declare module '@smui/fab';
declare module '@smui/button';

interface MessageT {
	content:string,
	sender:string,
	timestamp:string,
}

enum ListenerE {
	'sun' = string,
 cube = 'cube'
}