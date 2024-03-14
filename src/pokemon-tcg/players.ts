import path = require("path")
import { User } from "../users"
import * as fs from "fs"

export interface IPlayer {
    id:string
    name:string
    rating:Record<string,any>
    decks:Array<string>
}

class Player implements IPlayer{
    id:string
    name:string
    rating:Record<string,any>
    decks:Array<string>

    constructor(user:User) {
        this.id = user.id
        this.name = user.name
        this.rating = {}
        this.decks = []
    }

}


class _Players {
    dir:string;
    players:Record<string,Player>

    constructor() {
        
		this.dir = path.join(Tools.rootFolder, "databases") + "/players.json";

		if (!fs.existsSync(this.dir))
			fs.writeFileSync(
				this.dir,
				JSON.stringify({})
			);
        this.players = JSON.parse(fs.readFileSync(this.dir).toString());
    }

    has(id:string):boolean {
        if(this.players[Tools.toId(id)]) return true;
        return false;
    }

    add(user:User) {
        if(this.has(user.id)) return this.players[user.id];
        let player = new Player(user)
        this.players[player.id] = player;
        return player;
    }

    get(id:string) { 
        return this.players[id]
    }

    reset(user:User) {
        if(!this.has(user.id)) return this.add(user);
        this.players[user.id] = new Player(user);
        return this.get(user.id)
    }


    
    addDeck(user:string,id:string) {
        let player = this.players[user];
        if(player.decks.includes(id)) return;
        player.decks.push(id);
        this.update()
    }

    removeDeck(user:string,id:string) {
        let player = this.players[user]
        if(!player.decks.includes(id)) throw new Error(`Player ${player.name} has no deck with id ${id}`);
        let index = player.decks.indexOf(id);
        player.decks.splice(index,1);
        this.update()
    }

    update() {
        fs.writeFileSync(this.dir, JSON.stringify(this.players))
    }
}

export let Players = new _Players();