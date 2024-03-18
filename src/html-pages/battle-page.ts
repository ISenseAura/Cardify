import { Player } from "../commands/src/game";
import { Players } from "../pokemon-tcg/players";
import { Battle, Battles } from "../pokemon-tcg/simulator/battle";
import { Decks } from "../pokemon-tcg/simulator/decks";
import type { Room } from "../rooms";
import type { BaseCommandDefinitions } from "../types/command-parser";
import type { User } from "../users";
import { Pagination } from "./components/pagination";
import type { IPageElement } from "./components/pagination";
import { CLOSE_COMMAND, HtmlPageBase } from "./html-page-base";

const baseCommand = "battlepage";

const commandPageCommand = "commandspage";

export const pageId = "battle-";
export const pages: Dict<BattlePage> = {};

export class BattlePage extends HtmlPageBase {
	pageId = pageId;

	battleid: string;
	battle?:Battle

	p1:Player | User;
	p2:Player | User;
	turn: number;
	whoseTurn: "p1" | "p2";

	initiated:boolean
	started:boolean
	initBattleData: any;
	playerid: string;

	constructor(room: Room, user: User, battleid: string,challenge:any) {
		super(room, user, baseCommand, pages);

		this.commandPrefix = Config.commandCharacter + baseCommand;
		this.battleid = battleid;
        this.pageId = battleid;
		this.p1 = user;
		this.p2 = user;
		this.turn = 1;
		this.whoseTurn = "p1"

		this.initiated = false
		this.started = false

		this.playerid = challenge.from == this.userId ? "p1" : "p2";

		this.initBattleData = {
			p1: {
				id: challenge.from,
				name: Users.get(challenge.from) ? Users.get(challenge.from).name : challenge.from,
				deck: Decks.get(challenge.fromdeck)
			},
			p2: {
				id: challenge.to,
				name: Users.get(challenge.to) ? Users.get(challenge.to).name : challenge.to,
				deck: challenge.todeck ? Decks.get(challenge.todeck) : null
			},
			format: challenge.format,
			battleId:battleid
		}
		this.setCloseButtonHtml();
	}

	selectDeck(id: string) {
		let deck = Decks.get(id);
		this.initBattleData[this.playerid].deck = deck;
		this.initiated = true;
		this.send();
	}

