/* eslint-disable max-len */
import { info } from "console";
import type { Room } from "../rooms";
import type { BaseCommandDefinitions } from "../types/command-parser";
import type { User } from "../users";
import { Pagination } from "./components/pagination";
import type { IPageElement } from "./components/pagination";
import { CLOSE_COMMAND, HtmlPageBase } from "./html-page-base";

import { shop } from "../pokemon-tcg/shop";

import { Packs } from "../pokemon-tcg/packs";

let packs = new Packs();

const baseCommand = "tcg";
const chooseIntro = "chooseintro";
const chooseDeckBuilder = "choosedeckbuilder";
const chooseFormats = "chooseformats";
const chooseLadder = "chooseladder";
const chooseSets = "choosesets";
const chooseShop = "chooseshop";
const chooseCollection = "choosecards";
const collectionPageCommand = "collectionpage";

// Shop handlers

const chooseDeckShop = "choosedeckshop";
const choosePackShop = "choosepackshop";
const chooseFreeShop = "choosefreeshop";
const buyItem = "buyitem";

export const pageId = "tcg-manager";
export const pages: Dict<TCGManager> = {};

class TCGManager extends HtmlPageBase {
	pageId = pageId;
	currentView:
		| "intro"
		| "deckbuilder"
		| "formats"
		| "ladder"
		| "shop"
		| "collection";

	showDeveloperCommands: boolean;
	collectionPagination!: Pagination;

	currentShopView: "deck" | "pack" | "free";

	constructor(room: Room, user: User) {
		super(room, user, baseCommand, pages);

		this.commandPrefix = Config.commandCharacter + baseCommand;
		this.setCloseButtonHtml();

		this.showDeveloperCommands = user.isDeveloper();
		this.collectionPagination = new Pagination(
			this,
			this.commandPrefix,
			collectionPageCommand,
			{
				elements: [],
				elementsPerRow: 2,
				rowsPerPage: 8,
				pagesLabel: "Collection",
				noElementsLabel: "No more cards to list",
				hideSinglePageNavigation: true,
				onSelectPage: () => this.send(),
				reRender: () => this.send(),
			}
		);

		this.currentView = "intro";

		this.currentShopView = "free";

		this.components = [this.collectionPagination];

		this.setCollectionList(true);
	}

	/* @Main-Page-Handlers */

	chooseIntro(): void {
		if (this.currentView === "intro") return;

		this.currentView = "intro";
		this.setCollectionList();

		this.send();
	}

	chooseDeckBuilder(): void {
		if (this.currentView === "deckbuilder") return;

		this.currentView = "deckbuilder";
		this.setCollectionList();

		this.send();
	}

	chooseFormats(): void {
		if (this.currentView === "formats") return;

		this.currentView = "formats";
		this.setCollectionList();

		this.send();
	}

	chooseCollection(): void {
		if (this.currentView === "collection") return;

		this.currentView = "collection";
		this.setCollectionList();

		this.send();
	}

	chooseShop(): void {
		if (this.currentView === "shop") return;

		this.currentView = "shop";
		this.setCollectionList();

		this.send();
	}

	chooseLadder(): void {
		if (this.currentView === "ladder") return;

		this.currentView = "ladder";
		this.setCollectionList();

		this.send();
	}

	/* @My-Collection-Handlers */

	setCollectionList(onOpen?: boolean): void {
		let collection = packs.getDatabase("collection")[this.userId];
		if (!collection) return;
		let cards = collection.cards;
		let cardsHtml = "";
		const elements: IPageElement[] = [];

		for (let i = 0; i < cards.length; i++) {
			let html = `<li style=" background: url('${cards[i].large}') center/contain no-repeat; height: 290px; width: 290px; display: inline-block; margin: 0 0; " ></li>`;

			elements.push({ html: html });
		}

		this.collectionPagination.updateElements(elements, onOpen);
	}

	/* @Shop-Handlers */

	chooseDeckShop() {
		this.currentShopView = "deck";
		this.send();
	}

	choosePackShop() {
		this.currentShopView = "pack";
		this.send();
	}

	chooseFreeShop() {
		this.currentShopView = "free";
		this.send();
	}

	buyItem(user: User, name: string, type: string) {
		shop.buyItem(user, name, type);
		this.send();
	}

