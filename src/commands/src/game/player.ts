import { CardsList } from "../cards";
import { Side } from "./side";

export type PlayerID = "p1" | "p2";

export type Players = Record<"p1" | "p2",Player>

export class Player extends Side {
  private userid: string;
  private playerid: PlayerID;

  constructor(userid: string, playerID: PlayerID, deck: CardsList) {
    super(deck);
    this.userid = userid;
    this.playerid = playerID;
  }

  getPlayer() {
    let d:any = this.getUpdatedSide();
    d.playerid = this.playerid;
    d.id = d.playerid
    d.userid = this.userid
    return d;
  }

  print(): void {
    let hand: any = [];
    let bench: any = [];
    let active: any = this.active?.name;

    this.hand.forEach((id: string) => {
      hand.push(this.deck.card(id).name);
    });
    this.bench.forEach((id: string) => {
      bench.push(this.deck.card(id).name);
    });

    console.log(`\n___Player: ${this.userid} | ID: ${this.playerid}\n
      Hand : ${hand} 
      Bench : ${bench} 
      Active : ${active}
          \n`);
  }
}
