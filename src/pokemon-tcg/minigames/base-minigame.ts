import { Room } from "../../rooms"
import { User } from "../../users"

export interface IBaseMinigame {
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

    constructor(data:IBaseMinigame,room:Room, user:User) {
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
        let html = `<small>[Minigame]</small> A Game of <i><b> ${this.name} </b></i> is created by ${this.user.name}! `
        this.room?.sayUhtml("minigamestart",html);
    }

    onStart(user?:User) {
        let html = `<small>[Minigame]</small> A Game of <i><b> ${this.name} </b></i> has started by ${user ? user.name : this.user.name}! `
        this.room?.sayHtml(html);
    }

    onEnd(msg?:string) {
        let html = `<small>[Minigame]</small> The Game of <i><b> ${this.name} </b></i> has ended! `
        if(msg) html = `<small>[Minigame]</small> The Game of <i><b> ${this.name} </b></i> has ended! (${msg}) `
        this.room?.sayHtml(html);
    }

    onError(msg:string) {
        let html = ` <small>[Minigame]</small> <b> Error : </b> ${msg}`
        this.room?.sayUhtml("minigameend",html);
    }

    onWin(user:User) {
        let html = `<small>[Minigame]</small> Congratulations to <span class="username">${user.name}</span> for winning the game of ${this.name}! ${this.reward ? " They won <b> " + this.reward + "</b> as reward!" : ""}  `
        this.room?.sayHtml(html);
    }

    _error(msg:string) {
        this.onError(msg);
    }

    _end(msg?:string) {
        this.ended = true;
        this.onEnd(msg);
        this._destroy();
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
        this._destroy();
    }

    _destroy() {
        if(!global.Minigames.activeGames[this.room.id]) throw new Error("No minigames is running in this room");
        if(global.Minigames.activeGames[this.room.id].id !== this.id) throw new Error("This game is not going on in this room");
        delete global.Minigames.activeGames[this.room.id]; 
    }

    setReward(reward:string) {
        this.reward = reward;
    }
}
