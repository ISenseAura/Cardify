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
	minigame: {
		command(target, room, user) {
			if (!user.hasRank(room, "+")) return room.sayPrivateHtml(
				user,
				"<b style='color:red;'> Access Denied </b> Only roomauth can use this command"
			);

			let minigamesList = Object.keys(Minigames.minigames);

			if(!target || this.isPm(room)) {

				this.say(`Minigames can be played in one of Cardify's room. Here's the list of minigames : ${minigamesList.join(", ")}`)
				return;
			}
			else {
				let args = target.split(",");
				switch(args[0]){
					case "create":
					case "n":
					case "new":{
						global.Minigames.createNew(Tools.toId(args[1]))
					}
				}
			}
		},
		aliases: ["btp"],
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},

};
