import fs = require("fs");

import { copyPokemonShowdownShaBase, exec, getInputFolders } from "../../tools";
import type { BaseCommandDefinitions } from "../types/command-parser";

import { packs } from "../pokemon-tcg/packs";
import { currency } from "../pokemon-tcg/currency";
import { shop } from "../pokemon-tcg/shop";

export const commands: BaseCommandDefinitions = {
	wallet: {
		command(target, room, user) {
			// eslint-disable-line @typescript-eslint/no-unused-vars
			if (target) {
				let opts = target.split(",");
				let sub = opts[0].split(" ")[0];
				let tuser = Users.get(Tools.toId(opts[0].split(" ")[1]));

				switch (sub) {
					case "add":
					case "give":
					case "rich":
					case "remove":
					case "take":
					case "rob":
						{
							if (!user.isDeveloper())
								return user.say("Access Denied");
							let reason = opts[2];
							let amt = parseFloat(opts[1]);
							if (!tuser)
								return this.say(
									"User not found, make sure they are online"
								);
							if (amt < 0.01)
								return this.say(
									"Amount can not be less than 0.01"
								);
							if (
								sub == "remove" ||
								sub == "take" ||
								sub == "rob"
							)
								amt = -amt;
							currency.add(
								tuser,
								amt,
								user.id,
								reason ? reason : "No reason specified"
							);
							if (sub == "remove" ||sub == "take" || sub == "rob") return this.say(`Removed ${Math.abs(amt)} ${currency.name} from ${tuser.name}'s wallet.`)
							this.say(`Added ${Math.abs(amt)} ${currency.name} to ${tuser.name}'s wallet.`)
						}
						break;

					default: {
						let tuser = Users.get(Tools.toId(target));
						if (!user.isDeveloper() && !user.hasRank(room, "+"))
							return user.say(
								`You cannot view other users' wallet`
							);
						this.say(
							`${
								tuser ? tuser.name : user.name
							}'s currency : **${currency.get(
								tuser ? tuser : user
							)}**`
						);
					}
				}
				return;
			} else {
				if (
					!user.isDeveloper() &&
					!user.hasRank(room, "+") &&
					!this.isPm()
				) {
					user.say(
						`${user.name}'s currency : **${currency.get(user)}**`
					);
					return;
				} else {
					this.say(
						`${user.name}'s currency : **${currency.get(user)}**`
					);
				}
			}
		},
		aliases: ["money", "m", "amibroke"],
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},

	richpeople: {
		command(target, room, user) {
			if (!user.hasRank(room, "+") && !user.isDeveloper())
				return user.say("Access Denied");
			let db = currency.db;
			let usersData = {};

			function sortObj(obj, n) {
				return Object.entries(obj)
					.sort((a, b) => b[1] - a[1])
					.map((el) => el[0])
					.slice(0, n > obj.length ? obj.length : n);
			}

			Object.keys(db).forEach((key: any) => {
				console.log(key);
				if (key != "logs") usersData[key] = db[key].total;
			});

			console.log(usersData);
			let tt = parseInt(target) ? parseInt(target) : 10;
			let sorted = sortObj(usersData, tt);

			let html = `<table style="border-collapse: collapse; border-spacing: 0; border-color: #aaa"> <colgroup> <col style="width: 40px" /><col style="width: 160px" />  <col style="width: 150px" /> </colgroup> <tbody>`;
			html += `<tr> <th style=" font-family: 'arial', sans-serif; font-size: 14px; font-weight: normal; padding: 2px 5px; border-style: solid; border-width: 1px; overflow: hidden; word-break: normal; border-color: #aaa; color: #fff; background-color: #5a0b72; font-weight: bold; border-color: inherit; text-align: center; vertical-align: top; " > Rank </th> <th style=" font-family: 'arial', sans-serif; font-size: 14px; font-weight: normal; padding: 2px 5px; border-style: solid; border-width: 1px; overflow: hidden; word-break: normal; border-color: #aaa; color: #fff; background-color: #5a0b72; font-weight: bold; border-color: inherit; text-align: center; vertical-align: top; " > Name </th> <th style=" font-family: 'arial', sans-serif; font-size: 14px; font-weight: normal; padding: 2px 5px; border-style: solid; border-width: 1px; overflow: hidden; word-break: normal; border-color: #aaa; color: #fff; background-color: #5a0b72; font-weight: bold; border-color: inherit; text-align: center; vertical-align: top; " > ${currency.name} </th> </tr>`;
			sorted.forEach((id, j) => {
				let i = j + 1;
				let name = Users.get(id) ? Users.get(id).name : id;
				let total = usersData[id];

				if (j % 2 == 0)
					html += `<tr> <td style=" font-family: 'arial', sans-serif; padding: 2px; border-style: solid; border-width: 1px; overflow: hidden; word-break: normal; border-color: #aaa; color: #333; background-color: #fff; background-color: #ffffff; border-color: inherit; text-align: center; vertical-align: top; font-weight: bold; " > ${i} </td> <td style=" font-family: 'arial', sans-serif; padding: 2px; border-style: solid; border-width: 1px; overflow: hidden; word-break: normal; border-color: #aaa; color: #333; background-color: #fff; background-color: #ffffff; border-color: inherit; text-align: center; vertical-align: top; font-weight: bold; " > ${name} </td> <td style=" font-family: 'arial', sans-serif; padding: 2px; border-style: solid; border-width: 1px; overflow: hidden; word-break: normal; border-color: #aaa; color: #333; background-color: #fff; background-color: #ffffff; border-color: inherit; text-align: center; vertical-align: top; font-weight: bold; " > ${total} </td> </tr>`;
				if (j % 2 !== 0)
					html += `<tr> <td style=" font-family: 'arial', sans-serif; padding: 2px; border-style: solid; border-width: 1px; overflow: hidden; word-break: normal; border-color: #aaa; color: #333; background-color: #fff; background-color: #cccccc; border-color: inherit; text-align: center; vertical-align: top; font-weight: bold; " > ${i} </td> <td style=" font-family: 'arial', sans-serif; padding: 2px; border-style: solid; border-width: 1px; overflow: hidden; word-break: normal; border-color: #aaa; color: #333; background-color: #fff; background-color: #cccccc; border-color: inherit; text-align: center; vertical-align: top; font-weight: bold; " > ${name} </td> <td style=" font-family: 'arial', sans-serif; padding: 2px; border-style: solid; border-width: 1px; overflow: hidden; word-break: normal; border-color: #aaa; color: #333; background-color: #fff; background-color: #cccccc; border-color: inherit; text-align: center; vertical-align: top; font-weight: bold; " > ${total} </td> </tr>`;
			});

			html += `</tbody></table>`;

			room.sayHtml(html);
		},
		aliases: ["rplb"],
	},
};
