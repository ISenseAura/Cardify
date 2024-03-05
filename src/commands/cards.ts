/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import type { BaseCommandDefinitions } from "../types/command-parser";

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fetch2 from "node-fetch";
import { RequestInfo, RequestInit } from "node-fetch";

import { Packs } from "../pokemon-tcg/packs";

global.fetch = (url: RequestInfo, init?: RequestInit) =>
	import("node-fetch").then(({ default: fetch2 }) => fetch2(url, init));

import pokemon from "pokemontcgsdk";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
pokemon.configure({ apiKey: "211cfd2c-7f19-49de-a9f1-9945ad4a7215" });

export async function findCard(id: string): Promise<string> {
	let card: any = await pokemon.card.find(id);
	return card;
}

export async function findSet(id: string): Promise<string> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let set: any = await pokemon.set.find(id);
	return set;
}

export async function getAllSupertypes(): Promise<string> {
	let suptypes: any = await pokemon.supertype.all();
	return suptypes;
}

let pkmnSets: string[] = [
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
	"mcd19",
	"sm12",
	"swshp",
	"swsh1",
	"swsh2",
	"swsh3",
	"swsh35",
	"swsh4",
	"swsh45",

	"swsh5",
	"swsh6",
	"swsh7",
	"cel25",
	"cel25c",
	"mcd14",
	"mcd15",
	"mcd18",
	"mcd17",
	"mcd21",
	"bp",
	"swsh8",
	"fut20",
	"tk1a",
	"tk1b",
	"tk2a",
	"tk2b",
	"swsh9",

	"swsh10",

	"pgo",
	"swsh11",

	"swsh12",

	"mcd22",

	"sv1",
	"svp",
	"sv2",
	"sve",
	"sv3",

	"sv4",
];

let subtypes = [
	"BREAK",
	"Baby",
	"Basic",
	"EX",
	"GX",
	"Goldenrod Game Corner",
	"Item",
	"LEGEND",
	"Level-Up",
	"MEGA",
	"Pokémon Tool",
	"Pokémon Tool F",
	"Rapid Strike",
	"Restored",
	"Rocket's Secret Machine",
	"Single Strike",
	"Special",
	"Stadium",
	"Stage 1",
	"Stage 2",
	"Supporter",
	"TAG TEAM",
	"Technical Machine",
	"V",
	"VMAX",
];

let rarities = [
	"Amazing Rare",
	"Common",
	"LEGEND",
	"Promo",
	"Rare",
	"Rare ACE",
	"Rare BREAK",
	"Rare Holo",
	"Rare Holo EX",
	"Rare Holo GX",
	"Rare Holo LV.X",
	"Rare Holo Star",
	"Rare Holo V",
	"Rare Holo VMAX",
	"Rare Prime",
	"Rare Prism Star",
	"Rare Rainbow",
	"Rare Secret",
	"Rare Shining",
	"Rare Shiny",
	"Rare Shiny GX",
	"Rare Ultra",
	"Uncommon",
];

