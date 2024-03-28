import path = require("path")
import { Room } from "../rooms"
import { User } from "../users"

import * as fs from "fs"

export interface IMinigame {
    name:string
    official:boolean
    reward?:string
    textBased:boolean
    isQuick:boolean
}


export class Minigame {
    id:string
    name:string
    room:Room | undefined
    official:boolean
    timer?:any
    reward?:string|null
    textBased:boolean
    isQuick:boolean
    user: User
    winner?:User

    ended?:boolean
    started?:boolean

    constructor(data:IMinigame,room:Room, user:User) {
        this.id = Tools.toId(data.name);
        this.name = data.name;
        this.room = room ? room : Rooms.get("botdevelopment");
        this.official = data.official
        this.reward = data.reward ? data.reward : null
        this.textBased = data.textBased;
        this.isQuick = data.isQuick;

        this.user = user
    }

    onCreate() {
        let html = `<div class="infobox" style="padding:3px;"> <small>[Minigame]</small> A Game of <i><b> ${this.name} </b></i> is created by ${this.user.name}! </div>`
        this.room?.sayUhtml("minigamestart",html);
    }

    onStart(user?:User) {
        let html = `<div class="infobox" style="padding:3px;"> <small>[Minigame]</small> A Game of <i><b> ${this.name} </b></i> has started by ${user ? user.name : this.user.name}! </div>`
        this.room?.sayUhtml("minigamestart",html);
    }

    onEnd(msg?:string) {
        let html = `<div class="infobox" style="padding:5px;"> <small>[Minigame]</small> The Game of <i><b> ${this.name} </b></i> has ended! </div>`
        if(msg) html = `<div class="infobox" style="padding:5px;"> <small>[Minigame]</small> The Game of <i><b> ${this.name} </b></i> has ended! (${msg}) </div>`
        this.room?.sayUhtml("minigamestart",html);
    }

    onError(msg:string) {
        let html = `<div class="infobox" style="padding:5px;"> <small>[Minigame]</small> <b> Error : </b> ${msg} </div>`
        this.room?.sayUhtml("minigamestart",html);
    }

    onWin(user:User) {
        let html = `<div class="infobox" style="padding:5px;"> <small>[Minigame]</small> Congratulations to <b>${user.name}</b> for winning the game of ${this.name}! <br> They won <b> ${this.reward} </b> as reward! </div>`
        this.room?.sayUhtml("minigamestart",html);
    }

    _error(msg:string) {
        this.onError(msg);
    }

    _end(msg?:string) {
        this.ended = true;
        this.onEnd(msg);
    }

    _start() {
        if(this.ended) return this._error("The game has ended. please create a new one.")
        this.started = true
        this.onStart();
    }

    _win(user:User) {
        this.winner = user;
        this.onWin(user);
        this.ended = true;
    }

    _destroy() {
        delete this;
    }

    setReward(reward:string) {
        this.reward = reward;
    }
}


class _Minigames {
    activeGames:any;
    minigames:any;
    minigamesDir: string
    constructor() {
        this.minigames = {};
		this.minigamesDir = path.join(Tools.srcBuildFolder, 'pokemon-tcg/minigames');

        try {
        let files = fs.readdirSync(this.minigamesDir)
        files.forEach((file) => {
            let game = require(this.minigamesDir + "/" + file) as any;
            this.minigames[Tools.toId(game.name)] = {}
            this.minigames[Tools.toId(game.name)].description = game.description;
            this.minigames[Tools.toId(game.name)].name = game.name;
            this.minigames[Tools.toId(game.name)].constructor = game;
        })
        }
        catch(e) {
            console.log(e);
        }
    }

    createNew(id:string,room:Room,user:User) {
   
    }
}

export let Minigames = new _Minigames();