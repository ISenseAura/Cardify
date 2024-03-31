import path = require("path");
import { Room } from "../rooms";
import { User } from "../users";
import * as fs from "fs";

class _Minigames {
	activeGames: any;
	minigames: any;
	minigamesDir: string;
	constructor() {
		this.minigames = {};
		this.activeGames = {};
		this.minigamesDir = path.join(
			Tools.srcBuildFolder,
			"pokemon-tcg/minigames"
		);

		let files = fs.readdirSync(this.minigamesDir);

		files.forEach((file) => {
			if (!file.startsWith("base-") && file.endsWith(".js")) {
				let game = require(this.minigamesDir + "/" + file);
				console.log(file);
				this.minigames[Tools.toId(game.name)] = {};
				this.minigames[Tools.toId(game.name)].description =
					game.description;
				this.minigames[Tools.toId(game.name)].name = game.name;
				this.minigames[Tools.toId(game.name)].commands = game.commands;
				this.minigames[Tools.toId(game.name)].path =
					this.minigamesDir + "/" + file;
			}
		});
	}

	createNew(id: string, room: Room, user: User) {
		if (!this.minigames[id])
			throw new Error(`Minigame ${id} does not exist.`);
        if(this.activeGames[room.id] && !this.activeGames[room.id]?.ended) return room.say("There is already a minigame going on in the room");
		let gameConstructor = require(this.minigames[id].path).Game;
		let game = new gameConstructor(room, user);
		this.activeGames[room.id] = game;
		return game;
	}
}

export let Minigames = new _Minigames();

global.Minigames = Minigames;