	render(): string {

		let board = `<div style=" background-color: #282a45; color: white; background: url(https://ultrapro.com/cdn/shop/files/16182_Mat_PKM_KoraidonMiraidon.png?v=1686693024) center/cover; font-family: Arial, sans-serif; padding: 2px 0; text-align: center; padding: 20px 10px; "> <div style="background: rgba(19, 23, 69, 0.6); box-shadow: inset -1px -1px 2px #fff, inset 1px 1px 2px #fff; border-radius: 8px; margin: 3px 10px; padding: 10px;"> <div style="text-align: center; position: relative"> <div style="position: absolute; top: 100%; right: 0; z-index: 10"> <ul style="padding: 0; margin: 0 auto; display: table; text-align: center; width: auto;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 4vw; width: 3vw; display: inline-block; margin: 0 1px; max-height: 35px; max-width: 26.25px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 4vw; width: 3vw; display: inline-block; margin: 0 1px; max-height: 35px;max-width: 26.25px;"> </li> </button> </ul> <ul style="padding: 0; margin: 0 auto; display: table; text-align: center; width: auto;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 4vw; width: 3vw; display: inline-block; margin: 0 1px; max-height: 35px; max-width: 26.25px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 4vw; width: 3vw; display: inline-block; margin: 0 1px; max-height: 35px; max-width: 26.25px;"> </li> </button> </ul> <ul style="padding: 0; margin: 0 auto; display: table; text-align: center; width: auto;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit; "> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 4vw; width: 3vw; display: inline-block; margin: 0 1px;max-height: 35px; max-width: 26.25px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 4vw; width: 3vw; display: inline-block; margin: 0 1px;max-height: 35px; max-width: 26.25px;"> </li> </button> </ul> </div> <div style="position: absolute; bottom: -5vw; left: 0;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <div style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 5vw; width: 3.75vw; display: inline-block; margin: 0 1px; max-height: 50px; max-width: 37.5px;"> </div> </button> </div> <div style="position: absolute; bottom: -11vw; left: 0;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <div style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 5vw; width: 3.75vw; display: inline-block; margin: 0 1px; max-height: 50px; max-width: 37.5px;"> </div> </button> </div> <ul style="padding: 0; margin: 0 auto; display: table; text-align: center; width: auto;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; display: inline-block; margin: 0 1px; max-height: 70px; max-width: 52.2px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; display: inline-block; margin: 0 1px; max-height: 70px; max-width: 52.2px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; display: inline-block; margin: 0 1px; max-height: 70px; max-width: 52.2px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; display: inline-block; margin: 0 1px; max-height: 70px; max-width: 52.2px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; display: inline-block; margin: 0 1px; max-height: 70px; max-width: 52.2px;"> </li> </button> </ul> </div> <div style="margin: 0 auto;"> <span style="display: inline-block; position: relative;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <div style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; margin: 0 auto; margin-top: 50%; max-width: 70px; max-width: 52.5px;"> </div> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <div style="transform: rotate(-90deg); background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; position: absolute; right: -150%; bottom: 0; max-width: 70px; max-width: 52.5px;"> </div> </button> </span> </div> </div> <div style="background: rgba(19, 23, 69, 0.6); box-shadow: inset -1px -1px 2px #fff, inset 1px 1px 2px #fff; border-radius: 8px; margin: 3px 10px; padding: 10px;"> <div style="margin: 0 auto;"> <span style="display: inline-block; position: relative;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <div style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; margin: 0 auto; margin-bottom: 50%; max-width: 70px; max-width: 52.5px;"> </div> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <div style="transform: rotate(-90deg); background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; position: absolute; left: -150%; top: 0; max-width: 70px; max-width: 52.5px;"> </div> </button> </span> </div> <div style="text-align: center; position: relative"> <div style="position: absolute; top: -11vw; right: 0;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <div style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 5vw; width: 3.75vw; display: inline-block; margin: 0 1px; max-width: 50px; max-width: 37.5px;"> </div> </button> </div> <div style="position: absolute; top: -5vw; right: 0;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <div style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 5vw; width: 3.75vw; display: inline-block; margin: 0 1px; max-width: 50px; max-width: 37.5px;"> </div> </button> </div> <ul style="padding: 0; margin: 0 auto; display: table; text-align: center; width: auto;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; display: inline-block; margin: 0 1px; max-height: 70px; max-width: 52.2px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; display: inline-block; margin: 0 1px; max-height: 70px; max-width: 52.2px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; display: inline-block; margin: 0 1px; max-height: 70px; max-width: 52.2px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; display: inline-block; margin: 0 1px; max-height: 70px; max-width: 52.2px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 10vw; width: 7.5vw; display: inline-block; margin: 0 1px; max-height: 70px; max-width: 52.2px;"> </li> </button> </ul> <div style="position: absolute; bottom: 100%; left: 0; z-index: 10"> <ul style="padding: 0; margin: 0 auto; display: table; text-align: center; width: auto;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 4vw; width: 3vw; display: inline-block; margin: 0 1px; max-height: 35px; max-width: 26.25px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 4vw; width: 3vw; display: inline-block; margin: 0 1px; max-height: 35px; max-width: 26.25px;"> </li> </button> </ul> <ul style="padding: 0; margin: 0 auto; display: table; text-align: center; width: auto;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 4vw; width: 3vw; display: inline-block; margin: 0 1px; max-height: 35px; max-width: 26.25px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 4vw; width: 3vw; display: inline-block; margin: 0 1px; max-height: 35px; max-width: 26.25px;"> </li> </button> </ul> <ul style="padding: 0; margin: 0 auto; display: table; text-align: center; width: auto;"> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 4vw; width: 3vw; display: inline-block; margin: 0 1px; max-height: 35px; max-width: 26.25px;"> </li> </button> <button style="background: none; color: inherit; border: none; padding: 0; font: inherit; cursor: pointer; outline: inherit;"> <li style="background: url('https://images.pokemontcg.io/xy1/44.png') center/contain no-repeat; height: 4vw; width: 3vw; display: inline-block; margin: 0 1px; max-height: 35px; max-width: 26.25px;"> </li> </button> </ul> </div> </div> </div> <button style=" cursor: pointer; display: inline-block; padding: 5px 20px; background-color: #40435e; border-radius: 5px; color: white; margin-top: 5px; "> Show Hand </button> </div>`

		let html =
			`<div class='chat' style='margin-top: 4px;margin-left: 4px;background-image: linear-gradient(rgba(255 , 255 , 255 , 0) , rgba(90 , 120 , 160 , 1));height:100%;'><center><b> <i> Cardify's </i> </b> <br> <strong style='font-size:16px;'>`
			+ `<span class="username">${this.initBattleData.p1.name} </span> vs <span class="username">${this.initBattleData.p2.name} </span> </strong> </center>`;

			html += `<div style="float:left;padding: 5px ; background: rgba(173, 103, 38, 0.6) ; box-shadow: inset -1px -1px 2px #fff , inset 1px 1px 2px #fff ; border-radius: 8px;  text-shadow: 0 -1px 0 #0f1924;max-width:80px;">`
			html += `<strong> Unranked </strong>`
			html += `</div>`

			html += `<div style="float:right;padding: 5px ; background: rgba(173, 103, 38, 0.6) ; box-shadow: inset -1px -1px 2px #fff , inset 1px 1px 2px #fff ; border-radius: 8px;  text-shadow: 0 -1px 0 #0f1924;max-width:160px;">`
			html += `<strong> Standard Battle </strong>`
			html += `</div>`

			html += `<hr/>`


			if(!this.initiated) {
				if(!this.initBattleData[this.playerid].deck) {
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
					}
					else {
						html += `<strong> You dont have any decks, please create a deck. </strong>`
					}
					html += `</div>`;
				} else {
					html += `<br><br><br> <h2> Opponent is choosing a battle deck, please wait... </h2>`
				}
			}
			else {
			html += board
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
			let p2 = bpage.initBattleData.p1.id == user.id ? bpage.initBattleData.p2.id : bpage.initBattleData.p1.id;
			let bpage2 = Battles.pages[p2][battleid];


			switch(cmd) {
				case "selectdeck": {
					console.log(targets)
					let deckid = Tools.toId(targets[0])
					bpage.selectDeck(deckid);
				}
			}

			bpage2.send();


		},
		aliases: ["bpage"],
	},
};
