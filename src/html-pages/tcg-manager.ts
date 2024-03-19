/* eslint-disable max-len */
import { info } from "console";
import type { Room } from "../rooms";
import type { BaseCommandDefinitions } from "../types/command-parser";
import type { User } from "../users";
import { Pagination } from "./components/pagination";
import type { IPageElement } from "./components/pagination";
import { CLOSE_COMMAND, HtmlPageBase } from "./html-page-base";

import { shop } from "../pokemon-tcg/shop";

import { packs } from "../pokemon-tcg/packs";

import { currency } from "../pokemon-tcg/currency";

import { Players } from "../pokemon-tcg/players";
import { ITextInputValidation, TextInput } from "./components/text-input";
import { Decks } from "../pokemon-tcg/simulator/decks";
import { Battles } from "../pokemon-tcg/simulator/battle";

const baseCommand = "tcg";
const chooseIntro = "chooseintro";
const chooseDeckBuilder = "choosedeckbuilder";
const choosePlay = "chooseplay";
const chooseLadder = "chooseladder";
const chooseSets = "choosesets";
const chooseShop = "chooseshop";
const chooseCollection = "choosecards";
const collectionPageCommand = "collectionpage";

// Shop commands

const chooseDeckShop = "choosedeckshop";
const choosePackShop = "choosepackshop";
const chooseFreeShop = "choosefreeshop";
const buyItem = "buyitem";

// Deck commands

const importDeckInputCommand = "importdeck";
const searchUserForChallengeCommand = "searchuser";

// Play commands
const chooseDeckForBattle = "choosedeckforbattle";
const chooseFormatForBattle = "chooseformatforbattle";
const chooseFriendlyBattle = "choosefriendlybattle";
const chooseRankBattle = "chooserankbattle";
const challengeUserCmd = "challengeuser"

export const pageId = "tcg-manager";
export const pages: Dict<TCGManager> = {};

export class TCGManager extends HtmlPageBase {
	pageId = pageId;
	currentView:
		| "intro"
		| "deckbuilder"
		| "play"
		| "ladder"
		| "shop"
		| "collection";

	showDeveloperCommands: boolean;
	collectionPagination!: Pagination;

	erroMsg: string | boolean;

	currentShopView: "deck" | "pack" | "free";

	importDeckInput: TextInput<string>;
	importDeckNameInput: TextInput<string>;
	importDeckName?: string;
	deckImportingStatus: string | boolean;
	currentPlayView: string;
	selectedFormat: string;
	selectedDeck: string;
	challengeTo: string;
	isChallenging:boolean;
	searchUserForChallenge: TextInput<string>;

