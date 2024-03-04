import fs = require("fs");

import { copyPokemonShowdownShaBase, exec, getInputFolders } from "../../tools";
import type { BaseCommandDefinitions } from "../types/command-parser";

import { Packs } from "../pokemon-tcg/packs";

export const commands: BaseCommandDefinitions = {
	daily: {
		command(target, room, user) {
			// eslint-disable-line @typescript-eslint/no-unused-vars
			let packs = new Packs();

			let dt = packs.canOpenDaily(user);
			if (dt > 1) {
				return room.say(
					`You have already opened your daily, reseting in ${Tools.toDurationString(
						dt
					)}`
				);
			}
			room.say(`${user.name} is opening their daily pack...`);
			/*
			room.say("/cmd userdetails " + user.id);

			if(!user.autoconfirmed)  return room.sayPrivateHtml(user,` <p style="color:red;"> Only autoconfirmed users can use this command </p>`)
*/
			let packIDs = [
				"swsh1",
				"swsh2",
				"swsh3",
				"swsh4",
				"swsh5",
				"swsh6",
				"swsh7",
				"sv1",
				"sv2",
				"sv3",
				"sv4",
				"swsh45",
				"swsh35",
			];

			let rares = [
				"rare holo v",
				"rare holo vmax",
				"rare shiny",
				"rare holo gx",
				"rare ultra",
			];

			try {
				packs
					.openDaily(user, Tools.sampleOne(packIDs))
					.then((data: any) => {
						let html = `<div style="background-color: #282a45; color: white; font-family: Arial, sans-serif; padding: 2px 0; text-align: center;"><div style="margin: 0 auto; text-align: center; line-height: 0; vertical-align: middle;"><h3 style="font-size:12px;margin-left: auto; margin-right: 4px; background-color: #282a45; display: inline-block; margin-top: 0; margin-bottom: 0;">${user.name} opened </h3><img width="70" height="40" src="${data.image}" alt="pack-logo" style="margin-right: auto; margin-left: 4px; vertical-align: middle;"></div><details>`;

						html += `<summary> View Cards </summary> <ul style="margin: 3px auto; padding: 0; display: table;">`;

						data.cards.forEach((card: any) => {
							let fullCardHtml = `<div style="position:relative;margin:auto;"><img src="${card.large}" width="250" height="350"/></div>`;

							html += `<button name="send" value="/botmsg cardify,${Config.commandCharacter}vcard ${card.large}" style="background: url('${card.image}') center/contain no-repeat; height: 100px; width: 75px; display: inline-block; margin: 0 1px;"></button>`;
						});

						html += `</ul></details></div>`;
						room.sayHtml(html);
					})
					.catch((e: any) => {
						room.sayPrivateHtml(
							user,
							"Could not find a pack for you, maybe try again?"
						);
						Users.get("pokem9n")?.say(e.message);
						throw new Error(e);
					});
			} catch (e) {
				room.say((e as Error).message);
				console.log((e as Error).stack);
			}
		},
		aliases: ["d"],
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},

	welcomepack: {
		command(target, room, user) {
			// eslint-disable-line @typescript-eslint/no-unused-vars
			if(!user.hasRank(room,"+")) return room.sayPrivateHtml(
				user,
				"<b style='color:red;'> Access Denied </b> Only roomauth can use this command"
			);
			let packs = new Packs();

			let tuser = Users.get(Tools.toId(target));
			if (!tuser) return room.say("User not found");
			room.say(
				`${tuser.name} was gifted a **Welcome Pack** by ${user.name}`
			);
			room.say(`${tuser.name} is opening their **Welcome Pack**...`);
			/*
			room.say("/cmd userdetails " + user.id);

			if(!user.autoconfirmed)  return room.sayPrivateHtml(user,` <p style="color:red;"> Only autoconfirmed users can use this command </p>`)
*/
			let packIDs = [
				"swsh1",
				"swsh2",
				"swsh3",
				"swsh4",
				"swsh5",
				"swsh6",
				"swsh7",
				"sv1",
				"sv2",
				"sv3",
				"sv4",
				"swsh45",
				"swsh35",
			];

			let rares = [
				"rare holo v",
				"rare holo vmax",
				"rare shiny",
				"rare holo gx",
				"rare ultra",
			];

			try {
				packs
					.openDaily(tuser, Tools.sampleOne(packIDs), "Welcome Pack")
					.then((data: any) => {
						let html = `<div style="background-color: #282a45; color: white; font-family: Arial, sans-serif; padding: 2px 0; text-align: center;"><div style="margin: 0 auto; text-align: center; line-height: 0; vertical-align: middle;"><h3 style="font-size:12px;margin-left: auto; margin-right: 4px; background-color: #282a45; display: inline-block; margin-top: 0; margin-bottom: 0;">${user.name} opened </h3><img width="70" height="40" src="${data.image}" alt="pack-logo" style="margin-right: auto; margin-left: 4px; vertical-align: middle;"></div><details>`;

						html += `<summary> View Cards </summary> <ul style="margin: 3px auto; padding: 0; display: table;">`;

						data.cards.forEach((card: any) => {
							let fullCardHtml = `<div style="position:relative;margin:auto;"><img src="${card.large}" width="250" height="350"/></div>`;

							html += `<button name="send" value="/botmsg cardify,${Config.commandCharacter}vcard ${card.large}" style="background: url('${card.image}') center/contain no-repeat; height: 100px; width: 75px; display: inline-block; margin: 0 1px;"></button>`;
						});

						html += `</ul></details></div>`;
						room.sayHtml(html);
					})
					.catch((e: any) => {
						room.sayPrivateHtml(
							user,
							"Could not find a pack for you, maybe try again?"
						);
						Users.get("pokem9n")?.say(e.message);
						throw new Error(e);
					});
			} catch (e) {
				room.say((e as Error).message);
				console.log((e as Error).stack);
			}
		},
		aliases: ["wpack"],
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},
};