export const commands: BaseCommandDefinitions = {
	randomcard: {
		command(target, room, user) {
			// eslint-disable-line @typescript-eslint/no-unused-vars

			if (this.isPm()) return this.say("Cannot be used in a PM");
			if (!user.hasRank(room, "+"))
				return room.sayPrivateHtml(
					user,
					"<b style='color:red;'> Access Denied </b> Only roomauth can use this command"
				);
			return room.sayPrivateHtml(
				user,
				"<b style='color:red;'> Access Denied </b> Only roomauth can use this command"
			);
			function a() {
				let randomSet = Tools.sampleOne(pkmnSets);
				let rarity = Tools.toId(Tools.sampleOne(rarities));

				pokemon.set.find(randomSet).then((set) => {
					console.log(set.name); // "Sword & Shield"
					let num = set.id + "-" + Tools.random(set.total);
					pokemon.card
						.find(num)
						.then((card: any) => {
							let html = `<div style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: auto; margin: 0; background-color: #282a45; color: white;"><div style="display: flex; align-items: center; justify-content: center; "><div style="flex-shrink: 0; margin: 5px 10px; overflow: hidden; object-fit: contain; width: 210px; display: flex; justify-content: center; border-radius: 8px; box-shadow: 0 0 10px -5px white, 0 0 10px -2px white; position: relative; "><img width="210" height="230" src="${card.images.small}" alt="Random Image" style="max-width: 300px; border-radius: 8px; overflow: hidden; object-fit: contain; "><div style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index:20;  border-radius: 8px; background-image: linear-gradient(115deg, transparent 20%, rgba(255,255,255, 0.50) 30%, transparent 40%,rgba(207, 137, 240, 0.3) 50%, transparent 60%, rgba(255,255,255, 0.4) 70%,transparent 80%);"></div></div><div style="width: 50%;margin-left:15px;font-size:13px;line-height:17px;padding:8px;"><h2 style="background-color: #282a45;"> ${card.name} </h2><p><b style="color:gray;"><i> Artist : </i> </b> ${card.artist} <br> <b style="color:gray;"><i> Rarity : </i> </b> ${card.rarity}<br> <b style="color:gray;"><i> Found in packs : </i> </b> ${set.name}<br> <b style="color:gray;"><i> From : </i> </b> ${set.series}<br></p></div></div></div>`;
							room.sayHtml(html);
						})
						.catch((e) => {
							a();
						});
				});
			}
			a();
		},
		aliases: ["rcard"],
		developerOnly: true,
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},

	viewcard: {
		command(target, room, user) {
			// eslint-disable-line @typescript-eslint/no-unused-vars

			let tcgroom = Rooms.get("tcgtabletop");

			let html = `<div style="position:relative;margin:auto;"><img src="${target}" width="250" height="350"/></div>`;
			tcgroom?.sayPrivateHtml(user, html);
		},
		aliases: ["vcard"],
		pmOnly: true,
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},

	generatedeck: {
		command(target, room, user) {
			// eslint-disable-line @typescript-eslint/no-unused-vars

			if (this.isPm()) return this.say("Cannot be used in a PM");
			if (!user.hasRank(room, "+"))
				return room.sayPrivateHtml(
					user,
					"<b style='color:red;'> Access Denied </b> Only roomauth can use this command"
				);
			return room.sayPrivateHtml(
				user,
				"<b style='color:red;'> Access Denied </b> Only roomauth can use this command"
			);

			const genAI = new GoogleGenerativeAI(
				"AIzaSyCq28woHJ5ZsOp_M6gvfY962idcuawsYk0"
			);

			let q = `generate a english pokemon tcg deck based on ${target}. provide common JSON with keys pokemon,trainers,energy,strategy,tips`;
			let counter = 0;

			this.say(
				"Generating a deck based on " +
					target +
					"... This may take a while."
			);
			async function run(query, context) {
				const model = genAI.getGenerativeModel({ model: "gemini-pro" });

				if (
					query.toLowerCase().includes("differentiate") ||
					query.toLowerCase().includes("differentiate")
				)
					query += "(10 points table)";
				// const prompt = context ? query + " [Context = " + "computer science" + "]" : query + " [Context = " + "computer science" + "]";
				const result = await model.generateContent(query);
				const response = await result.response;
				const text = response.text();

				if (text.startsWith("```json")) {
					let jst = text
						.replace("```json", "")
						.replace(/(\r\n|\r|\n)/g, "")
						.replace("```", "");
					console.log(jst);
					try {
						let json = JSON.parse(jst);
						let keys = Object.keys(json);
						let html = "<div> ";
						if (
							keys.includes("pokemon") &&
							keys.includes("trainers") &&
							keys.includes("energy") &&
							keys.includes("strategy")
						) {
							html += `<strong> Deck based on ${target} - </strong> <br><br>`;
							html += ` <details><summary> <strong style='font-size:12px;'> Pokemon </strong></summary><ul>`;

							json.pokemon.forEach((card) => {
								html += `<li> ${card.name} - x${
									(card.qty ? card.qty : card.count)
										? card.qty
											? card.qty
											: card.count
										: card.quantity
								} </li>`;
							});
							html += `</ul></details>`;

							html += ` <details><summary> <strong style='font-size:12px;'> Trainers </strong></summary><ul>`;

							json.trainers.forEach((card) => {
								html += `<li> ${card.name} - x${
									(card.qty ? card.qty : card.count)
										? card.qty
											? card.qty
											: card.count
										: card.quantity
								} </li>`;
							});
							html += `</ul></details>`;

							html += ` <details><summary> <strong style='font-size:12px;'> Energies </strong></summary><ul>`;

							json.energy.forEach((card) => {
								html += `<li> ${card.name} - x${
									(card.qty ? card.qty : card.count)
										? card.qty
											? card.qty
											: card.count
										: card.quantity
								} </li>`;
							});

							html += `</ul></details>`;

							html += ` <details><summary> <strong style='font-size:12px;'> Strategy </strong></summary><p> ${json.strategy} </p></details></div>`;

							room.sayHtml(`<div> ${html} </div>`);
							return;
						}
						// room.sayHtml(`<div> ${json} </div>`);
					} catch (e) {
						console.log(e.message);
					}
				} else {
					counter += 1;
					if (counter == 4)
						return this.say(
							"Sorry, The AI is taking too long to generate response."
						);
					run(q);
				}
			}
			run(q);
		},
		aliases: ["gdeck"],
		developerOnly: true,
		syntax: ["[expression]"],
		description: ["evaluates the given expression and displays the result"],
	},

	cardsleaderboard: {
		command(target, room, user) {
			let packs = new Packs();

			let db = packs.getDatabase("collection");
			let usersData = {};

			function sortObj(obj, n) {
				return Object.entries(obj)
					.sort((a, b) => b[1] - a[1])
					.map((el) => el[0])
					.slice(0, n > obj.length ? obj.length : n);
			}

			Object.keys(db).forEach((key: any) => {
				usersData[key] = db[key].cards.length;
			});

			let sorted = sortObj(usersData, 10);

			console.log(sorted);
		},
		aliases: ["clb"],
	},
};
