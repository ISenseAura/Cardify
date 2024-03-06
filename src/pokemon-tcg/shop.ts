import * as fs from "fs";
import { User } from "../users";
import path = require("path");
import { Path } from "typescript";

import { Packs } from "./packs";
import { Room } from "../rooms";

export type ItemType = "pack" | "deck" | "free";

export class ShopItem {
	name: string;
	description?: string;
	image?: string;
	price: number;
	id: string;
	type: ItemType;
	updatedOn: Date;
	private addBy: string;
	private payTo: string;

	constructor(
		name: string,
		type: ItemType,
		price: number,
		addedBy: string,
		payTo?: string
	) {
		this.name = name;
		this.type = type;
		this.addBy = addedBy;
		this.payTo = payTo ? payTo : "cardify";
		this.price = price;

		this.id = Tools.toId(name + type);
		this.updatedOn = new Date();
	}

	public setDescription(d: string) {
		if (d.length > 230) return "Too long description";
		this.description = d;
	}
	public setImage(d: string) {
		this.image = d;
	}

	public setName(d: string) {
		this.name = d;
		this.id = Tools.toId(this.name + this.type);
	}

	public setPrice(d: number) {
		this.price = d;
	}
}

class Shop {
	private name: string;
	private updatedOn: Date;
	private latestItem?: ShopItem;

	 decks: Record<string, ShopItem>;
	 packs: Record<string, ShopItem>;
	 free: Record<string, ShopItem>;

	room: Room | undefined;

	dir: string;
	db: string;

	constructor() {
		this.name = "TCG Room Shop";
		this.updatedOn = new Date();

		this.decks = {};
		this.packs = {};
		this.free = {};

		this.dir = path.join(Tools.rootFolder, "databases");
		this.db = this.dir + "/shop.json";

		if (!fs.existsSync(this.dir + "/shop.json"))
			fs.writeFileSync(
				this.dir + "/shop.json",
				JSON.stringify({ decks: {}, packs: {}, free: {} })
			);
		this.decks = JSON.parse(fs.readFileSync(this.db).toString()).decks;
		this.packs = JSON.parse(fs.readFileSync(this.db).toString()).packs;
		this.free = JSON.parse(fs.readFileSync(this.db).toString()).free;

		this.room = Rooms.get("tcgtabletop");
	}

	addItem(
		user: User,
		name: any,
		type: ItemType,
		description: string,
		price: number,
		image?: string,
		payTo?: string
	) {
		let id = Tools.toId(name + type);

		let item = null;

		switch (type) {
			case "pack":
				{
					if (this.packs[id]) return "Cannot add duplicate item";
					item = new ShopItem(name, type, price, user.id);
					if (image && image.length > 5) item.setImage(image);
                    item.setDescription(description)

					this.packs[id] = item;

					this.updateDB();
					return "Successfully added pack : " + name;
				}
				break;

			case "deck":
				{
					if (this.decks[id]) return "Cannot add duplicate item";
					item = new ShopItem(name, type, price, user.id, payTo);
                    item.setDescription(description)
					if (image && image.length > 5) item.setImage(image);
					this.decks[id] = item;

					this.updateDB();
					return "Successfully added deck : " + name;
				}

				break;

			case "free":
				{
					if (this.free[id]) return "Cannot add duplicate item";
					item = new ShopItem(name, type, price, user.id);
					if (image && image.length > 5) item.setImage(image);
                    item.setDescription(description)

					this.free[id] = item;

					this.updateDB();
					return "Successfully added free item : " + name;
				}

				break;

			default:
				return "Invalid item type (Valid types : deck, pack, free)";
		}
	}

	getItem(name: string, type: ItemType) {
		if (type == "deck") return this.decks[Tools.toId(name + type)];
		if (type == "pack") return this.packs[Tools.toId(name + type)];

		if (type == "free") return this.free[Tools.toId(name + type)];
	}

	buyItem(user: User, name: string, type: ItemType) {
		let item = this.getItem(name, type);
		if (!item) return "Item not found";


		if (Tools.toId(item.name) == "daily") {
			let packs = new Packs();

   

			let dt = packs.canOpenDaily(user);
			if (dt > 1) {
                console.log("test2");

				 this.room?.sayPrivateHtml(user,`You have already claimed your daily, reseting in ${Tools.toDurationString(
					dt
				)}`);
                return;
			}
     


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
                    this.room?.sayHtml(`<small style="font-size:11px;">[TCG Shop] </small><username> ${user.name} </username> claimed their daily pack `)
					this.room?.sayHtml(html);
					return data;
				})
				.catch((e: any) => {
					Users.get("pokem9n")?.say(e.message);
					return this.room?.sayPrivateHtml(user,"<small style='font-size:11px;'>[TCG Shop] </small> Could not find a pack for you, maybe try again coz you definitely deserve a free pack!");
				});
		}
	}

	updateDB() {
		let data: any = {};

		data.decks = this.decks;
		data.packs = this.packs;
		data.free = this.free;

		this.updatedOn = new Date();

		fs.writeFileSync(this.db, JSON.stringify(data));
	}
}

export let shop = new Shop();
