import fs = require("fs");

import { copyPokemonShowdownShaBase, exec, getInputFolders } from "../../tools";
import type { BaseCommandDefinitions } from "../types/command-parser";

import { packs } from "../pokemon-tcg/packs";

export const commands: BaseCommandDefinitions = {
	daily: {
		command(target, room, user) {
			// eslint-disable-line @typescript-eslint/no-unused-vars
			let tu = user;
			if (!this.isPm() && !user.isRoomauth(room) && !user.isDeveloper())
				return user.say(
					"Yo! You can't use this command in the room anymore (unless youre a roomauth). Please use it here instead, thank you~"
				);
			if (target) tu = Users.get(Tools.toId(target));
			if (!tu) return this.say("User is offline");
			let dt = packs.canOpenDaily(tu);
			if (dt > 1) {
				return room.say(
					`You have already opened your daily, reseting in ${Tools.toDurationString(
						dt
					)}`
				);
			}
			room.say(
				`You can claim your daily from the shop, type ${"``.tcg``"} in the PMs to open the shop`
			);
			return;
			/*
			room.say("/cmd userdetails " + user.id);

			if(!user.autoconfirmed)  return room.sayPrivateHtml(user,` <p style="color:red;"> Only autoconfirmed users can use this command </p>`)
*/
			let packIDs = [
				"base1",
				"base2",
				"base3",
				"base4",
				"base5",
				"gym1",
				"gym2",
				"neo3",
				"neo4",
				"base6",
				"ecard1",
				"ecard2",
				"ecard3",
				"ex1",
				"ex2",
				"ex3",
				"np",
				"ex4",
				"ex5",
				"ex6",
				"pop1",
				"ex7",
				"ex8",
				"ex9",
				"ex10",
				"pop2",
				"ex11",
				"ex12",
				"pop3",
				"ex13",
				"ex14",
				"pop4",
				"ex15",
				"pop5",
				"ex16",
				"dp1",
				"dpp",
				"dp2",
				"pop6",
				"dp3",
				"bwp",
				"bw1",
				"mcd11",
				"bw2",
				"bw3",
				"bw4",
				"bw5",
				"mcd12",
				"bw6",
				"dv1",
				"bw7",
				"bw8",
				"bw9",
				"bw10",
				"xyp",
				"bw11",
				"xy0",
				"xy1",
				"xy2",
				"xy3",
				"xy4",
				"xy5",
				"dc1",
				"xy6",
				"xy7",
				"xy8",
				"xy9",
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
				"sv3pt5",
				"swsh45",
				"swsh35",
				"xy12",
				"sm1",
				"smp",
				"sm2",
				"sm3",
				"sm35",
				"sm4",
				"sm5",
				"sm6",
				"sm7",
				"sm75",
				"sm8",
				"sm9",
				"det1",
				"sm10",
				"sm11",
				"sm115",
				"sma",
				"sm12",
				"swshp",
				"swsh1",
				"swsh2",
				"swsh3",
				"swsh35",
				"swsh4",
				"swsh45",
				"swsh45sv",
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
			if (!user.hasRank(room, "+"))
				return room.sayPrivateHtml(
					user,
					"<b style='color:red;'> Access Denied </b> Only roomauth can use this command"
				);

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
				"base1",
				"base2",
				"base3",
				"base4",
				"base5",
				"gym1",
				"gym2",
				"neo3",
				"neo4",
				"base6",
				"ecard1",
				"ecard2",
				"ecard3",
				"ex1",
				"ex2",
				"ex3",
				"np",
				"ex4",
				"ex5",
				"ex6",
				"pop1",
				"ex7",
				"ex8",
				"ex9",
				"ex10",
				"pop2",
				"ex11",
				"ex12",
				"pop3",
				"ex13",
				"ex14",
				"pop4",
				"ex15",
				"pop5",
				"ex16",
				"dp1",
				"dpp",
				"dp2",
				"pop6",
				"dp3",
				"bwp",
				"bw1",
				"mcd11",
				"bw2",
				"bw3",
				"bw4",
				"bw5",
				"mcd12",
				"bw6",
				"dv1",
				"bw7",
				"bw8",
				"bw9",
				"bw10",
				"xyp",
				"bw11",
				"xy0",
				"xy1",
				"xy2",
				"xy3",
				"xy4",
				"xy5",
				"dc1",
				"xy6",
				"xy7",
				"xy8",
				"xy9",
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
				"sv3pt5",
				"swsh45",
				"swsh35",
				"xy12",
				"sm1",
				"smp",
				"sm2",
				"sm3",
				"sm35",
				"sm4",
				"sm5",
				"sm6",
				"sm7",
				"sm75",
				"sm8",
				"sm9",
				"det1",
				"sm10",
				"sm11",
				"sm115",
				"sma",
				"sm12",
				"swshp",
				"swsh1",
				"swsh2",
				"swsh3",
				"swsh35",
				"swsh4",
				"swsh45",
				"swsh45sv",
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

	giftpack: {
		command(target, room, user) {
			// eslint-disable-line @typescript-eslint/no-unused-vars
			if (!user.hasRank(room, "+"))
				return room.sayPrivateHtml(
					user,
					"<b style='color:red;'> Access Denied </b> Only roomauth can use this command"
				);

			let tuser = Users.get(Tools.toId(target));
			if (!tuser) return room.say("User not found");
			room.say(`${tuser.name} was gifted a pack by ${user.name}`);
			room.say(`${tuser.name} is opening their **Gift Pack**...`);
			/*
			room.say("/cmd userdetails " + user.id);

			if(!user.autoconfirmed)  return room.sayPrivateHtml(user,` <p style="color:red;"> Only autoconfirmed users can use this command </p>`)
*/
			let packIDs = [
				"base1",
				"base2",
				"base3",
				"base4",
				"base5",
				"gym1",
				"gym2",
				"neo3",
				"neo4",
				"base6",
				"ecard1",
				"ecard2",
				"ecard3",
				"ex1",
				"ex2",
				"ex3",
				"np",
				"ex4",
				"ex5",
				"ex6",
				"pop1",
				"ex7",
				"ex8",
				"ex9",
				"ex10",
				"pop2",
				"ex11",
				"ex12",
				"pop3",
				"ex13",
				"ex14",
				"pop4",
				"ex15",
				"pop5",
				"ex16",
				"dp1",
				"dpp",
				"dp2",
				"pop6",
				"dp3",
				"bwp",
				"bw1",
				"mcd11",
				"bw2",
				"bw3",
				"bw4",
				"bw5",
				"mcd12",
				"bw6",
				"dv1",
				"bw7",
				"bw8",
				"bw9",
				"bw10",
				"xyp",
				"bw11",
				"xy0",
				"xy1",
				"xy2",
				"xy3",
				"xy4",
				"xy5",
				"dc1",
				"xy6",
				"xy7",
				"xy8",
				"xy9",
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
				"sv3pt5",
				"swsh45",
				"swsh35",
				"xy12",
				"sm1",
				"smp",
				"sm2",
				"sm3",
				"sm35",
				"sm4",
				"sm5",
				"sm6",
				"sm7",
				"sm75",
				"sm8",
				"sm9",
				"det1",
				"sm10",
				"sm11",
				"sm115",
				"sma",
				"sm12",
				"swshp",
				"swsh1",
				"swsh2",
				"swsh3",
				"swsh35",
				"swsh4",
				"swsh45",
				"swsh45sv",
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
					.openDaily(
						tuser,
						Tools.sampleOne(packIDs),
						"Gift Pack (by " + user.name + ")"
					)
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
		aliases: ["gpack"],
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},
};
