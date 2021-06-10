<script lang="ts">
	import InputComponent from './components/InputComponent.svelte'
	import MessageComponent from './components/MessageComponent.svelte'
	import { fade } from 'svelte/transition'
	
	export let messageList:Array<Message> = []
	export let timer:number = 8
		
	// export let name: string;

	const removeMessage = (list:Array<Message>):Array<Message> => {
		console.log(list)
		switch (list.length > 0) {
			case true:
				return list.slice(0,-1)
			case false:
			default:
				return list
		}
	}

	const animateList = (node) => {
		document.getElementById(node).scroll({
			top:9001,
			behavior:'smooth'
		})
		console.log('scrolled')
	}

	const responses:string[] =
		[ `I'm just here to listen. :)`
		, `Your feelings are valid. Keep talking. It's okay.`
		, 'Keep going. :)'
		, '*nods* Okay...'
		]

	let voidFlag = 0

	const voidResponse = (timer:number, listofResponses:string[], messageList:Array<Message>,voidFlag,innerVoidFlag,) => {
		if (voidFlag !== innerVoidFlag) {
					return
				}
		switch (timer){
			case (8):
				break
			case (0):
				let multiplier = Math.random()
				let index:number = 5 * multiplier
				index = Math.floor(index)
				console.log(listofResponses[index])
				messageList = [...messageList,
					{
						content:listofResponses[index],
						sender:'user'
					}
				]
				console.log(messageList)
				console.log(timer)
				voidFlag = 0
				timer = 8
				break
			default:
				voidFlag = 1
				setTimeout(()=> {
					console.log('void called')
					timer = timer - 1
					voidResponse(timer, listofResponses, messageList,voidFlag,1)
				},500)
		}
		return messageList
	}

	const invokeVoid = (event) => {
		console.log(event)
		messageList = voidResponse(timer, responses, messageList,voidFlag,voidFlag)
	}

	// setInterval(function() {
	// 	messageList = removeMessage(messageList)
	// }.bind(messageList),
	// 	3000)
	</script>
	
	<main>
		<div id='messages'>
			{#if messageList.length !== 0}
			{#each messageList as message}
			<!-- <span transition:fly> -->
			<span transition:fade on:introstart='{() => {
				animateList('messages')
			}}'>
				<MessageComponent message={message}></MessageComponent>
			</span>
			{/each}
			{:else}
			<p transition:fade on:introend='{() => {animateList('messages')}}'>Talk to me.</p>
			{/if}
		</div>
		<InputComponent on:voidInvoked='{invokeVoid}' bind:messageList bind:timer></InputComponent>
		
	</main>
	
	<style>
		main {
			position:relative;
			text-align: center;
			padding: 1em;
			/* min-width: 400px; */
			max-width: 85%;
			/* width:100px; */
			height:100%;
			margin: 0 auto;
		}
		
		#messages {
			display:flex;
			align-items:flex-end;
			flex-direction: column;
			/* justify-content: flex-end; */
			height: 75vh;
			overflow:overlay;
			-webkit-mask-image: linear-gradient(to top, black 0%, transparent 80%);
			mask-image: linear-gradient(to top, black 0%, transparent 80%);
			scrollbar-width: none;
			/* border: thin solid white; */
		}

		#messages::-webkit-scrollbar {
			display:none;
		}

		#messages > :first-child {
			margin-top:900px;
			/* justify-self: flex-end; */
		}

		#messages > p {
			color:white;
		}
		
		/* h1 {
			color: #fff;
			text-transform: lowercase;
			font-size: 3em;
			font-weight: 600;
		} */
			
		@media (min-width: 500px) {
			main {
				max-width: 60%;
			}
		}
			
		@media (min-width: 1000px) {
			main {
				max-width: 30%;
			}
		}
	</style>