/* eslint-disable max-len */
import { info } from "console";
import type { Room } from "../rooms";
import type { BaseCommandDefinitions } from "../types/command-parser";
import type { User } from "../users";
import { Pagination } from "./components/pagination";
import type { IPageElement } from "./components/pagination";
import { CLOSE_COMMAND, HtmlPageBase } from "./html-page-base";

const baseCommand = 'tcg';
const chooseIntro = 'chooseintro';
const chooseDeckBuilder = 'choosedeckbuilder';
const chooseFormats = 'chooseformats';
const chooseLadder = 'chooseladder';
const chooseSets = 'choosesets';
const chooseShop = 'chooseshop';
const chooseCards = 'choosecards';
const commandPageCommand = 'commandspage';

export const pageId = 'tcg-manager';
export const pages: Dict<TCGManager> = {};

class TCGManager extends HtmlPageBase {
	pageId = pageId;
	currentView: 'intro' | 'deckbuilder' | 'formats' | 'ladder' | 'sets' | 'shop' | 'cards'

	showDeveloperCommands: boolean;
	commandsPagination!: Pagination;

	constructor(room: Room, user: User) {
		super(room, user, baseCommand, pages);

		this.commandPrefix = Config.commandCharacter + baseCommand;
		this.setCloseButtonHtml();

		this.showDeveloperCommands = user.isDeveloper();
		this.commandsPagination = new Pagination(this, this.commandPrefix, commandPageCommand, {
			elements: [],
			elementsPerRow: 1,
			rowsPerPage: 20,
			pagesLabel: "Commands",
			noElementsLabel: "No commands in this category have a description.",
			hideSinglePageNavigation: true,
			onSelectPage: () => this.send(),
			reRender: () => this.send(),
		});

        this.currentView = "intro";

		this.components = [this.commandsPagination];

		this.setCommandGuide(true);
	}

	chooseIntro(): void {
		if (this.currentView === 'intro') return;

		this.currentView = 'intro';
		this.setCommandGuide();

		this.send();
	}

	chooseDeckBuilder(): void {
		if (this.currentView === 'deckbuilder') return;

		this.currentView = 'deckbuilder';
		this.setCommandGuide();

		this.send();
	}

	chooseFormats(): void {
		if (this.currentView === 'formats') return;

		this.currentView = 'formats';
		this.setCommandGuide();

		this.send();
	}

	chooseSets(): void {
		if (this.currentView === 'sets') return;

		this.currentView = 'sets';
		this.setCommandGuide();

		this.send();
	}

	chooseCards(): void {
		if (this.currentView === 'cards') return;

		this.currentView = 'cards';
		this.setCommandGuide();

		this.send();
	}

	chooseShop(): void {
		if (this.currentView === 'shop') return;

		this.currentView = 'shop';
		this.setCommandGuide();

		this.send();
	}

	chooseLadder(): void {
		if (this.currentView === 'ladder') return;

		this.currentView = 'ladder';
		this.setCommandGuide();

		this.send();
	}

	setCommandGuide(onOpen?: boolean): void {

      this.send();
	}