	render(): string {
		let html =
			"<div class='chat' style='margin-top: 4px;margin-left: 4px'><center><b> <i> Cardify's </i> </b> <br> <strong style='font-size:16px;'> Pokemon TCG Simulator </strong>";

		html += "<br /><br />";

		const introView = this.currentView === "intro";
		const deckbuilderview = this.currentView === "deckbuilder";
		const ladderview = this.currentView === "ladder";
		const cardsview = this.currentView === "collection";
		const shopview = this.currentView === "shop";
		const formatsview = this.currentView === "formats";

		html +=
			"&nbsp;" +
			this.getQuietPmButton(
				this.commandPrefix + ", " + chooseIntro,
				"Guide & Updates",
				{ selectedAndDisabled: introView }
			);

		html +=
			"&nbsp;" +
			this.getQuietPmButton(
				this.commandPrefix + ", " + chooseCollection,
				"My Collection",
				{ selectedAndDisabled: cardsview }
			);
		html +=
			"&nbsp;" +
			this.getQuietPmButton(
				this.commandPrefix + ", " + chooseShop,
				"Shop",
				{ selectedAndDisabled: shopview }
			);
		html +=
			"&nbsp;" +
			this.getQuietPmButton(
				this.commandPrefix + ", " + chooseLadder,
				"Ladder",
				{ selectedAndDisabled: ladderview }
			);

		html +=
			"&nbsp;" +
			this.getQuietPmButton(
				this.commandPrefix + ", " + chooseDeckBuilder,
				"Deck Builder",
				{ selectedAndDisabled: deckbuilderview }
			);
		html +=
			"&nbsp;" +
			this.getQuietPmButton(
				this.commandPrefix + ", " + chooseFormats,
				"Formats",
				{ selectedAndDisabled: formatsview }
			);
		html += "</center>";

		html += "<hr/>";

		html += "<div style='padding:10px;font-size:13px;'>";

		html +=
			"<i style='font-size:12px;margin-bottom:8px;'>  You can always PM Cardify <code> .tcg</code>  to view this page </i> <br>";

		switch (this.currentView) {
			case "intro":
				{
					html += `<br><strong style='font-size:16px;'>Bot Introduction </strong> <br> <br>`;
					html += `<div style='margin-left:10px;'>`;
					html += `Cardify is a bot developed for the <a href="/tcgtabletop"> TCG & Tabletop </a> room by <span class="username"> <username> Pokem9n </username></span> (a.k.a P9). The bot will be responsible for simulating Pokemon TCG in the chatroom, managing cards, ladders and more! <br><br> As this is the initial phase of the bot, most of the features mentioned are not done implementing, We are working on it and we will notify you in the chatroom when new features are added. <br>`;
					html += `</div>`;

					html += `<br><strong style='font-size:16px;'> Features </strong> <br> <br>`;
					html += `<div style='margin-left:10px;'>`;
					html += `The main feature of this bot, that is the TCG Simulator is gonna take a while to be available for beta testing. We might release the beta version on 22nd March but we dont promise anything. <br><br> The Shop, Ladder, Deck Builder and Formats will be implemented after the simulator is live. Our first priority is to launch the TCG Simulator ASAP. <br><br> As of now, The bot currently has a few helpful and fun commands that are listed below - <br><br>`;
					html += `<div style='margin-left:14px;line-height:21px;'>`;
					html += `<code>.rcard</code> Shows a random pokemon card (Requires : +,%,@,#) <br>`;
					html += `<code>.gdeck QUERY</code> generates a sample deck based on your query (Requires : +,%,@,#) <br>`;

					html += `</div>`;
					html += `</div>`;
				}
				break;

			case "collection":
				{
					html += `<br><div style=" border:1px solid skyblue; padding:6px; background-color: #282a45; color: white; font-family: Arial, sans-serif; padding: 2px 0; text-align: left; " > <div style=" margin: 0 auto; text-align: center; line-height: 0; vertical-align: middle; " > <h3 style=" margin-left: 4px; margin-top: 10px; margin-bottom: 10px; background-color: #282a45; display: inline-block; " >  </h3> </div>`;

					let collection =
						packs.getDatabase("collection")[this.userId];
					if (!collection) {
						html += `<br> <i> <strong> You currently have no cards... </strong> </i>`;
					} else {
						//end components
						html += `  <ul style="margin: 3px; padding: 0; display: table">`;
						html += this.collectionPagination.render();

						html += `</ul><br>`;
					}
					html += `</div>`;
				}

				break;

			case "shop":
				{
					html +=
						"<br> Your Balance : <strong> 0.00 <i><small> haha you poor :P </small></i> </strong> <br> <br>";

					let deckView = this.currentShopView == "deck";
					let packView = this.currentShopView == "pack";
					let freeView = this.currentShopView == "free";

					html +=
						"&nbsp;" +
						this.getQuietPmButton(
							this.commandPrefix + ", " + chooseDeckShop,
							"Decks",
							{ selectedAndDisabled: deckView }
						);

					html +=
						"&nbsp;" +
						this.getQuietPmButton(
							this.commandPrefix + ", " + choosePackShop,
							"Packs",
							{ selectedAndDisabled: packView }
						);

					html +=
						"&nbsp;" +
						this.getQuietPmButton(
							this.commandPrefix + ", " + chooseFreeShop,
							"Free Items",
							{ selectedAndDisabled: freeView }
						);

					html += `<br><div style=" border:1px solid skyblue; padding:6px; background-color: #282a45; color: white; font-family: Arial, sans-serif; padding: 2px 0; text-align: left; " >`;

					html += `<table border="1" style="border-collapse: collapse" cellpadding="10">`;
					html += `<tbody> <tr> <th>Item</th> <th>Description</th> <th>Cost</th> <th></th> </tr>`;

					switch (this.currentShopView) {
						case "free":
							{
								let items = shop.free;
								let keys = Object.keys(items);
								keys.forEach((key) => {
									let item = items[key];
									console.log(packs.canOpenDaily(Users.get(this.userId)))
									html += `<tr><td> ${item.name} </td> <td> ${item.description} </td> <td> ${item.price} </td>`;
									html +=
										"<td>" + ( packs.canOpenDaily(Users.get(this.userId)) === true ? this.getQuietPmButton(
											this.commandPrefix +
												", " +
												buyItem +
												"," +
												item.name +
												"|" +
												item.type,
											"Claim"
										) +
										"</td></tr>" : "Claimed");
								});
							}
							break;

						default:
							html += `<h2> No items yet! </h2>`;
					}
					html += `</tbody></table>`;
					html += "</div>";
				}

				break;

			default: {
				html += "<br> <h2><i> Coming soon..! </i> </h2> ";
			}
		}

		html += "</div>";

		html += "</div>";
		return html;
	}
}

