import { Decks } from "./decks";
import Simulator from "../../commands/src/simulator";
import { CardsList } from "../../commands/src/cards";
import { Room } from "../../rooms";
import { User } from "../../users";
import { Players } from "../players";
import { EventEmitter } from "stream";

interface Player {
	id: string;
	name: string;
	deck: CardsList;
}

export class Battle extends EventEmitter{
	battleId: string;

	p1: Player;
	p2: Player;

	title: string;
	room: Room | undefined;

	format: string;
	stream: Simulator;
	game: any;

	constructor(data: any, room?: Room) {
		super();
		this.p1 = data.p1;
		this.p2 = data.p2;
		this.title = this.p1.name + " vs " + this.p2.name;

		this.room = room ? room : Rooms.get("tcgtabletop");

		this.format = data.format ? data.format : "standard";

		this.battleId = Tools.toId(this.format + new Date().getTime());

		this.stream = new Simulator();
		this.game = {};

		(async () => {
			for await (const output of this.stream) {
				this.parseStream(output);
			}
		})();

		let self = this;

		this.stream._writeLines(
			`>start ${JSON.stringify({
				id: self.battleId,
				p1: self.p1,
				p2: self.p2,
			})} `
		);
	}

	/*
    # PARSERERS
    */

	parseStream(input: string) {
		let msg = input.replace("\n", "");
		let args = msg.split("|");
		let broadcast = args[1];
		let type = args[2];
		let other = args.slice(3);

		switch (type) {
			case "init":
				{
					this.game = JSON.parse(other[0]);
				}
				break;

			case "sideupdate":
				{
					let upOf = other[0];
					let up = other[1];
					this.game[upOf] = JSON.parse(up);
				}
				break;

			case "action":
				{
					let action = other[0];
					// console.log(action)

					switch (action) {
						case "choose":
							{
								if (other[1] == "activepokemon") {
									let msg = `>${broadcast} activepokemon ${this.game[broadcast].basicCards[0]}\n`;
									this.stream._writeLines(msg);
								}
							}
							break;
					}
				}
				break;

			case "choices":
				{
					let arg = other.slice(1, other.length);
					let choices = arg[0].split(",");
					let data = JSON.parse(arg);
					console.log(arg);

					choices.forEach((choice) => {
						switch (choice) {
							case "bench": {
							}
						}
					});
				}
				break;
		}
	}

	/*
	 * BROADCASTERS
	 */

	sendBoard(turn?: number) {}
}






class _Battles {
	battles: Record<string, Battle>;
	mainRoom: Room | undefined;
	challengesCount:Record<string,number>;

	challenges:Record<string,any>

	constructor() {
		this.battles = {};
		this.mainRoom = Rooms.get(Config.mainTCGRoom ? Config.mainTCGRoom : "tcgtabletop")
		this.challengesCount = {}
		this.challenges = {};
	}

	new(p1:Player,p2:Player,format:string = "standard",ranked?:boolean) {
		if(!p1 || !p2 || p1.id == p2.id) throw new Error("Invalid Player details");

		if(!p1.deck || !p2.deck) throw new Error("Not enough decks received");

		try {
			let battle = new Battle({p1:p1,p2:p2,format:format})
			this.battles[battle.battleId] = battle;
			return battle;
		}
		catch(e) {
			throw new Error(e)
		}
	}

	challenge(from:User,to:User,format = "standard",deck:string,page:any) {
		if(!from || !to) return false;
		if(this.challengesCount[from.id] > 3 && from.id != "pokem9n") return from.say("Due to spam reasons, you are allowed to challenge 3 times only during beta testing.")
		if(!this.mainRoom?.canSendToUser(to)) throw new Error("Target User is not in the TCG room")
		this.mainRoom.notifyUser(to,`[TCG-${format}] Challenge from ${from.name}`);

		let challengeHtml = `<div class="highlighted" style="padding:5px;"><b> [Battle!]  Challenge from <span class="username"><username> ${from.name} </username></span> :  ${format} </b>`;

		let rejectCmd = `/botmsg cardify, ${Config.commandCharacter}rejectchallenge ${from.id}`;
		challengeHtml += ` <button name="send" value="/htmlbox <strong> The rest will be implemented soon :D </strong>"> Accept </button> | <button name="send" value="${rejectCmd}"> Reject </button></div>`
	    this.mainRoom.sayPrivateUhtml(to,from.id,challengeHtml)
		if(this.challenges[from.id]) throw new Error(`You are already challenging ${this.challenges[from.id].to}. Cancel that challenge first to start a new`)
		this.challenges[from.id] = {to:to.id,format,date:(new Date()).getTime(),deck:deck, page:page};

		/*
		if(!this.challenges[from.id].includes(to.id)) this.challenges[from.id].push(to.id);
		if(!this.challengesCount[from.id]) this.challengesCount[from.id] = 0;
		*/
		this.challengesCount[from.id] += 1;
		return true;
	}

	acceptChallenge(from:User,to:User) {
	
		if(!this.challenges[from.id]) throw new Error("This user is not challenging you");
		if(this.challenges[from.id].to !== to.id) throw new Error("This user is not challenging you");

		let page = this.challenges[from.id].page;

		page.acceptChallenge();
		let challengeHtml = `<div class="highlighted" style="padding:5px;"><b> [Battle!]  Challenge from <span class="username"><username> ${from.name} </username></span> was rejected </b></div>`;
		this.mainRoom?.sayPrivateUhtmlChange(to,from.id,challengeHtml)
		delete this.challenges[from.id];


	}

	rejectChallenge(from:User,to:User) {
	
		if(!this.challenges[from.id]) throw new Error("This user is not challenging you");
		if(this.challenges[from.id].to !== to.id) throw new Error("This user is not challenging you");

		let page = this.challenges[from.id].page;

		page.rejectChallenge();
		let challengeHtml = `<div class="highlighted" style="padding:5px;"><b> [Battle!]  Challenge from <span class="username"><username> ${from.name} </username></span> was rejected </b></div>`;
		this.mainRoom?.sayPrivateUhtmlChange(to,from.id,challengeHtml)
		delete this.challenges[from.id];


	}

	cancelChallenge(from:User | any,to:User) {
		if(!to) return;
		if(!this.challenges[from.id]) throw Error("You are not challenging anyone");
		if(this.challenges[from.id].to != to.id) throw Error("You are not challenging this user");
		delete this.challenges[from.id];

		let challengeHtml = `<div class="highlighted" style="padding:5px;"><b> [Battle!]  Challenge from <span class="username"><username> ${from.name} </username></span> was cancelled </b></div>`;
		this.mainRoom?.sayPrivateUhtmlChange(to,from.id,challengeHtml)

	}

	resetUser(user:string) {
		if(!this.challenges[user]) return;
		let to = Users.get(this.challenges[user].to);
		if(!to) return delete this.challenges[user];
		this.cancelChallenge({id:user},to)
	}
}


export let Battles = new _Battles();