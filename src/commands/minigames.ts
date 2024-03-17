import fs = require("fs");

import { copyPokemonShowdownShaBase, exec, getInputFolders } from "../../tools";
import type { BaseCommandDefinitions } from "../types/command-parser";

import { packs } from "../pokemon-tcg/packs";
import { currency } from "../pokemon-tcg/currency";
import { shop } from "../pokemon-tcg/shop";
import { Decks } from "../pokemon-tcg/simulator/decks";

import { Battles } from "../pokemon-tcg/simulator/battle";

import pokemon from "pokemontcgsdk";

import Simulator from "./src/simulator";

let answer = "";
let guesses = 5;
let card = "";
let lastGuess = "";

let gameCount = 0;

export const commands: BaseCommandDefinitions = {
	burnthecard: {
		command(target, room, user) {
			// eslint-disable-line @typescript-eslint/no-unused-vars
            if (this.isPm()) return this.say("Cannot be used in a PM");
            if(room.id != "tcgtabletop") return;
			if (!user.isRoomauth(room) && !user.isDeveloper()) return room.sayPrivateHtml(
					user,
					"<b style='color:red;'> Access Denied </b> Only roomauth can use this command"
				);
            answer = "";
            guesses = 5;
            card = "";
            gameCount = gameCount + 1;
			let num = Tools.random(500);
			pokemon.card
				.all({ q: `nationalPokedexNumbers:[${num} TO ${num + 1}]` })
				.then((result: any) => {
                    console.log(result)
					 card = result[0];
					answer = Tools.toId(card.name);
					let html = `<div style="font-family: Arial, sans-serif; display: flex; height: auto; margin: 0 auto; background-color: #6788ab; color: white; overflow: hidden; padding: 5px 0;"> <div style="margin-left: auto; margin-right: 10px; overflow: hidden; width: 150px; border-radius: 8px; position: relative; "> <div style="background: url('${card.images.small}') center/contain no-repeat; height: 200px; width: 150px; display: inline-block; margin: 0 1px; "> </div> <div style="background: black center/cover no-repeat; position: absolute; width: 90%; height: 50%; top: 3%; left: 5.5%; z-index: 10; opacity: 99%; border-radius: 2px;"> </div> </div> <div style="width: 45%; margin: auto 5px auto 5px; font-size: 13px; line-height: 17px; padding: 8px; vertical-align: middle; overflow: hidden;"> <h2 style="vertical-align: middle; font-style: italic; line-height: 1.2em;">Who's That Pokemon?</h2> <br> <span>Use <code>.gc yourguess </code> to guess <br> Guesses remaining : ${guesses} </span></div> </div>`;
					room.sayUhtml("burnthecard" + gameCount, html);
				});
		},
		aliases: ["btp"],
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},

	guesscard: {
		command(target, room, user) {
			if (!answer.length) return;
			if (answer == Tools.toId(target)) {
				let html = `<div style="font-family: Arial, sans-serif; display: flex; height: auto; margin: 0 auto; background-color: #6788ab; color: white; overflow: hidden; padding: 5px 0;"> <div style="margin-left: auto; margin-right: 10px; overflow: hidden; width: 150px; border-radius: 8px; position: relative; "> <div style="background: url('${card.images.small}') center/contain no-repeat; height: 200px; width: 150px; display: inline-block; margin: 0 1px; "> </div> </div> <div style="width: 45%; margin: auto 5px auto 5px; font-size: 13px; line-height: 17px; padding: 8px; vertical-align: middle; overflow: hidden;"> <h2 style="vertical-align: middle; font-style: italic; line-height: 1.2em;">Congratulations to ${user.name} for guessing the right answer </h2> <br> <span> Guesses remaining : ${guesses - 1}</span></div> </div>`;
				room.sayUhtml("burnthecard" + gameCount, html);
				return;
			} else if (guesses == 1) {
				let html = `<div style="font-family: Arial, sans-serif; display: flex; height: auto; margin: 0 auto; background-color: #6788ab; color: white; overflow: hidden; padding: 5px 0;"> <div style="margin-left: auto; margin-right: 10px; overflow: hidden; width: 150px; border-radius: 8px; position: relative; "> <div style="background: url('${card.images.small}') center/contain no-repeat; height: 200px; width: 150px; display: inline-block; margin: 0 1px; "> </div> </div> <div style="width: 45%; margin: auto 5px auto 5px; font-size: 13px; line-height: 17px; padding: 8px; vertical-align: middle; overflow: hidden;"> <h2 style="vertical-align: middle; font-style: italic; line-height: 1.2em;color:red;"> No one could guess the right answer! </h2> <br> <span> Guesses remaining : ${"0"}</span></div> </div>`;
				room.sayUhtml("burnthecard" + gameCount, html);
			} else {
                guesses = guesses - 1;
                lastGuess = user.name + " - " + target;
                let html = `<div style="font-family: Arial, sans-serif; display: flex; height: auto; margin: 0 auto; background-color: #6788ab; color: white; overflow: hidden; padding: 5px 0;"> <div style="margin-left: auto; margin-right: 10px; overflow: hidden; width: 150px; border-radius: 8px; position: relative; "> <div style="background: url('${card.images.small}') center/contain no-repeat; height: 200px; width: 150px; display: inline-block; margin: 0 1px; "> </div> <div style="background: black center/cover no-repeat; position: absolute; width: 90%; height: 50%; top: 3%; left: 5.5%; z-index: 10; opacity: 99%; border-radius: 2px;"> </div> </div> <div style="width: 45%; margin: auto 5px auto 5px; font-size: 13px; line-height: 17px; padding: 8px; vertical-align: middle; overflow: hidden;"> <h2 style="vertical-align: middle; font-style: italic; line-height: 1.2em;">Who's That Pokemon?</h2> <br> <span> Use <code>.gc yourguess </code> to guess <br>Last Guess : ${lastGuess} <br> Guesses remaining : ${guesses} </span></div> </div>`;
				room.sayUhtml("burnthecard" + gameCount, html);
               
				return;
			}
		},
		aliases: ["gc"],
	},
};