export const commands: BaseCommandDefinitions = {
	["tcg"]: {
		command(target, room, user) {
			if (!this.isPm(room)) return;
			const targets = target.split(",");
			const botRoom = user.getBotRoom();
			if (!botRoom)
				return this.say(CommandParser.getErrorText(["noBotRankRoom"]));

			const cmd = Tools.toId(targets[0]);
			targets.shift();

			if (!cmd) {
				new TCGManager(botRoom, user).open();
				return;
			}

			if (!(user.id in pages) && cmd !== CLOSE_COMMAND)
				new TCGManager(botRoom, user);

			if (cmd === chooseIntro) {
				pages[user.id].chooseIntro();
			} else if (cmd === chooseCollection) {
				pages[user.id].chooseCollection();
			} else if (cmd === chooseDeckBuilder) {
				pages[user.id].chooseDeckBuilder();
			} else if (cmd === chooseFormats) {
				pages[user.id].chooseFormats();
			} else if (cmd === chooseLadder) {
				pages[user.id].chooseLadder();
			} else if (cmd === chooseShop) {
				pages[user.id].chooseShop();
			} else if (cmd === chooseDeckShop) {
				pages[user.id].chooseDeckShop();
			} else if (cmd === choosePackShop) {
				pages[user.id].choosePackShop();
			} else if (cmd === chooseFreeShop) {
				pages[user.id].chooseFreeShop();
			} else if (cmd === buyItem) {
				let opts = targets[0].trim().split("|");
				pages[user.id].buyItem(user, opts[0], opts[1]);
			} else if (cmd === CLOSE_COMMAND) {
				if (user.id in pages) pages[user.id].close();
			} else {
				const error = pages[user.id].checkComponentCommands(
					cmd,
					targets
				);
				if (error) this.say(error);
			}
		},
		aliases: [],
	},
};
