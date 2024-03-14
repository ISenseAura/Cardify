import fs = require('fs');

import { copyPokemonShowdownShaBase, exec, getInputFolders } from '../../tools';
import type { BaseCommandDefinitions } from "../types/command-parser";

import { packs } from "../pokemon-tcg/packs"
import { currency } from '../pokemon-tcg/currency';
import { shop } from '../pokemon-tcg/shop';
import {decks} from '../pokemon-tcg/simulator/decks'

import pokemon from "pokemontcgsdk"

import Simulator from './src/simulator';
import { Battle } from '../pokemon-tcg/simulator/battle';




export const commands: BaseCommandDefinitions = {
	battle: {
	
		command(target, room, user) { // eslint-disable-line @typescript-eslint/no-unused-vars
            let opts = target.split("|");
            let p1 = Users.get(Tools.toId(opts[0].split(",")[0]))
            let p1Deck = opts[0].split(",")[1].trim()

            let p2 = Users.get(Tools.toId(opts[1].split(",")[0]))
            let p2Deck = opts[1].split(",")[1].trim()

            if(!p1 || !p1Deck || !p2 || !p2Deck) return this.say("Invalid Syntax. Usage : ``.battle user1,deck-pastebin-link|user2,deck-pastebin-lin``");

            let battleData = {};

            decks.finalise(p1Deck).then((deck) => {
                battleData.p1 = {userid:p1.id,playerid:"p1", name:p1.name, deck: deck }
                decks.finalise(p2Deck).then((deck2) =>{
                    battleData.p2 = {userid:p2.id,playerid:"p2", name:p2.name, deck: deck2 }
                    let game = new Battle(battleData)
                })
            })
            


        },
    }
}