	render(): string {
		let html = "<div class='chat' style='margin-top: 4px;margin-left: 4px'><center><b> <i> Cardify's </i> </b> <br> <strong style='font-size:16px;'> Pokemon TCG Simulator </strong>";

		html += "<br /><br />";

		const introView = this.currentView === 'intro';
		const deckbuilderview = this.currentView === 'deckbuilder';
		const ladderview = this.currentView === 'ladder';
		const cardsview = this.currentView === 'cards';
		const shopview = this.currentView === 'shop';
        const formatsview = this.currentView === 'formats';


		html += "<b>Options</b>:";
        html += "&nbsp;" + this.getQuietPmButton(this.commandPrefix + ", " + chooseIntro, "Guide & Updates",
				{selectedAndDisabled: introView});

		html += "&nbsp;" + this.getQuietPmButton(this.commandPrefix + ", " + chooseCards, "Cards",
			{selectedAndDisabled: cardsview});
		html += "&nbsp;" + this.getQuietPmButton(this.commandPrefix + ", " + chooseLadder, "Ladder",
			{selectedAndDisabled: ladderview});
		html += "&nbsp;" + this.getQuietPmButton(this.commandPrefix + ", " + chooseShop, "Shop",
			{selectedAndDisabled: shopview});
		html += "&nbsp;" + this.getQuietPmButton(this.commandPrefix + ", " + chooseDeckBuilder, "Deck Builder",
			{selectedAndDisabled: deckbuilderview});
		html += "&nbsp;" + this.getQuietPmButton(this.commandPrefix + ", " + chooseFormats, "Formats",
			{selectedAndDisabled: formatsview});
		html += "</center>";

        html += "<hr/>"

        html += "<div style='padding:10px;font-size:13px;'>"

        html += "<i> You can always PM Cardify <code> .tcg</code>  to view this page </i> <br>"

		switch(this.currentView) {
            case "intro": {
                html += `<br><strong style='font-size:16px;'>Bot Introduction </strong> <br> <br>`
                html += `<div style='margin-left:10px;'>`
                html += `Cardify is a bot developed for the <a href="/tcgtabletop"> TCG & Tabletop </a> room by <span class="username"> <username> Pokem9n </username></span> (a.k.a P9). The bot will be responsible for simulating Pokemon TCG in the chatroom, managing cards, ladders and more! <br><br> As this is the initial phase of the bot, most of the features mentioned are not done implementing, We are working on it and we will notify you in the chatroom when new features are added. <br>`
                html += `</div>`

                html += `<br><strong style='font-size:16px;'> Features </strong> <br> <br>`
                html += `<div style='margin-left:10px;'>`
                html += `The main feature of this bot, that is the TCG Simulator is gonna take a while to be available for beta testing. We might release the beta version on 22nd March but we dont promise anything. <br><br> The Shop, Ladder, Deck Builder and Formats will be implemented after the simulator is live. Our first priority is to launch the TCG Simulator ASAP. <br><br> As of now, The bot currently has a few helpful and fun commands that are listed below - <br><br>`
                html += `<div style='margin-left:14px;line-height:21px;'>`
                html += `<code>.rcard</code> Shows a random pokemon card (Requires : +,%,@,#) <br>`
                html += `<code>.gdeck QUERY</code> generates a sample deck based on your query (Requires : +,%,@,#) <br>`

                html += `</div>`
                html += `</div>`
            }
            break;

            default : {
                html += "<br> <h2><i> Coming soon..! </i> </h2> "
            }

        }

        html += "</div>"

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
			if (!botRoom) return this.say(CommandParser.getErrorText(['noBotRankRoom']));

			const cmd = Tools.toId(targets[0]);
			targets.shift();

			if (!cmd) {
				new TCGManager(botRoom, user).open();
				return;
			}

			if (!(user.id in pages) && cmd !== CLOSE_COMMAND) new TCGManager(botRoom, user);

			if (cmd === chooseIntro) {
				pages[user.id].chooseIntro();
			} else if (cmd === chooseCards) {
				pages[user.id].chooseCards();
			} else if (cmd === chooseDeckBuilder) {
				pages[user.id].chooseDeckBuilder();
			} else if (cmd === chooseFormats) {
				pages[user.id].chooseFormats();
			} else if (cmd === chooseLadder) {
				pages[user.id].chooseLadder();
			} else if (cmd === chooseSets) {
				pages[user.id].chooseSets();
			}  else if (cmd === chooseShop) {
				pages[user.id].chooseShop();
			} else if (cmd === CLOSE_COMMAND) {
				if (user.id in pages) pages[user.id].close();
			} else {
				const error = pages[user.id].checkComponentCommands(cmd, targets);
				if (error) this.say(error);
			}
		},
		aliases: [],
	},
};