	constructor(room: Room, user: User) {
		super(room, user, baseCommand, pages);

		this.commandPrefix = Config.commandCharacter + baseCommand;
		this.setCloseButtonHtml();

		this.erroMsg = false;

		this.showDeveloperCommands = user.isDeveloper();
		this.collectionPagination = new Pagination(
			this,
			this.commandPrefix,
			collectionPageCommand,
			{
				elements: [],
				elementsPerRow: 2,
				rowsPerPage: 10,
				pagesLabel: "Collection",
				noElementsLabel: "No more cards to list",
				hideSinglePageNavigation: true,
				onSelectPage: () => this.send(),
				reRender: () => this.send(),
			}
		);

		this.importDeckInput = new TextInput(
			this,
			this.commandPrefix,
			importDeckInputCommand,
			{
				label: "Add pastebin link",
				name: "Add Pastebin Link",
				validateSubmission: (input): ITextInputValidation => {
					if (!input.startsWith("http")) {
						return {
							errors: [`${input} is not a valid pastebin link`],
						};
					}
					return { currentOutput: input };
				},
				onClear: () => this.clearImportDeckInput(),
				onSubmit: (output) => this.setImportDeckInput(output),
				reRender: () => this.send(),
			}
		);

		this.importDeckNameInput = new TextInput(
			this,
			this.commandPrefix,
			importDeckInputCommand,
			{
				label: "Set deck name",
				name: "Set deck name",
				validateSubmission: (input): ITextInputValidation => {
					if (!input) {
						return {
							errors: [
								`Please provide an unique name for the deck.`,
							],
						};
					}
					return { currentOutput: input };
				},
				onClear: () => this.clearImportDeckName(),
				onSubmit: (output) => this.setImportDeckName(output),
				reRender: () => this.send(),
			}
		);

		this.deckImportingStatus = false;

		this.currentView = "intro";

		this.currentShopView = "free";

		this.setCollectionList(true);

		this.searchUserForChallenge = new TextInput(
			this,
			this.commandPrefix,
			searchUserForChallengeCommand,
			{
				label: "Search User",
				name: "Search User",
				validateSubmission: (input): ITextInputValidation => {
					if (!input) {
						return { errors: [`Please provide a username`] };
					}
					if (!Users.get(Tools.toId(input)))
						return { errors: [`User not found`] };
					if (
						!Rooms.get("tcgtabletop")?.canSendToUser(
							Users.get(Tools.toId(input))
						)
					)
						return {
							errors: [`Target user is not in the TCG room`],
						};

					return { currentOutput: input };
				},
				onClear: () => this.setUserForChallenge(""),
				onSubmit: (output) => this.setUserForChallenge(output),
				reRender: () => this.send(),
			}
		);

		this.challengeTo = "";
		this.currentPlayView = "friendlybattleview";
		this.selectedFormat = "";
		this.selectedDeck = "";
		this.isChallenging = false;

		this.components = [
			this.collectionPagination,
			this.importDeckInput,
			this.importDeckNameInput,
			this.searchUserForChallenge,
		];
		Players.add(user);
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

	choosePlay(): void {
		if (this.currentView === "play") return;

		this.currentView = "play";
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
			let html = `<li style=" background: url('${cards[i].large}') center/contain no-repeat; height: 290px; width: 290px; display: inline-block; margin: 0 0; " > <span style="background:black;border:2px solid white; color:white;border-radius:20px; padding:10px;position:relative;top:0px;left:0px;"> x${cards[i].count} </span> </li>`;

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

	/* @Deck-Handlers */

	setImportDeckInput(input: string) {
		this.deckImportingStatus = "Importing Deck...";
		console.log(input);
		this.send();
		Decks.save(Users.get(this.userId), input, this.importDeckName)
			.then((data) => {
				this.deckImportingStatus = false;
				this.send();
			})
			.catch((e) => {
				console.log(e);
				this.deckImportingStatus = e.message;
				this.send();
			});
	}

	clearImportDeckInput() {
		this.deckImportingStatus = false;
		this.importDeckName = "";
		this.render();
	}

	setImportDeckName(input: string) {
		this.importDeckName = input;
	}

	clearImportDeckName() {
		this.clearImportDeckInput();
	}

	// @Play-Hanlders

	chooseFriendlyBattle() {
		this.currentPlayView = "friendlybattleview";
		this.send();
	}

	chooseRankBattle() {
		this.currentPlayView = "rankbattleview";
		this.send();
	}

	chooseDeckForBattle(id:string) {
		if(!Decks.get(id)) throw new Error("Deck does not exist in DB : " + id);
		this.selectedDeck = id;
		this.send()
	}

	chooseFormatForBattle(id:string) {
		//if(!Decks.get(id)) throw new Error("Deck does not exist in DB : " + id);
		this.selectedFormat = id;
		this.send();
	}

	setUserForChallenge(input: string) {

		if(input.trim() == "cancel") {

			Battles.cancelChallenge(Users.get(this.userId),Users.get(this.challengeTo));

			this.challengeTo = "";
			this.selectedDeck = "";
			this.selectedFormat = ""
			this.isChallenging = false;

			this.send();
			return;
		}

		if (input.trim() == "") {
			this.challengeTo = Tools.toId(input);
			this.selectedDeck = "";
			this.selectedFormat = ""
			this.isChallenging = false;
		
			this.send();
			return;
		}
		if (!Users.get(Tools.toId(input))) return;
		if (
			!Rooms.get("tcgtabletop")?.canSendToUser(
				Users.get(Tools.toId(input))
			)
		)
			return;
		this.challengeTo = Tools.toId(input);
		this.erroMsg = "";
		this.send();
	}

	rejectChallenge(to:string) {
		this.erroMsg = "Challenge was rejected";
		this.setUserForChallenge("")
	}

	challengeUser() {
		let from = Users.get(this.userId);
		let to = Users.get(this.challengeTo);
		//console.log(to);
		try {
		let a = Battles.challenge(from,to,this.selectedFormat,this.selectedDeck,pages[from.id]);
		if(a) {
			this.isChallenging =  true;
			this.send();
		}
		}
		catch(e) {
			this.erroMsg = e.message;
			this.send();
		}
	}

	render(): string {
		let html =
			"<div class='chat' style='margin-top: 4px;margin-left: 4px;background-image: linear-gradient(rgba(255 , 255 , 255 , 0) , rgba(90 , 120 , 160 , 1));height:100%;'><center><b> <i> Cardify's </i> </b> <br> <strong style='font-size:16px;'> Pokemon TCG Simulator </strong>";

		html += "<br /><br />";

		const introView = this.currentView === "intro";
		const deckbuilderview = this.currentView === "deckbuilder";
		const ladderview = this.currentView === "ladder";
		const cardsview = this.currentView === "collection";
		const shopview = this.currentView === "shop";
		const playview = this.currentView === "play";

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
				this.commandPrefix + ", " + choosePlay,
				"Play!",
				{ selectedAndDisabled: playview }
			);
		html += "</center>";

		html += "<hr/>";

		html += "<div style='padding:10px;font-size:13px;'>";

		html +=
			"<i style='font-size:12px;margin-bottom:8px;'>  You can always PM Cardify <code> .tcg</code>  to view this page </i> <br>";

		html += this.erroMsg
			? `<span class="broadcast-red" style="font-size:11px;"> ${this.erroMsg} </span> <br>`
			: "";

		switch (this.currentView) {
			case "intro":
				{
					html += `<br><strong style='font-size:16px;'>Bot Introduction </strong> <br> <br>`;
					html += `<div style='margin-left:10px;'>`;
					html += `Cardify is a bot developed for the <a href="/tcgtabletop"> TCG & Tabletop </a> room by <span class="username"> <username> Pokem9n </username></span> (a.k.a P9). The bot will be responsible for simulating Pokemon TCG in the chatroom, managing cards, ladders and more! <br><br> As this is the initial phase of the bot, most of the features mentioned are not done implementing, We are working on it and we will notify you in the chatroom when new features are added. <br>`;
					html += `</div>`;

					html += Config.roomIntro.tcgtabletop;
				}
				break;

			case "deckbuilder":
				{
					let player = Players.get(this.userId);
					html += ``;
					html += `<br><strong style='font-size:16px;'>Import Deck </strong> <br><br>`;
					html += `<b> Notes : </b>  <br>`
					html += `<ol> <li> The set name field does not work for now </li> <li> Use <a href="https://pokemoncard.io/deckbuilder/">pokemoncard.io</a> to build deck</li>`
					html += `<li>Use the export deck feature of the same website and create a <a href="https://pastebin.com/">Pastebin</a> link.</li>`
					html += `<li> Paste the link in the "Add pastebin link" input below and press submit </li>`
					html += `<li> Example Link : <a href="https://pastebin.com/3ifjpQFf"> https://pastebin.com/3ifjpQFf </a> </li> </ol>`
					html += `<div style='margin-left:10px;'>`;
					html += `</div>`;
					html += this.deckImportingStatus
						? this.deckImportingStatus
						: this.importDeckInput.render();
					html += this.deckImportingStatus
						? ""
						: this.importDeckNameInput.render();

					html += `<br><strong style='font-size:16px;'> Your Decks </strong> <br> <br>`;
					html += `<div style='margin-left:10px;'>`;
					if (player.decks) {
						player.decks.forEach((d) => {
							let deck = Decks.get(d);
							let title = deck.name;
							let subtitle = `Contains <i> ${deck.deck[0].name},${
								deck.deck[4].name
							}, ${
								deck.deck[deck.deck.length - 1].name
							} and more! </i>`;
							let onClick = `name="send" value="/msg cardify, /msgroom tcgtabletop, /botmsg cardify, ${Config.commandCharacter}viewdeck, view, ${d}"`;
							html += `<button ${onClick} style="background: #282a45; color: inherit; border: 1px solid white; padding: 0; font: inherit; cursor: pointer; border-radius: 10px; outline: inherit; width: 100%; overflow: hidden; position: relative; color: white; font-family: Arial, sans-serif; margin: 2px 0; " > <div style=" background: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3jLYNLuYwPs1suOGNkzsJpLZ-KgNeyLWF_g&usqp=CAU') center/cover no-repeat; filter: blur(1px); position: relative; text-align: center; height: 60px; transform: rotate(3deg); transform: scale(1.1); " > <div style=" position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(40, 42, 69, 0.6); " ></div> </div> <div style=" position: absolute; top: 0; left: 0; z-index: 10; text-align: left; padding: 15px; " > <p style="color: white; margin: 0; font-weight: 700; font-size: 16px"> ${title} </p> <p style=" color: #c9c9c9; margin: 0; background: none; font-weight: 500; font-size: 12px; " > ${subtitle} </p>  </div></button>`;
						});
					}
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
					html += `<br> Your Balance : <strong> ${currency.get(
						Users.get(this.userId)
					)} <i><small> haha you poor :P </small></i> </strong> <br> <br>`;

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
									console.log(
										packs.canOpenDaily(
											Users.get(this.userId)
										)
									);
									html += `<tr><td> ${item.name} </td> <td> ${item.description} </td> <td> ${item.price} </td>`;
									html +=
										"<td>" +
										(packs.canOpenDaily(
											Users.get(this.userId)
										) === true
											? this.getQuietPmButton(
													this.commandPrefix +
														", " +
														buyItem +
														"," +
														item.name +
														"|" +
														item.type,
													"Claim"
											  ) + "</td></tr>"
											: "Claimed");
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

			case "play":
				{
					html += `<div class="broadcast-green" style="margin:5px;padding:6px;border:2px solid white;color:white;text-align:center;font-weight:800px;font-size:20px;"> Play! <br>`;
					let friendlyBattleView =
						this.currentPlayView == "friendlybattleview";
					let rankBattleView =
						this.currentPlayView == "rankbattleview";

					html += `<div style="margin-top:3px;">`;
					html +=
						"&nbsp;" +
						this.getQuietPmButton(
							this.commandPrefix + ", " + chooseFriendlyBattle,
							"Friendly Battle",
							{
								selectedAndDisabled: friendlyBattleView,
								style: "width:30%;height:46px;font-size:14px;",
							}
						);

					html +=
						"&nbsp;" +
						this.getQuietPmButton(
							this.commandPrefix + ", " + chooseRankBattle,
							"Ranked Battle",
							{
								selectedAndDisabled: rankBattleView,
								style: "width:30%;height:46px;font-size:14px;",
							}
						);
					html += `</div></div>`;

					let isSelectedF = (a) => {
						return this.selectedFormat == a;
					};
					let isSelectedD = (a) => {
						return this.selectedDeck == a;
					};

					html += `<div style="height:100%;margin:5px;border:2px solid white;color:white;border-radius:4px;padding:10px;background:#282a45"> <i style="margin:2px;font-size:11px;font-weight:100px"><ins> ${
						rankBattleView ? "Rank" : "Friendly"
					} Battle </ins></i>`;

					switch (this.currentPlayView) {
						case "friendlybattleview":
							{
								if(this.isChallenging) {
									html += `<br><h3> You are challenging <span class="username"> ${this.challengeTo} </span>!`
									html +=
									"&nbsp;&nbsp;" +
									this.getQuietPmButton(
										this.commandPrefix +
											", " +
											searchUserForChallengeCommand +
											"," +
											"cancel",
										"Cancel"
									);
									html += `<br> What happens next will be implemented in a couple of days :D </h3>`
								}
								else if (!this.challengeTo.length) {
									html += `<h3> Who do you wanna play with? </h3> `;
									html +=
										this.searchUserForChallenge.render();
									html += `<br>`;
								} else {
									html += `<br> <strong> Challenging ${this.challengeTo}`;
									html +=
										"&nbsp;&nbsp;" +
										this.getQuietPmButton(
											this.commandPrefix +
												", " +
												searchUserForChallengeCommand +
												"," +
												"",
											"Go Back"
										);
									html += `</strong> <br>`;
									html += `<h3> Choose Format </h3> `;

									let format = "Standard Battle";

									html +=
										"&nbsp;&nbsp;" +
										this.getQuietPmButton(
											this.commandPrefix +
												", " +
												chooseFormatForBattle +
												"," +
												Tools.toId(format),
											"Standard Battle",
											{
												selectedAndDisabled:
													isSelectedF(
														Tools.toId(format)
													),
												style: "width:50%;font-size:13px;margin-bottom:6px;",
											}
										);

									html += `<br>`;

									html += `<h3> Choose Deck </h3>`;

									let deckID = "pokem9ndeck2";
									let player = Players.get(this.userId);

									if (player.decks.length > 10)
										html += `<details><summary> View Decks (${player.decks.length})</summary>`;
									player.decks.forEach((id) => {
										html +=
											"&nbsp;&nbsp;" +
											this.getQuietPmButton(
												this.commandPrefix +
													", " +
													chooseDeckForBattle +
													"," +
													id,
												id,
												{
													selectedAndDisabled:
														isSelectedD(id),
													style: "width:50%;font-size:13px;margin-bottom:6px;",
												}
											);
										html += `<br>`;
									});

									if (player.decks.length > 10)
										html += `</details>`;

										let challengeCmd = `/msg cardify, /msgroom tcgtabletop, /botmsg cardify, ${Config.commandCharacter}tcg, ${challengeUserCmd},${this.selectedFormat},${this.selectedDeck}`;
									html += `<button class="button mainmenu1" name="send" value="${challengeCmd}" style="font-size:19px;padding:11px;position:absolute;top:320px;right:40px;text-shadow: 0 -1px 0 #0f1924;" ${(this.selectedDeck.length > 1 && this.selectedFormat.length > 1) ? "" : "disabled" }> Challenge! </button>`;
								}
							}
							break;

						case "rankbattleview":
							{
								html += `<br> <h2> Coming soon..! </h2>`;
							}
							break;
					}

					html += `</div>`;
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
			//	if (!this.isPm(room)) return;
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
			} else if (cmd === choosePlay) {
				pages[user.id].choosePlay();
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
			} else if (cmd === chooseFriendlyBattle) {
				pages[user.id].chooseFriendlyBattle();
			} else if (cmd === chooseRankBattle) {
				pages[user.id].chooseRankBattle();
			}else if (cmd === chooseDeckForBattle) {
				pages[user.id].chooseDeckForBattle(targets[0].trim());
			}else if (cmd === chooseFormatForBattle) {
				console.log(cmd + "|" + targets)
				pages[user.id].chooseFormatForBattle(targets[0].trim());
			}else if (cmd === challengeUserCmd) {
				console.log(cmd + "|" + targets)
				pages[user.id].challengeUser();
			}else if (cmd === "rejectchallenge") {
				pages[user.id].rejectChallenge(targets[0].trim());
			} else if (cmd === buyItem) {
				let opts = targets[0].trim().split("|");
				pages[user.id].buyItem(user, opts[0], opts[1]);
			} else if (cmd === CLOSE_COMMAND) {
				if (user.id in pages) pages[user.id].close();
			} else {
				console.log(targets);
				if (
					cmd == searchUserForChallengeCommand &&
					targets[0].trim() == ""
				)
					return pages[user.id].setUserForChallenge("");
				if (
						cmd == searchUserForChallengeCommand &&
						targets[0].trim() == "cancel"
					)
						return pages[user.id].setUserForChallenge("cancel");
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
