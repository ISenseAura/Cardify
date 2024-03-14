import fs = require('fs');

import { copyPokemonShowdownShaBase, exec, getInputFolders } from '../../tools';
import type { BaseCommandDefinitions } from "../types/command-parser";

import { packs } from "../pokemon-tcg/packs"
import { currency } from '../pokemon-tcg/currency';
import { shop } from '../pokemon-tcg/shop';
import {Decks} from '../pokemon-tcg/simulator/decks'

import { Battles } from '../pokemon-tcg/simulator/battle';

import pokemon from "pokemontcgsdk"

import Simulator from './src/simulator';






export const commands: BaseCommandDefinitions = {
	eval: {
	
		command(target, room, user) { // eslint-disable-line @typescript-eslint/no-unused-vars

			let sim = new Simulator()

			try {
				let Packs = packs;
				let Currency = currency;
				let Shop = shop;
				let API = pokemon;
				 let decks = Decks;
				 let BTS = Battles;
				
				//let sim = new Simulator();
				let result = eval(target) as unknown;
				if (result === null) {
					result = "null";
				} else if (result === undefined) {
					result = "undefined";
				} else if (typeof result === 'string' && !result) {
					result = '""';
				} else if (typeof result === 'number' && !result) {
					result = '0';
				} else if (typeof result === 'boolean' && !result) {
					result = 'false';
				}
				this.say(result as string);
			} catch (e) {
				this.say((e as Error).message);
				console.log((e as Error).stack);
			}
		},
		aliases: ['js'],
		developerOnly: true,
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},

	test: {
		command(target,room,user) {
			pokemon.set.all({ q: 'ptcgoCode:par' })
  .then(result => {
      console.log(result)  })
		},
		developerOnly:true
	},

	say: {
		command(target, room, user) {
			this.say(target);

		},
		developerOnly : true,
	},

	uptime: {
		command(target, room, user) { // eslint-disable-line @typescript-eslint/no-unused-vars
			this.say(Tools.toDurationString(process.uptime() * 1000))
		},
		aliases: ["ontime"],
		developerOnly: true,
	},
	gitpull: {
		command(target, room, user) {
			let result = exec('git pull');
			if (result === false) {
				user.say("An error occurred while running ``git pull``.");
				return;
			}

			/*
			const privateRepo = getInputFolders()['Lanette-private'].inputPath;
			if (fs.existsSync(privateRepo)) {
				const currentDirecory = process.cwd();
				process.chdir(privateRepo);

				result = exec('git pull');

				process.chdir(currentDirecory);

				if (result === false) {
					user.say("An error occurred while running ``git pull`` in Lanette-private.");
					return;
				}
			}

			*/
			user.say("Successfully ran ``git pull``.");
		},
		developerOnly: true,
		description: ["fetches the latest code from the source GitHub repository"],
	},
	reload: {
		command(target, room, user) {
			if (!target) return;
			if (__reloadInProgress) return this.say("You must wait for the current reload to finish.");

			void __reloadModules(user.name, target.split(","));
		},
		aliases: ['hotpatch'],
		developerOnly: true,
		syntax: ["[module(s)]"],
		description: ["reloads the given module(s)"],
	},
	syncpokemonshowdownsha: {
		command() {
			copyPokemonShowdownShaBase();
			this.say("Synced pokemon-showdown-sha.txt file.");
		},
		aliases: ['syncpssha'],
		developerOnly: true,
		description: ["syncs pokemon-showdown-sha.txt with the latest base file"],
	},
};
