import { Player } from "../commands/src/game";
import { Players } from "../pokemon-tcg/players";
import { Battle, Battles } from "../pokemon-tcg/simulator/battle";
import { BattleDeck, Decks } from "../pokemon-tcg/simulator/decks";
import type { Room } from "../rooms";
import type { BaseCommandDefinitions } from "../types/command-parser";
import type { User } from "../users";
import { Pagination } from "./components/pagination";
import type { IPageElement } from "./components/pagination";
import { CLOSE_COMMAND, HtmlPageBase } from "./html-page-base";

const baseCommand = "battlepage";

const commandPageCommand = "commandspage";

const chooseDebugLogsTab = "choosedebuglogstab";

export const pageId = "battle-";
export const pages: Dict<BattlePage> = {};

export class BattlePage extends HtmlPageBase {
	pageId = pageId;

	battleid: string;
	battle?: Battle;

	p1: Player | User;
	p2: Player | User;
	turn: number;
	whoseTurn: "p1" | "p2";

	initiated: boolean;
	started: boolean;
	initBattleData: any;
	playerid: string;

	logs: Array<string>;

	currentTab: string;
	board?: any;
	decks: any;

	constructor(room: Room, user: User, battleid: string, challenge: any) {
		super(room, user, baseCommand, pages);

		this.commandPrefix = Config.commandCharacter + baseCommand;
		this.battleid = battleid;
		this.pageId = battleid;
		this.p1 = user;
		this.p2 = user;
		this.turn = 1;
		this.whoseTurn = "p1";

		this.initiated = false;
		this.started = false;

		this.playerid = challenge.from == this.userId ? "p1" : "p2";

		this.initBattleData = {
			p1: {
				id: challenge.from,
				name: Users.get(challenge.from)
					? Users.get(challenge.from).name
					: challenge.from,
				deck: Decks.get(challenge.fromdeck).deck,
			},
			p2: {
				id: challenge.to,
				name: Users.get(challenge.to)
					? Users.get(challenge.to).name
					: challenge.to,
				deck: challenge.todeck
					? Decks.get(challenge.todeck).deck
					: null,
			},
			format: challenge.format,
			battleId: battleid,
		};

		console.log(this.initBattleData);
		this.decks = {};

		this.decks.me = this.initBattleData.p1.deck ? new BattleDeck(this.initBattleData.p1.deck) : null;
		this.decks.opponent = this.initBattleData.p2.deck ? new BattleDeck(this.initBattleData.p2.deck) : null;

		let userid = this.userId;
		let playerid = this.playerid;

		this.currentTab = "debuglogstab";
		this.logs = [];
		this.setCloseButtonHtml();
	}

	// Simulator Events Handlers

	log(line: string) {
		console.log(`[BP-Log] ${line}`);
		this.logs.push(line.trim());
		this.send();
	}

	boardUpdate(data:any,self:boolean) {
		if(!self) {
			this.board.opponent.bench = data.bench
			this.board.opponent.active = data.active
			this.board.opponent.prizeCards = data.prizes
			this.board.opponent.deck = data.deck
			this.board.opponent.discardPile = data.discardPile ? data.discardPile : this.board.opponent.discardPile;
			this.board.opponent.hand = data.hand;
		}
		else {
			this.board.me.active = data.active
			this.board.me.bench = data.bench
			this.board.me.prizeCards = data.prizes
			this.board.me.deck = data.deck
			this.board.me.discardPile = data.discardPile ? data.discardPile : this.board.me.discardPile;
			this.board.me.hand = data.hand;
		}
		this.send();
	}

	boardInit(data: any) {
		let me = data[this.playerid];
		let opp = this.playerid == "p1" ? data.p2 : data.p1;

		this.board = {
			me : {
				id:me.id,
				playerid:me.playerid,
				active:me.active,
				hand:me.hand,
				bench:me.bench,
				prizeCards:me.prizes,
				deck:me.deck,
				discardPile:me.discardPile ? me.discardPile : 0
			},
			opponent : {
				id:opp.id,
				playerid:opp.playerid,
				active:opp.active,
				bench:opp.bench,
				prizeCards:opp.prizes,
				deck:opp.deck,
				discardPile:opp.discardPile ? opp.discardPile : 0
			}
		}

		this.send();

	}

