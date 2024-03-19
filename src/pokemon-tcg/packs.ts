/* eslint-disable @typescript-eslint/array-type */
import * as fetch2 from "node-fetch";
import { RequestInfo, RequestInit } from "node-fetch";

global.fetch = (url: RequestInfo, init?: RequestInit) =>
	import("node-fetch").then(({ default: fetch2 }) => fetch2(url, init));

import pokemon from "pokemontcgsdk";

import * as fs from "fs";
import { User } from "../users";
import path = require("path");

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
pokemon.configure({ apiKey: "211cfd2c-7f19-49de-a9f1-9945ad4a7215" });

class Packs {
	private rarities: Array<string>;
	private slot1: Record<string, number>;
	private slot2: Record<string, number>;
	private dir: string;
	daily: any;
	private collection: any;

	constructor() {
		this.rarities = [
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
		this.slot1 = {
			"rarity:rare rarity:holo -rarity:v -rarity:ex -rarity:gx -rarity:vmax -rarity:ultra": 16,
			"rarity:prism rarity:star": 16,
			"rarity:amazing rarity:rare": 8,
		};
		this.slot2 = {
			"!rarity:rare": 32,
			"rarity:rare rarity:holo -rarity:v -rarity:ex -rarity:gx -rarity:vmax -rarity:ultra": 8,
			"rarity:rare rarity:holo rarity:v -rarity:ex -rarity:gx -rarity:vmax -rarity:ultra": 16,
			"rarity:rare rarity:holo rairty:ex -rarity:gx -rarity:vmax -rarity:ultra": 16,
			"rarity:rare rarity:holo rarity:gx -rarity:vmax -rarity:ultra": 8,
			"rarity:rare rarity:holo rarity:vmax -rarity:ultra": 8,
			"rarity:rare rarity:shiny": 4,
			"rarity:rare rarity:ultra": 2,
			"rarity:rare rarity:secret": 2,
		};

		this.dir = path.join(Tools.rootFolder, "databases");

		if (!fs.existsSync(this.dir + "daily.json")) {
			fs.writeFileSync(this.dir + "daily.json", JSON.stringify({}));
		}

		if (!fs.existsSync(this.dir + "collection.json")) {
			fs.writeFileSync(this.dir + "collection.json", JSON.stringify({}));
		}

		this.daily = JSON.parse(
			fs.readFileSync(this.dir + "/daily.json").toString()
		);
		this.collection = JSON.parse(
			fs.readFileSync(this.dir + "/collection.json").toString()
		);

		this.sortCollections();
	}

	getSlots(): Array<string> {
		let odds1: Array<string> = [];
		let odds2: Array<string> = [];
		Object.keys(this.slot1).forEach((rare: string) => {
			for (let i = 0; i < this.slot1[rare]; i++) {
				odds1.push(rare);
			}
		});

		Object.keys(this.slot2).forEach((rare: string) => {
			for (let i = 0; i < this.slot1[rare]; i++) {
				odds2.push(rare);
			}
		});

		let slot1: string = Tools.sampleOne(odds1);
		let slot2: string = Tools.sampleOne(odds2);

		return [slot1, slot2];
	}

	async randomPack(id: string, source?: string) {
		let slots = this.getSlots();

		let slot1 = slots[0];
		let slot2 = slots[1];

		let slot1Card;
		let slot2Card;
		let slot3Card;

		let cards = [];

		console.log(id);

		let rs1 = await pokemon.card.all({ q: `set.id:${id} ${slot1}` });
		//	if(!rs1.length) rs1 = await pokemon.card.all({ q: `set.id:${id} !rarity:rare` });
		if (!rs1.length)
			rs1 = await pokemon.card.all({ q: `set.id:${id} rarity:rare` });

		console.log(rs1);
		let aa = Tools.sampleMany(rs1, 2);
		slot1Card = aa[1];
		slot3Card = aa[0];

		let c6 = {
			id: slot1Card.id,
			name: slot1Card.name,
			image: slot1Card.images.small,
			large: slot1Card.images.large,
			rarity: slot1Card.rarity,
		};

		let rs2 = await pokemon.card.all({ q: `set.id:${id} ${slot2}` });
		if (!rs2.length) rs2 = rs1;

		console.log(rs2.length);

		let cm = await pokemon.card.all({ q: `set.id:${id} rarity:common` });

		let uncm = await pokemon.card.all({
			q: `set.id:${id} rarity:uncommon`,
		});

		let en = await pokemon.card.all({
			q: `set.id:${id} supertype:energy subtypes:basic`,
		});

		if (!en.length)
			en = await pokemon.card.all({
				q: `set.id:${"sm1"} supertype:energy -name:Fairy subtypes:basic`,
			});

		console.log(en.length);
		Tools.sampleMany(cm, 4).forEach((a, i) => {
			cards[i] = {
				id: a.id,
				name: a.name,
				image: a.images.small,
				large: a.images.large,
				rarity: a.rarity,
			};
		});

		Tools.sampleMany(uncm, 3).forEach((a, i) => {
			cards[8 + i] = {
				id: a.id,
				name: a.name,
				image: a.images.small,
				large: a.images.large,
				rarity: a.rarity,
			};
		});

		let enO = Tools.sampleOne(en);
		let c8 = {
			id: enO.id,
			name: enO.name,
			image: enO.images.small,
			large: enO.images.large,
			rarity: enO.rarity,
		};

		console.log(slot2);
		slot2Card = Tools.sampleOne(rs2);

		let c7 = {
			id: slot2Card.id,
			name: slot2Card.name,
			image: slot2Card.images.small,
			large: slot2Card.images.large,
			rarity: slot2Card.rarity,
		};

		let c5 = {
			id: slot3Card.id,
			name: slot3Card.name,
			image: slot3Card.images.small,
			large: slot3Card.images.large,
			rarity: slot3Card.rarity,
		};

		cards[4] = c5;
		cards[5] = c6;
		cards[6] = c7;
		cards[7] = c8;

		let finalPack: any = {};

		let set = await pokemon.set.find(id);

		finalPack.name = set.name;
		finalPack.image = set.images.logo;
		finalPack.opened = new Date();
		finalPack.cards = cards;
		finalPack.openedOn = new Date();
		finalPack.source = source ? source : "daily";

		console.log(finalPack.cards.length);
		return finalPack;
	}

	getDatabase(id: string) {
		return this[id];
	}

	updateDatabase(id: string) {
		if (!this[id]) return;
		fs.writeFileSync(`${this.dir}/${id}.json`, JSON.stringify(this[id]));
	}

	addPack(user: User, pack: any) {
		let db = this.collection;
		if (!db[user.id]) {
			db[user.id] = { cards: [], packsOpened: [] };
		}

		pack.cards.forEach((card) => {
			let i = db[user.id].cards.indexOf(card);
			if (i < 0) db[user.id].cards.push(card);
			if (i > -1) {
				if (!db[user.id].cards[i].count) db[user.id].cards[i].count = 1;
				db[user.id].cards[i].count += 1;
			}
		});
		db[user.id].packsOpened.push(pack);

		this.updateDatabase("collection");
	}

	canOpenDaily(user: User) {
		let db = this.daily;
		let ms24hr = 60 * 60 * 24 * 1000;
		if (db[user.id]) {
			let expireTime = db[user.id] + ms24hr;
			let now = new Date().getTime();

			if (!(now >= expireTime)) return expireTime - now;
		}
		return true;
	}

	async openDaily(user: User, packid: any, source?: string) {
		let db = this.daily;
		let ms24hr = 60 * 60 * 24 * 1000;

		if (source) {
			let pack = await this.randomPack(packid, source);
			this.addPack(user, pack);
			return pack;
		}

		if (db[user.id]) {
			let expireTime = db[user.id] + ms24hr;
			let now = new Date().getTime();

			if (!(now >= expireTime)) return expireTime - now;
			db[user.id] = new Date().getTime();
			let pack = await this.randomPack(packid);
			this.addPack(user, pack);
			this.updateDatabase("daily");
			return pack;
		} else {
			db[user.id] = new Date().getTime();
			let pack = await this.randomPack(packid);
			this.addPack(user, pack);
			this.updateDatabase("daily");
			return pack;
		}
	}

	sortCollections() {
		Object.keys(this.collection).forEach((p) => {
			let sortCards = [];
			let cards = this.collection[p].cards;

			let nc = [];

			if (cards) {
				cards.forEach((card) => {
					let i = sortCards.indexOf(card.id);
					console.log(i);
					if (i < 0) {
						sortCards.push(card.id);
						card.count = 1;
						nc.push(card);
					}
					if (i > -1) {
						if (!nc[i].count) nc[i].count = 0;
						nc[i].count += 1;
					}
				});
			}
			this.collection[p].cards = nc;
		});
		this.updateDatabase("collection");
	}
}

export let packs = new Packs();
