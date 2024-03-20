import { Decks } from "../pokemon-tcg/simulator/decks";
import type { Room } from "../rooms";
import type { BaseCommandDefinitions } from "../types/command-parser";
import type { User } from "../users";
import { Pagination } from "./components/pagination";
import type { IPageElement } from "./components/pagination";
import { CLOSE_COMMAND, HtmlPageBase } from "./html-page-base";

const baseCommand = "viewdeck";

const commandPageCommand = "commandspage";

export const pageId = "deck-preview";
export const pages: Dict<CommandsGuide> = {};

class DeckViewer extends HtmlPageBase {
	pageId = pageId;
	currentView:
		| "developer"
		| "info"
		| "scripted-game"
		| "storage"
		| "tournament"
		| "user-hosted-game"
		| "util" = "info";

	deckId: string;
	commandsPagination!: Pagination;

	constructor(room: Room, user: User, deckId: string) {
		super(room, user, baseCommand, pages);

		this.commandPrefix = Config.commandCharacter + baseCommand;
		this.deckId = deckId;
        this.pageId = "deck-preview-" + deckId
		this.setCloseButtonHtml();
	}

	setDeckId(id: string) {
		this.deckId = id;
		this.send();
	}

	render(): string {
		let html =
			"<div class='chat' style='margin-top: 4px;margin-left: 4px;background-image: linear-gradient(rgba(255 , 255 , 255 , 0) , rgba(90 , 120 , 160 , 1));height:100%;'><center><b> <i> Cardify's </i> </b> <br> <strong style='font-size:16px;'> Deck Viewer </strong> </center>";

		html += "<br /><br />";

		html += `<h3> Viewing Deck ${this.deckId} </h3>`;
		let deleteDeckCommand = `/msg cardify, /msgroom tcgtabletop, /botmsg cardify, ${this.commandPrefix}, deletedeck, ${d}`;

		//html += `<button name="send" value="${deleteDeckCommand}"> Delete </button> <br> `

		let deck = Decks.get(this.deckId);
		html += `<ul style="margin: 3px; padding: 0; display: table">`;

		deck.deck.forEach((card: any) => {
			html += `<li style=" background: url('${card.images.large}') center/contain no-repeat; height: 290px; width: 290px; display: inline-block; margin: 0 0; " > <span style="background:black;padding:5px;font-size:13px;position:relative;border:50%;"><strong> x${card.count} </strong> </span></li>`;
		});
		html += `</ul><br>`;

		html += "</div>";
		return html;
	}
}

export const commands: BaseCommandDefinitions = {
	[baseCommand]: {
		command(target, room, user) {
			if (!this.isPm(room)) return;
			const targets = target.split(",");
			const botRoom = user.getBotRoom();
			if (!botRoom)
				return this.say(CommandParser.getErrorText(["noBotRankRoom"]));

			const cmd = Tools.toId(targets[0]);
			targets.shift();
			switch (cmd) {
				case "view":
					{
						new DeckViewer(
							botRoom,
							user,
							Tools.toId(targets[0])
						).open();
					}
					break;

					case "delete": {
						Decks.delete(targets[0]);
					}
					break;
			}
		},
		aliases: ["vdeck"],
	},
};