	renderBoard() {
		let boardBackgroundImage = null;
		let turnNumber = this.turn;

		let boardStart = `<div 		style=" 		 background-color: #282a45; 		 color: white; 		 background: url(${ 			boardBackgroundImage 			 ? boardBackgroundImage 			 : "https://ultrapro.com/cdn/shop/files/16182_Mat_PKM_KoraidonMiraidon.png?v=1686693024" 		 }) 			center/cover; 		 font-family: Arial, sans-serif; 		 padding: 2px 0; 		 text-align: center; 		 padding: 20px 10px; 		 max-height: 52vh; 		 position: relative; 		" 	 > 		<div 		 id="turn-number" 		 style=" 			margin-left: auto; 			margin-right: 20px; 			padding: 4px 8px; 			background-color: #ffcb05; 			color: #3366af; 			font-weight: bold; 			width: auto; 			max-width: 100px; 			border: 0.5px solid #3366af; 			border-radius: 5px; 		 " 		> 		Turn ${turnNumber} 		</div>`;
	  
		let oppSideStart = `<div 		 style=" 			background: rgba(19, 23, 69, 0.6); 			box-shadow: inset -1px -1px 2px #fff, inset 1px 1px 2px #fff; 			border-radius: 8px; 			margin: 3px 10px; 			padding: 10px; 			max-height: 30vh; 			position: relative; 		 " 		>`;
	  
		let oppExceptActiveStart = `<div style="text-align: center; position: relative">`;
	  
		let oppPrize12CardsHtml = ``;
		let oppPrize34CardsHtml = ``;
		let oppPrize56CardsHtml = ``;


		for(let i = 0;i < 2;i++) {
			if(this.board.opponent.prizeCards[i]) return oppPrize12CardsHtml += `<button 			id="opponent-prize-1" 			style=" 			 background: none; 			 color: inherit; 			 border: none; 			 padding: 0; 			 font: inherit; 			 cursor: pointer; 			 outline: inherit; 			" 		 > 			<li 			 style=" 				background: black;				height: 4vw; 				width: 3vw; 				display: inline-block; 				margin: 0 1px; 				max-height: 30px; 				max-width: 22.5px; 			 " 			></li> 		 </button>`

		  oppPrize12CardsHtml +=  `<button 			id="opponent-prize-1" 			style=" 			 background: none; 			 color: inherit; 			 border: none; 			 padding: 0; 			 font: inherit; 			 cursor: pointer; 			 outline: inherit; 			" 		 > 			<li 			 style=" 				background: url(${"https://archives.bulbagarden.net/media/upload/1/17/Cardback.jpg"}) 				 center/contain no-repeat; 				height: 4vw; 				width: 3vw; 				display: inline-block; 				margin: 0 1px; 				max-height: 30px; 				max-width: 22.5px; 			 " 			></li> 		 </button>`
		}

		for(let i = 2;i < 4;i++) {
			if(this.board.opponent.prizeCards[i]) return oppPrize34CardsHtml += `<button 			id="opponent-prize-1" 			style=" 			 background: none; 			 color: inherit; 			 border: none; 			 padding: 0; 			 font: inherit; 			 cursor: pointer; 			 outline: inherit; 			" 		 > 			<li 			 style=" 				background: url(${"https://archives.bulbagarden.net/media/upload/1/17/Cardback.jpg"}) 				 center/contain no-repeat; 				height: 4vw; 				width: 3vw; 				display: inline-block; 				margin: 0 1px; 				max-height: 30px; 				max-width: 22.5px; 			 " 			></li> 		 </button>`

		  oppPrize34CardsHtml += `<button 			id="opponent-prize-1" 			style=" 			 background: none; 			 color: inherit; 			 border: none; 			 padding: 0; 			 font: inherit; 			 cursor: pointer; 			 outline: inherit; 			" 		 > 			<li 			 style=" 				background: black; 				height: 4vw; 				width: 3vw; 				display: inline-block; 				margin: 0 1px; 				max-height: 30px; 				max-width: 22.5px; 			 " 			></li> 		 </button>`
		}

		for(let i = 4;i < 6;i++) {
			if(this.board.opponent.prizeCards[i]) return oppPrize56CardsHtml += `<button 			id="opponent-prize-1" 			style=" 			 background: none; 			 color: inherit; 			 border: none; 			 padding: 0; 			 font: inherit; 			 cursor: pointer; 			 outline: inherit; 			" 		 > 			<li 			 style=" 				background: url(${"https://archives.bulbagarden.net/media/upload/1/17/Cardback.jpg"}) 				 center/contain no-repeat; 				height: 4vw; 				width: 3vw; 				display: inline-block; 				margin: 0 1px; 				max-height: 30px; 				max-width: 22.5px; 			 " 			></li> 		 </button>`


		  oppPrize56CardsHtml += `<button 			id="opponent-prize-1" 			style=" 			 background: none; 			 color: inherit; 			 border: none; 			 padding: 0; 			 font: inherit; 			 cursor: pointer; 			 outline: inherit; 			" 		 > 			<li 			 style=" 				background: black; 				height: 4vw; 				width: 3vw; 				display: inline-block; 				margin: 0 1px; 				max-height: 30px; 				max-width: 22.5px; 			 " 			></li> 		 </button>`

		}

		let oppPriceCards = `<div style="position: absolute; top: 100%; right: 0; z-index: 10"> 			 <ul 				style=" 				 padding: 0; 				 margin: 0 auto; 				 display: table; 				 text-align: center; 				 width: auto; 				" 			 > 	${oppPrize12CardsHtml} 			 </ul> 			 <ul 				style=" 				 padding: 0; 				 margin: 0 auto; 				 display: table; 				 text-align: center; 				 width: auto; 				" 			 > 				${oppPrize34CardsHtml} 			 </ul> 			 <ul 				style=" 				 padding: 0; 				 margin: 0 auto; 				 display: table; 				 text-align: center; 				 width: auto; 				" 			 > 				${oppPrize56CardsHtml} 			 </ul> 			</div>`;
	  
		let oppDiscardPile = ` <div style="position: absolute; bottom: -50%; left: 0"> 			 <button 				id="opponent-discard-pile" 				style=" 				 background: none; 				 color: inherit; 				 border: none; 				 padding: 0; 				 font: inherit; 				 cursor: pointer; 				 outline: inherit; 				" 			 > 				<div 				 style=" 					background: url(${"https://archives.bulbagarden.net/media/upload/1/17/Cardback.jpg"}) 					 center/contain no-repeat; 					height: 4vw; 					width: 3vw; 					display: inline-block; 					margin: 0 1px; 					max-height: 40px; 					max-width: 30px; 					min-height: 25px; 					min-width: 18.75px; 				 " 				> ${this.board.opponent.discardPile}</div> 			 </button> 			</div>`;
	  
		let oppDeck = `<div style="position: absolute; bottom: -130%; left: 0"> 			 <button 				id="opponent-deck" 				style=" 				 background: none; 				 color: inherit; 				 border: none; 				 padding: 0; 				 font: inherit; 				 cursor: pointer; 				 outline: inherit; 				" 			 > 				<div 				 style=" 					background: url(${"https://archives.bulbagarden.net/media/upload/1/17/Cardback.jpg"}) 					 center/contain no-repeat; 					height: 4vw; 					width: 3vw; 					display: inline-block; 					margin: 0 1px; 					max-height: 40px; 					max-width: 30px; 					min-height: 25px; 					min-width: 18.75px; 				 " 				> ${this.board.opponent.deck}</div> 			 </button> 			</div>`;
	  

			let oppBenchCardsHtml = ``;

			for(let i = 0;i < 5;i++) {
				let link = `https://xmple.com/wallpaper/solid-color-plain-black-single-one-colour-2160x3240-c-060a07-f-24.svg`;
				if(this.board.opponent.bench[i]) {
					link = `https://archives.bulbagarden.net/media/upload/1/17/Cardback.jpg`;
				}

				oppBenchCardsHtml += `	 <button 				id="opponent-bench-1" 				style=" 				 background: none; 				 color: inherit; 				 border: none; 				 padding: 0; 				 font: inherit; 				 cursor: pointer; 				 outline: inherit; 				" 			 > 				<li 				 style=" 					background: url(${link}) 					 center/contain no-repeat; 					height: 10vw; 					width: 7.5vw; 					display: inline-block; 					margin: 0 1px; 					max-height: 50px; 					max-width: 37.5px; 				 " 				></li> 			 </button>`;
			}

		let oppBenchCards = `<ul 			 style=" 				padding: 0; 				margin: 0 auto; 				display: table; 				text-align: center; 				width: auto; 			 " 			> 			 ${oppBenchCardsHtml} 			</ul>`;
	  
		let oppExceptActiveEnd = `</div>`;
	  
		let oppActiveCard = `<div style="margin: 0 auto"> 			<button 			 id="opponent-active-card" 			 style=" 				background: none; 				color: inherit; 				border: none; 				padding: 0; 				font: inherit; 				cursor: pointer; 				outline: inherit; 			 " 			> 			 <div 				style=" 				 background: url(${this.board.opponent.active ? this.decks.opponent.get(this.board.opponent.active.ID).images.small : "https://xmple.com/wallpaper/solid-color-plain-black-single-one-colour-2160x3240-c-060a07-f-24.svg"}) 					center/contain no-repeat; 				 height: 10vw; 				 width: 7.5vw; 				 margin: 0 auto; 				 margin-top: 3vh; 				 max-height: 70px; 				 max-width: 52.5px; 				" 			 ></div> 			</button> 		 </div> 		 `;
		
		let stadiumCard = `<div style="position: absolute; bottom: -25%; left: 30%"> 			<button 			 id="stadium-card" 			 style=" 				background: none; 				color: inherit; 				border: none; 				padding: 0; 				font: inherit; 				cursor: pointer; 				outline: inherit; 			 " 			> 			 <div 				style=" 				 background: url('https://images.pokemontcg.io/xy1/44.png') 					center/contain no-repeat; 				 height: 10vw; 				 width: 7.5vw; 				 margin: 0 auto; 				 margin-top: 3vh; 				 max-height: 70px; 				 max-width: 52.5px; 				" 			 ></div> 			</button> 		 </div>`;
	  
		let oppSideEnd = `</div>`;
	  
		let mySideStart = `<div 		 style=" 			background: rgba(19, 23, 69, 0.6); 			box-shadow: inset -1px -1px 2px #fff, inset 1px 1px 2px #fff; 			border-radius: 8px; 			margin: 3px 10px; 			padding: 10px; 		 " 		>`;
	
		let myActiveCard = `<div style="margin: 0 auto"> 			<button 			 id="active-card" 			 style=" 				background: none; 				color: inherit; 				border: none; 				padding: 0; 				font: inherit; 				cursor: pointer; 				outline: inherit; 			 " 			> 			 <div 				style=" 				 background: url('https://images.pokemontcg.io/xy1/44.png') 					center/contain no-repeat; 				 height: 10vw; 				 width: 7.5vw; 				 margin: 0 auto; 				 margin-bottom: 3vh; 				 max-height: 70px; 				 max-width: 52.5px; 				" 			 ></div> 			</button> 		 </div>`;
	  
		let myExceptActiveStart = `<div style="text-align: center; position: relative">`;
	  
		let myDeck = ` <div style="position: absolute; top: -130%; right: 0"> 			 <button 				id="deck" 				style=" 				 background: none; 				 color: inherit; 				 border: none; 				 padding: 0; 				 font: inherit; 				 cursor: pointer; 				 outline: inherit; 				" 			 > 				<div 				 style=" 					background: url('https://images.pokemontcg.io/xy1/44.png') 					 center/contain no-repeat; 					height: 4vw; 					width: 3vw; 					display: inline-block; 					margin: 0 1px; 					max-height: 40px; 					max-width: 30px; 					min-height: 25px; 					min-width: 18.75px; 				 " 				></div> 			 </button> 			</div>`;
	  
		let myDiscardPile = `<div style="position: absolute; top: -50%; right: 0"> 			 <button 				id="discard-pile" 				style=" 				 background: none; 				 color: inherit; 				 border: none; 				 padding: 0; 				 font: inherit; 				 cursor: pointer; 				 outline: inherit; 				" 			 > 				<div 				 style=" 					background: url('https://images.pokemontcg.io/xy1/44.png') 					 center/contain no-repeat; 					height: 4vw; 					width: 3vw; 					display: inline-block; 					margin: 0 1px; 					max-height: 40px; 					max-width: 30px; 					min-height: 25px; 					min-width: 18.75px; 				 " 				></div> 			 </button> 			</div>`;
	  
		let myBenchCards = `<ul 			 style=" 				padding: 0; 				margin: 0 auto; 				display: table; 				text-align: center; 				width: auto; 			 " 			> 			 <button 				id="bench-1" 				style=" 				 background: none; 				 color: inherit; 				 border: none; 				 padding: 0; 				 font: inherit; 				 cursor: pointer; 				 outline: inherit; 				" 			 > 				<li 				 style=" 					background: url('https://images.pokemontcg.io/xy1/44.png') 					 center/contain no-repeat; 					height: 10vw; 					width: 7.5vw; 					display: inline-block; 					margin: 0 1px; 					max-height: 50px; 					max-width: 37.5px; 				 " 				></li> 			 </button> 			 <button 				id="bench-2" 				style=" 				 background: none; 				 color: inherit; 				 border: none; 				 padding: 0; 				 font: inherit; 				 cursor: pointer; 				 outline: inherit; 				" 			 > 				<li 				 style=" 					background: url('https://images.pokemontcg.io/xy1/44.png') 					 center/contain no-repeat; 					height: 10vw; 					width: 7.5vw; 					display: inline-block; 					margin: 0 1px; 					max-height: 50px; 					max-width: 37.5px; 				 " 				></li> 			 </button> 			 <button 				id="bench-3" 				style=" 				 background: none; 				 color: inherit; 				 border: none; 				 padding: 0; 				 font: inherit; 				 cursor: pointer; 				 outline: inherit; 				" 			 > 				<li 				 style=" 					background: url('https://images.pokemontcg.io/xy1/44.png') 					 center/contain no-repeat; 					height: 10vw; 					width: 7.5vw; 					display: inline-block; 					margin: 0 1px; 					max-height: 50px; 					max-width: 37.5px; 				 " 				></li> 			 </button> 			 <button 				id="bench-4" 				style=" 				 background: none; 				 color: inherit; 				 border: none; 				 padding: 0; 				 font: inherit; 				 cursor: pointer; 				 outline: inherit; 				" 			 > 				<li 				 style=" 					background: url('https://images.pokemontcg.io/xy1/44.png') 					 center/contain no-repeat; 					height: 10vw; 					width: 7.5vw; 					display: inline-block; 					margin: 0 1px; 					max-height: 50px; 					max-width: 37.5px; 				 " 				></li> 			 </button> 			 <button 				id="bench-5" 				style=" 				 background: none; 				 color: inherit; 				 border: none; 				 padding: 0; 				 font: inherit; 				 cursor: pointer; 				 outline: inherit; 				" 			 > 				<li 				 style=" 					background: url('https://images.pokemontcg.io/xy1/44.png') 					 center/contain no-repeat; 					height: 10vw; 					width: 7.5vw; 					display: inline-block; 					margin: 0 1px; 					max-height: 50px; 					max-width: 37.5px; 				 " 				></li> 			 </button> 			</ul>`;
	  
		let myPrizeCards = `<div style="position: absolute; bottom: 100%; left: 0; z-index: 10"> 			 <ul 				style=" 				 padding: 0; 				 margin: 0 auto; 				 display: table; 				 text-align: center; 				 width: auto; 				" 			 > 				<button 				 id="prize-1" 				 style=" 					background: none; 					color: inherit; 					border: none; 					padding: 0; 					font: inherit; 					cursor: pointer; 					outline: inherit; 				 " 				> 				 <li 					style=" 					 background: url('https://images.pokemontcg.io/xy1/44.png') 						center/contain no-repeat; 					 height: 4vw; 					 width: 3vw; 					 display: inline-block; 					 margin: 0 1px; 					 max-height: 30px; 					 max-width: 22.5px; 					" 				 ></li> 				</button> 				<button 				 id="prize-2" 				 style=" 					background: none; 					color: inherit; 					border: none; 					padding: 0; 					font: inherit; 					cursor: pointer; 					outline: inherit; 				 " 				> 				 <li 					style=" 					 background: url('https://images.pokemontcg.io/xy1/44.png') 						center/contain no-repeat; 					 height: 4vw; 					 width: 3vw; 					 display: inline-block; 					 margin: 0 1px; 					 max-height: 30px; 					 max-width: 22.5px; 					" 				 ></li> 				</button> 			 </ul> 			 <ul 				style=" 				 padding: 0; 				 margin: 0 auto; 				 display: table; 				 text-align: center; 				 width: auto; 				" 			 > 				<button 				 id="prize-3" 				 style=" 					background: none; 					color: inherit; 					border: none; 					padding: 0; 					font: inherit; 					cursor: pointer; 					outline: inherit; 				 " 				> 				 <li 					style=" 					 background: url('https://images.pokemontcg.io/xy1/44.png') 						center/contain no-repeat; 					 height: 4vw; 					 width: 3vw; 					 display: inline-block; 					 margin: 0 1px; 					 max-height: 30px; 					 max-width: 22.5px; 					" 				 ></li> 				</button> 				<button 				 id="prize-4" 				 style=" 					background: none; 					color: inherit; 					border: none; 					padding: 0; 					font: inherit; 					cursor: pointer; 					outline: inherit; 				 " 				> 				 <li 					style=" 					 background: url('https://images.pokemontcg.io/xy1/44.png') 						center/contain no-repeat; 					 height: 4vw; 					 width: 3vw; 					 display: inline-block; 					 margin: 0 1px; 					 max-height: 30px; 					 max-width: 22.5px; 					" 				 ></li> 				</button> 			 </ul> 			 <ul 				style=" 				 padding: 0; 				 margin: 0 auto; 				 display: table; 				 text-align: center; 				 width: auto; 				" 			 > 				<button 				 id="prize-5" 				 style=" 					background: none; 					color: inherit; 					border: none; 					padding: 0; 					font: inherit; 					cursor: pointer; 					outline: inherit; 				 " 				> 				 <li 					style=" 					 background: url('https://images.pokemontcg.io/xy1/44.png') 						center/contain no-repeat; 					 height: 4vw; 					 width: 3vw; 					 display: inline-block; 					 margin: 0 1px; 					 max-height: 30px; 					 max-width: 22.5px; 					" 				 ></li> 				</button> 				<button 				 id="prize-6" 				 style=" 					background: none; 					color: inherit; 					border: none; 					padding: 0; 					font: inherit; 					cursor: pointer; 					outline: inherit; 				 " 				> 				 <li 					style=" 					 background: url('https://images.pokemontcg.io/xy1/44.png') 						center/contain no-repeat; 					 height: 4vw; 					 width: 3vw; 					 display: inline-block; 					 margin: 0 1px; 					 max-height: 30px; 					 max-width: 22.5px; 					" 				 ></li> 				</button> 			 </ul> 			</div>`;
	  
		let myExceptActiveEnd = `</div>`;
		let mySideEnd = `</div>`;
		let boardEnd = `</div>`;

		return (
			boardStart +
			oppSideStart +
			oppExceptActiveStart + 
			oppPriceCards +
			oppDiscardPile +
			oppDeck +
			oppBenchCards +
			oppExceptActiveEnd +
			oppActiveCard +

			stadiumCard +
			oppSideEnd +

			mySideStart +
			myActiveCard +
			myExceptActiveStart +
			myDeck +
			myDiscardPile + 
			myBenchCards +
			myPrizeCards +
			myExceptActiveEnd +
			mySideEnd +

			boardEnd
		)
	  
	}

