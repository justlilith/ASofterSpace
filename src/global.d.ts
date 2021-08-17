/// <reference types="@sveltejs/kit" />

declare module '@smui/common';
declare module '@smui/fab';
declare module '@smui/button';

interface MessageT {
	content:string,
	sender:string,
	timestamp:string,
}

interface ToastT {
	message:string,
	duration:number,
	id:number
}