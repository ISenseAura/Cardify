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
	creategroupchat: {
	
		command(target, room, user) { // eslint-disable-line @typescript-eslint/no-unused-vars
            let botdev = Rooms.get("botdevelopment");
            if(!botdev) return this.say("Room botdveelopment not found");
            if(!target) return this.say("Usage : ``.creategroupchat name``");
            botdev.say("/makegroupchat " + target);
			setTimeout(() => {
				let gc = Rooms.get(`groupchat-cardify-${Tools.toId(target)}`);
				gc?.say("/invite " + user.id);
			},2000)
          
		},
		aliases: ['newgc'],
		developerOnly: true,
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},

	createsubroomchat: {
	
		command(target:string, room, user) { // eslint-disable-line @typescript-eslint/no-unused-vars
         
            if(!target || target?.split(",").length < 2) return this.say("Usage : ``.createsubroomchat room, name``");
			let mainRoom = Rooms.get(Tools.toId(target.split(",")[0]));
            if(!mainRoom) return this.say("Room " + target.split(",")[0] + " not found");
            mainRoom.say("/subroomgroupchat " + target.split(",")[1]);
			setTimeout(() => {
				let gc = Rooms.get(`groupchat-${target.split(",")[0]}-${target.split(",")[1]}`);
				gc?.say("/invite " + user.id);
				gc?.say("/roommod " + user.id);
				gc?.say("/modjoin +");
			},2000)
          
		},
		aliases: ['newsgc'],
		developerOnly: true,
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},

	deleteroom: {
	
		command(target:string, room, user) { // eslint-disable-line @typescript-eslint/no-unused-vars
			if(this.isPm(room)) return user.say("Cannot be used in PMs");
			if(target && parseInt(target) < 5) return this.say("Usage ``.deleteroom time``. time is in minutes and should be greater than 4") 
			if(room.id.startsWith("groupchat")) {
				setTimeout(() => {
					room.say("/deletegroupchat")
				}, parseInt(target) > 4 ? parseInt(target) * 60 * 1000 : 100)
			}
          
		},
		aliases: ['droom'],
		developerOnly: true,
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},

	invite: {
	
		command(target:string, room, user) { // eslint-disable-line @typescript-eslint/no-unused-vars
			if(this.isPm(room)) return user.say("Cannot be used in PMs");
			if(!target) return this.say("Usage ``.invite user``.") 
			room.say("/invite " + target);
		},
		aliases: ['inv'],
		developerOnly: true,
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},


	
};