	// Simulator Events Handlers END

	updateInitData(data: any) {
		this.initBattleData = data;
		this.initiated = true;
		this.send();
	}

	selectDeck(id: string) {
		let deck = Decks.get(id).deck;
		this.initBattleData[this.playerid].deck = deck;
		this.initiated = true;
		Battles.initiate(this.battleid, this.initBattleData);
		this.send();
	}

	// Tabs Switching

	chooseDebugLogsTab() {
		this.currentTab = "debuglogstab";
		this.send();
	}

	chooseActivePokemonTab() {
		this.currentTab = "activepokemontab";
		this.send();
	}

	render(): string {
		
		let html =
			`<div class='chat' style='margin-top: 4px;margin-left: 4px;background-image: linear-gradient(rgba(255 , 255 , 255 , 0) , rgba(90 , 120 , 160 , 1));height:100%;'><center><b> <i> Cardify's </i> </b> <br> <strong style='font-size:16px;'>` +
			`<span class="username">${this.initBattleData.p1.name} </span> vs <span class="username">${this.initBattleData.p2.name} </span> </strong> </center>`;

		html += `<div style="float:left;padding: 5px ; background: rgba(173, 103, 38, 0.6) ; box-shadow: inset -1px -1px 2px #fff , inset 1px 1px 2px #fff ; border-radius: 8px;  text-shadow: 0 -1px 0 #0f1924;max-width:80px;">`;
		html += `<strong> Unranked </strong>`;
		html += `</div>`;

		html += `<div style="float:right;padding: 5px ; background: rgba(173, 103, 38, 0.6) ; box-shadow: inset -1px -1px 2px #fff , inset 1px 1px 2px #fff ; border-radius: 8px;  text-shadow: 0 -1px 0 #0f1924;max-width:160px;">`;
		html += `<strong> Standard Battle </strong>`;
		html += `</div>`;

		html += `<hr/>`;

		if (!this.initiated) {
			if (!this.initBattleData[this.playerid].deck) {
				html += `<br><strong style='font-size:16px;'> Your Decks </strong> <br> <br>`;
				html += `<div style='margin-left:10px;'>`;
				let player = Players.get(this.userId);

				if (player && player?.decks) {
					player.decks.forEach((d) => {
						let deck = Decks.get(d);
						let title = deck.name;
						let subtitle = `Contains <i> ${deck.deck[0].name},${
							deck.deck[4].name
						}, ${
							deck.deck[deck.deck.length - 1].name
						} and more! </i>`;
						let onClick = `name="send" value="/msg cardify, /msgroom tcgtabletop, /botmsg cardify, ${Config.commandCharacter}battlepage, ${this.battleid}, selectdeck, ${d}"`;
						html += `<button ${onClick} style="background: #282a45; color: inherit; border: 1px solid white; padding: 0; font: inherit; cursor: pointer; border-radius: 10px; outline: inherit; width: 100%; overflow: hidden; position: relative; color: white; font-family: Arial, sans-serif; margin: 2px 0; " > <div style=" background: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3jLYNLuYwPs1suOGNkzsJpLZ-KgNeyLWF_g&usqp=CAU') center/cover no-repeat; filter: blur(1px); position: relative; text-align: center; height: 60px; transform: rotate(3deg); transform: scale(1.1); " > <div style=" position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(40, 42, 69, 0.6); " ></div> </div> <div style=" position: absolute; top: 0; left: 0; z-index: 10; text-align: left; padding: 15px; " > <p style="color: white; margin: 0; font-weight: 700; font-size: 16px"> ${title} </p> <p style=" color: #c9c9c9; margin: 0; background: none; font-weight: 500; font-size: 12px; " > ${subtitle} </p>  </div></button>`;
					});
				} else {
					html += `<strong> You dont have any decks, please create a deck. </strong>`;
				}
				html += `</div>`;
			} else {
				html += `<br><br><br> <h2> Opponent is choosing a battle deck, please wait... </h2>`;
			}
		} else {
			html += this.board ? this.renderBoard() : `<br><br> <strong> Preparing board... </strong> `;

			let debugTab = this.currentTab == "debuglogstab";
			let activePokemonTab = this.currentTab == "activepokemontab";
			let freeView = this.currentTab == "free";

			let chooseDLT = `name="send" value="/msg cardify, /msgroom tcgtabletop, /botmsg cardify, ${Config.commandCharacter}battlepage, ${this.battleid}, ${chooseDebugLogsTab}"`;
			let chooseAPT = `name="send" value="/msg cardify, /msgroom tcgtabletop, /botmsg cardify, "`;

			html +=
				"&nbsp;" +
				this.getQuietPmButton(
					`${Config.commandCharacter}battlepage, ${this.battleid}, ${chooseDebugLogsTab}`,
					"Debug Logs",
					{ selectedAndDisabled: debugTab }
				);

			html +=
				"&nbsp;" +
				this.getQuietPmButton(
					`${Config.commandCharacter}battlepage, ${this.battleid}, chooseactivepokemontab`,
					"Active Pokemon",
					{ selectedAndDisabled: activePokemonTab }
				);

			html += `<br><hr/>`;
			switch (this.currentTab) {
				case "debuglogstab":
					{
						html += `<br><div style="background:#36454F;border:2px solid white;color:white;padding:10px;><h4 style="color:green;"> Debug Logs: </h4> <br><br>`;
						this.logs.forEach((log) => {
							let color = "#20d420";
							if (log.includes("|all|")) color = "yellow";
							html += `<span style="color:${color}">${log}</span> <br>`;
						});
						html += `</div>`;
					}
					break;

				case "activepokemontab":
					{
						html += `<b> Active Pokemon </b>`;
					}
					break;
			}
		}

		html += "</div>";
		return html;
	}
}

export const commands: BaseCommandDefinitions = {
	[baseCommand]: {
		command(target, room, user) {
			if (!this.isPm(room)) return;
			const targets = target.split(",");
			const botRoom = user.getBotRoom();
			if (!botRoom)
				return this.say(CommandParser.getErrorText(["noBotRankRoom"]));

			console.log(targets);
			const battleid = Tools.toId(targets[0]);
			targets.shift();
			const cmd = Tools.toId(targets[0]);
			targets.shift();

			let bpage = Battles.pages[user.id][battleid];
			let p2 =
				bpage.initBattleData.p1.id == user.id
					? bpage.initBattleData.p2.id
					: bpage.initBattleData.p1.id;
			let bpage2 = Battles.pages[p2][battleid];

			switch (cmd) {
				case "selectdeck":
					{
						console.log(targets);
						let deckid = Tools.toId(targets[0]);
						bpage.selectDeck(deckid);
					}
					break;
				case "choosedebuglogstab":
					{
						bpage.chooseDebugLogsTab();
					}
					break;
				case "chooseactivepokemontab":
					{
						bpage.chooseActivePokemonTab();
					}
					break;
			}

			bpage2.send();
		},
		aliases: ["bpage"],
	},
};
