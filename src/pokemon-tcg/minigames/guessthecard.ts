import { Room } from "../../rooms";
import { User } from "../../users";
import { IMinigame, Minigame } from "../minigames";

import pokemon from "pokemontcgsdk";
import { packs } from "../packs";


class game extends Minigame {
	guessesRemaining: number;
	lastGuess: string;
	lastGuessBy: string;

	answer: any;
	card?: any;
	timer?: any;

	id: string;

	static name: string;
	static description: string;

	constructor(room: Room, user: User, timer?: number) {
		let data: IMinigame = {
			name: name,
			official: false,
			textBased: false,
			isQuick: true,
		};
		super(data, room, user);
		this.guessesRemaining = 5;
		this.lastGuess = "";
		this.lastGuessBy = "";

		this.answer = null;

		this.id = Tools.random(900) + "gtc";
		this.timer = timer
			? setTimeout(() => {
					this._end("Times Up!");
			  }, timer * 1000)
			: null;
		name = "Guess The Card";
		description =
			"A Quick Minigame in which you are shown a part of a card and you have guess it's correct name.";
	}

	gameStart() {
		this._start();
		let num = Tools.random(500);
		pokemon.card
			.all({ q: `nationalPokedexNumbers:[${num} TO ${num + 1}]` })
			.then((result: any) => {
				console.log(result);
				this.card = result[0];
				this.answer = Tools.toId(this.card.name);
				let html = `<div style="font-family: Arial, sans-serif; display: flex; height: auto; margin: 0 auto; background-color: #6788ab; color: white; overflow: hidden; padding: 5px 0;"> <div style="margin-left: auto; margin-right: 10px; overflow: hidden; width: 150px; border-radius: 8px; position: relative; "> <div style="background: url('${this.card.images.small}') center/contain no-repeat; height: 200px; width: 150px; display: inline-block; margin: 0 1px; "> </div> <div style="background: black center/cover no-repeat; position: absolute; width: 90%; height: 50%; top: 3%; left: 5.5%; z-index: 10; opacity: 99%; border-radius: 2px;"> </div> </div> <div style="width: 45%; margin: auto 5px auto 5px; font-size: 13px; line-height: 17px; padding: 8px; vertical-align: middle; overflow: hidden;"> <h2 style="vertical-align: middle; font-style: italic; line-height: 1.2em;">Who's That Pokemon?</h2> <br> <span>Use <code>.gc yourguess </code> to guess <br> Guesses remaining : ${this.guessesRemaining} </span></div> </div>`;
				this.room?.sayUhtml("burnthecard" + this.id, html);
				this.setReward(this.card.name + " Card!");
			});
	}

	guess(target: string, user: User) {
		let answer = this.answer;
		let gameCount = this.id;
		let room = this.room;
		let card = this.card;

		if (!answer.length) return;
		if (answer == Tools.toId(target)) {
			let html = `<div style="font-family: Arial, sans-serif; display: flex; height: auto; margin: 0 auto; background-color: #6788ab; color: white; overflow: hidden; padding: 5px 0;"> <div style="margin-left: auto; margin-right: 10px; overflow: hidden; width: 150px; border-radius: 8px; position: relative; "> <div style="background: url('${
				card.images.small
			}') center/contain no-repeat; height: 200px; width: 150px; display: inline-block; margin: 0 1px; "> </div> </div> <div style="width: 45%; margin: auto 5px auto 5px; font-size: 13px; line-height: 17px; padding: 8px; vertical-align: middle; overflow: hidden;"> <h2 style="vertical-align: middle; font-style: italic; line-height: 1.2em;">Congratulations to ${
				user.name
			} for guessing the right answer </h2> <br> <span> Guesses remaining : ${
				this.guessesRemaining - 1
			}</span></div> </div>`;
			room.sayUhtml("burnthecard" + gameCount, html);
			this.gameWin(user);
			return;
		} else if (this.guessesRemaining == 1) {
			let html = `<div style="font-family: Arial, sans-serif; display: flex; height: auto; margin: 0 auto; background-color: #6788ab; color: white; overflow: hidden; padding: 5px 0;"> <div style="margin-left: auto; margin-right: 10px; overflow: hidden; width: 150px; border-radius: 8px; position: relative; "> <div style="background: url('${
				card.images.small
			}') center/contain no-repeat; height: 200px; width: 150px; display: inline-block; margin: 0 1px; "> </div> </div> <div style="width: 45%; margin: auto 5px auto 5px; font-size: 13px; line-height: 17px; padding: 8px; vertical-align: middle; overflow: hidden;"> <h2 style="vertical-align: middle; font-style: italic; line-height: 1.2em;color:red;"> No one could guess the right answer! </h2> <br> <span> Guesses remaining : ${"0"}</span></div> </div>`;
			room.sayUhtml("burnthecard" + gameCount, html);
		} else {
			this.guessesRemaining = this.guessesRemaining - 1;
			this.lastGuess = user.name + " - " + target;
			let html = `<div style="font-family: Arial, sans-serif; display: flex; height: auto; margin: 0 auto; background-color: #6788ab; color: white; overflow: hidden; padding: 5px 0;"> <div style="margin-left: auto; margin-right: 10px; overflow: hidden; width: 150px; border-radius: 8px; position: relative; "> <div style="background: url('${card.images.small}') center/contain no-repeat; height: 200px; width: 150px; display: inline-block; margin: 0 1px; "> </div> <div style="background: black center/cover no-repeat; position: absolute; width: 90%; height: 50%; top: 3%; left: 5.5%; z-index: 10; opacity: 99%; border-radius: 2px;"> </div> </div> <div style="width: 45%; margin: auto 5px auto 5px; font-size: 13px; line-height: 17px; padding: 8px; vertical-align: middle; overflow: hidden;"> <h2 style="vertical-align: middle; font-style: italic; line-height: 1.2em;">Who's That Pokemon?</h2> <br> <span> Use <code>.gc yourguess </code> to guess <br>Last Guess : ${this.lastGuess} <br> Guesses remaining : ${this.guessesRemaining} </span></div> </div>`;
			room.sayUhtml("burnthecard" + gameCount, html);

			return;
		}
	}

	gameWin(user: User) {
		this._win(user);
		packs.addCard(user, this.card, this.name + " Minigame");
	}
}


export default game;