import pokemon from "pokemontcgsdk";
import { RequestInfo, RequestInit } from "node-fetch";
import * as fetch2 from "node-fetch";
import { User } from "../../users";

import { Players } from "../players";

import * as fs from "fs";
import path = require("path");

global.fetch = (url: RequestInfo, init?: RequestInit) =>
	import("node-fetch").then(({ default: fetch2 }) => fetch2(url, init));

class _Decks {
	standardBlocks: Array<String>;
	db: any;
	dir: string;

	constructor() {
		this.dir = path.join(Tools.rootFolder, "databases") + "/decks.json";
		this.standardBlocks = ["F", "G"];
		if (!fs.existsSync(this.dir))
			fs.writeFileSync(this.dir, JSON.stringify({}));
		this.db = JSON.parse(fs.readFileSync(this.dir).toString());
	}

	async finalise(input: string) {
		if (!input) throw new Error("No input received");
		try {
			let imported = await this.importFrom(input);
			let packed = await this.pack(imported);
			return packed;
		} catch (e) {
			throw e;
		}
	}

	delete(id:string) {
		if(this.db[id]) return;
		let player = Players.get(this.db[id].user);
		if(player) {
			Players.removeDeck(player.id,id);
		}
		delete this.db[id];
		this.update();
	}

	async save(user: User, input: string, name?: string) {
		let player = Players.get(user.id);
		if (!player) player = Players.add(user);
		let finalName = name
			? user.id + "-" + name
			: user.id + "-" + "Deck#" + (player.decks.length + 1);
		let id = Tools.toId(finalName);
		if (this.db[id])
			throw new Error(
				"A deck with similar name already exists, please choose a different name."
			);

		return await this.finalise(input)
			.then((deck) => {
				let info = {
					name: finalName,
					id: id,
					user: user.id,
					deck: deck,
				};
				this.db[id] = info;
				this.update();
				Players.addDeck(user.id,id);
				return this.db[id];
			})
			.catch((e) => {
				
				throw new Error(e);
			});
	}

	get(id:string) {
		return this.db[id];
	}

	async pack(deck: Array<any>) {
		/*
		 * Example array
		 *[{id:"xy1-2", count:2}]
		 *
		 */
		let finalDeck = [];

		for await (let a of deck.cards ? deck.cards : deck) {
			console.log(a)

			let card;
			try {
			card = await pokemon.card.find(a.id);
			} catch (e) {
				try {
				card = await pokemon.card.find(a.id2);
				} catch (e) {
					throw e;
				}
			}

			a.id = card.id;
			if (!card) throw new Error(`Card not found (ID : ${a.id})`);
			card.count = a.count;
			card.ID = card.id; // due to my lazy ass
			card.cardtype =
				card.supertype.charAt(0) == "P"
					? "pokemon"
					: card.supertype.charAt(0) == "E"
					? "energy"
					: "item";
			finalDeck.push(card);
		}
		return finalDeck;
	}

	async importFrom(input: string) {
		let deck: any = { cards: [] };
		let data = input;
		if (input.startsWith("http")) {
			if (!input.includes("raw"))
				input = input.replace(".com/", ".com/raw/");
			let res = await fetch(input);
			data = await res.text();
		}
		let datas = data.split("\n");

		for await (let line of datas) {
			switch (line.trim().charAt(0)) {
				case "P":
				case "p":
					{
						let simpleLine = line;
						let count = parseInt(simpleLine.split("-")[1]);
						if (count < 1)
							throw new Error(
								"Expected more than 1 pokemon card"
							);
						deck.pokemon = count;
					}
					break;

				case "T":
				case "t":
					{
						let simpleLine = line;
						let count = parseInt(simpleLine.split("-")[1]);
						if (count < 1)
							throw new Error(
								"Expected more than 1 trainer card"
							);
						deck.trainer = count;
					}
					break;
				case "E":
				case "e":
					{
						let simpleLine = line;
						let count = parseInt(simpleLine.split("-")[1]);
						if (count < 1)
							throw new Error("Expected more than 1 energy card");
						deck.energy = count;
					}
					break;

				default: {
					let opts = line.split(" ");
					console.log(opts);
					let count = parseInt(opts.shift());
					let num = parseInt(opts.pop());
					let ptcgoCode = opts.pop();
					if (ptcgoCode == "Energy") ptcgoCode = "sum";
					let name = opts.join(" ");
					if (!ptcgoCode.length)
						throw new Error(
							`PTCGO Code not found for ${name}. Please make sure you have included the PTCGO code of the card also. `
						);
					console.log(`${count} - ${num} - ${ptcgoCode}`);

					let set = await pokemon.set.all({
						q: `ptcgoCode:${ptcgoCode?.toLowerCase().trim()}`,
					});
					let cardID = set[0].id + "-" + num;
					let id2 = "";

					if(set[1]) id2 = set[1].id + "-" + num;

					let card = {
						id: cardID,
						id2:id2,
						count: count,
						name: name,
						ptcgoCode: ptcgoCode,
					};
					deck.cards.push(card);
				}
			}
		}

		return deck;
	}

	update() {
		fs.writeFileSync(this.dir, JSON.stringify(this.db));
	}
}

export let Decks = new _Decks();
