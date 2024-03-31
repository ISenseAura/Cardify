import path = require("path")
import { User } from "../users"
import * as fs from "fs"
import { currency } from "./currency"

export interface IPlayer {
    id:string
    name:string
    rating:Record<string,any>
    decks:Array<string>
}

class Player implements IPlayer {
    id:string
    name:string
    rating:Record<string,any>
    decks:Array<string>
    items:Record<string,any>
    currency:string;

    constructor(user:User | Player) {
        this.id = user.id
        this.name = user.name
        this.rating = {}
        this.decks = []
        this.items = (user as Player).items ? (user as Player).items : {}
        this.currency = currency.get(this.id) ? currency.get(this.id) : "0";
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

    updatePlayer(id:string) {
        if(!id) return;
        if(!this.players[id]) throw new Error("Not a player");
        let newPlayer = new Player(Users.get(id) ? Users.get(id) as User : this.players[id]);
        delete this.players[id];
        this.players[id] = newPlayer;
        this.update();
    }

    update() {
        fs.writeFileSync(this.dir, JSON.stringify(this.players))
    }
}

export let Players = new _Players();