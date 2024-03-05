import fs = require("fs");

import { copyPokemonShowdownShaBase, exec, getInputFolders } from "../../tools";
import type { BaseCommandDefinitions } from "../types/command-parser";

import { Packs } from "../pokemon-tcg/packs";

export const commands: BaseCommandDefinitions = {
	collection: {
		command(target, room, user) {
			// eslint-disable-line @typescript-eslint/no-unused-vars
			let packs = new Packs();
			/*
			room.say("/cmd userdetails " + user.id);

			if(!user.autoconfirmed)  return room.sayPrivateHtml(user,` <p style="color:red;"> Only autoconfirmed users can use this command </p>`)
*/
	

			let rares = [
				"rare holo v",
				"rare holo vmax",
				"rare shiny",
				"rare holo gx",
				"rare ultra",
			];

			try {
				
				let data = packs.getDatabase("collection")[user.id];
                if(!data) return room.say("You have no cards in collection")
				let html = `<div style="background-color: #282a45; color: white; font-family: Arial, sans-serif; padding: 2px 0; text-align: center;"><div style="margin: 0 auto; text-align: center; line-height: 0; vertical-align: middle;"><h3 style="font-size:14px;margin-left: auto; margin-right: 4px; background-color: #282a45; display: inline-block; margin-top: 5px; margin-bottom: 10px;">Your Collection <br><br></h3></div><details>`;

						html += `<summary> View Cards </summary> <ul style="margin: 3px auto; padding: 0; display: table;">`;

						data.cards.forEach((card: any,i) => {
							let fullCardHtml = `<div style="position:relative;margin:auto;"><img src="${card.large}" width="250" height="350"/></div>`;

                            if(i % 16 == 0 && i != 0) html += `</ul></details><details><summary> View Cards </summary><ul>`;
							html += `<button name="send" value="/botmsg cardify,${Config.commandCharacter}vcard ${card.large}" style="background: url('${card.image}') center/contain no-repeat; height: 100px; width: 75px; display: inline-block; margin: 0 1px;"></button>`;
						});

						html += `</ul></details></div>`;
						room.sayHtml(html);
				
				
			} catch (e) {
                
						Users.get("pokem9n")?.say(e.message);
						throw new Error(e);
				//room.say((e as Error).message);
				console.log((e as Error).stack);
			}
		},
		aliases: ["mycards"],
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},

};
