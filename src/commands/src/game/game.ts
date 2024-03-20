import { Cards, CardsList, PokemonCard } from "../cards";
import Tools from "../utils/tools";
import { Player, PlayerID, Players, Side } from "./index";
import { Deck } from "../decks";

import { EventEmitter } from "events";
import { Moves } from "../mechanics";

interface GameEvents {
  start(): void;
  beforeStart(): void;
  duringTurn(): void;
  afterTurn(): void;
  afterTurnEnd(): void;
}

export type GameInitData = {
  id: string;
  players: Array<{ playerid: string; userid: string; deck: CardsList }>;
  rules?: Array<string>;
};

export type CoinTossOutcomes = "HEADS" | "TAILS";

interface ICoinToss {
  HEADS: number;
  TAILS: number;
  outcomes: Array<CoinTossOutcomes>;
}

let playerChoices: Array<string> = [
  "attack",
  "bench",
  "attachenergy",
  "usecard",
  "pass",
];

export type UseCardsEvents = "";

interface Field {
  abilities: Record<string, { side: PlayerID; id: string; isActive: boolean }>;
  stadium: Record<string, { side: PlayerID; id: string; isActive: boolean }>;
}

export  class Game extends EventEmitter implements GameEvents {
  readonly ID: string;
  readonly created: Date;
  public initPlayers: Array<{
    playerid: string;
    userid: string;
    deck: CardsList;
  }>;

  protected players: any;
  public p1: any;
  public p2: any;

  public turn: number;
  public whoseTurn: PlayerID;
  public previousTurn: PlayerID | null;
  public firstTurn: PlayerID;
  public previousTurnEvents: Record<string, boolean> | null;
  public turnData: Record<string, any>;

  public field: Field | null;
  public activeAbilities: Record<string, Array<string>>;
  public activeAttacks: Record<string, Array<string>>;

  public states: Record<PlayerID, any>;

  private initiated: boolean;
  private ended: boolean;
  private started: boolean;
  private winner: PlayerID | "draw" | null;

  private onEndCallback: any;

  constructor(data: GameInitData, callback?: any) {
    super();
    this.ID = data.id;
    this.created = new Date();
    this.initPlayers = data.players;
    this.players = { p1: null, p2: null };

    this.turn = 0;
    this.firstTurn = "p1";
    this.whoseTurn = Tools.sampleOne(["p1", "p2"]);
    this.previousTurn = null;
    this.previousTurnEvents = null;
    this.turnData = {};

    this.field = null;
    this.activeAbilities = { p1: [], p2: [] };
    this.activeAttacks = {p1:[],p2:[]}

    this.states = { p1: null, p2: null };

    this.initiated = false;
    this.ended = false;
    this.started = false;
    this.winner = null;

    this.onEndCallback = callback;
  }

  init() {
    let p1Data = this.initPlayers[0];
    let p2Data = this.initPlayers[1];
    let p1DeckValidated = false;
    let p2DeckValidated = false;
    try {
      p1DeckValidated = Deck.validate(p1Data.deck);
      p2DeckValidated = Deck.validate(p2Data.deck);
    } catch (e: any) {
      this.emit("validationFail", {
        data: e.message,
        p1: p1DeckValidated,
        p2: p2DeckValidated,
      });
    }

    let p1 = new Player(p1Data.userid, "p1", p1Data.deck);
    let p2 = new Player(p2Data.userid, "p2", p2Data.deck);
    this.players["p1"] = p1;
    this.players["p2"] = p2;
    this.p1 = p1;
    this.p2 = p2;

    //initialize player game states
    this.p1.state = {
      handRevealed: false,
      benchRevealed: false,
    };

    this.p2.state = {
      handRevealed: false,
      benchRevealed: false,
    };

    this.p1.basicCards = [];
    this.p2.basicCards = [];

    this.initiated = true;
    if (this.initiated) this.start();
  }

  beforeStart(): void {}

  start() {
    if (!this.p1 || !this.p2) this.error("Players not initialized");
    // this.updatePlayer();

    this.emit("initiated", this.getUpdate());

    this.send("The Game has started!");

    this.send("Shuffling your deck", "p1");
    this.p1.deck.shuffle(true);
    this.send("Drawing 7 cards", "p1");
    this.drawMultipleCards("p1", 7);

    this.send("Shuffling your deck", "p2");
    this.p2.deck.shuffle(true);
    this.send("Drawing 7 cards", "p2");
    this.drawMultipleCards("p2", 7);

    this.updatePlayer();
    this.performBeforeGameStartChecks();
  }

  // Turn-Events

  nextTurn() {
    this.turn += 1;
    this.sendTurnUpdate("start");
    if (this.turn == 1) {
      this.askForChoices(this.whoseTurn, [
        "bench",
        "attachenergy",
        "usecard",
        "pass",
      ]);
    }
  }

  duringTurn(): void {}

  afterTurn(): void {}

  afterTurnEnd(): void {
    this.sendTurnUpdate("end");
  }

  /* @Game-Checks */

  allPlayersReady(): boolean {
    return this.p1.state.ready && this.p2.state.ready;
  }

  playerHasValidHand(id: PlayerID): boolean {
    let player = this[id];
    let hasAtleastOneBasic = false;
    player.hand.forEach((cardid: string) => {
      let card: any = player.deck.getCard(cardid);
      if (card.isBasic) hasAtleastOneBasic = true;
    });

    return hasAtleastOneBasic;
  }

  canUseCard(p: PlayerID, id: string, target?: string): boolean {
    let player: Player = this[p];
    if (!this.turnData[this.turn]) return true;
    if (!this.turnData[this.turn][p]) return true;
    let card: Cards = target
      ? player.deck.getCard(target)
      : player.deck.getCard(id);

      if(this.activeAttacks[p]) {
        if(card.cardtype == "energy" && this.activeAttacks[p].includes("useenergy")) {
          this.activeAttacks[p].splice(this.activeAttacks[p].indexOf("useenergy"));
          return true;
        }
      }
      else {
    if (card.cardtype == "pokemon" && !this.turnData[this.turn][p][card.name])
      return true;
    if (
      (this.turnData[this.turn][p][card.cardtype] && card.multiUses) ||
      !this.turnData[this.turn][p][card.cardtype]
    )
      return true;
    }
    return false;
  }

  /* @Player-Actions */

  playerReady(p: PlayerID) {
    if (!this[p]) throw new Error(`Player is not initialized (ID : ${p})`);
    if (!this[p].hand.length)
      throw new Error(`Player has no cards in hand (ID : ${p})`);
    if (!this[p].active)
      throw new Error(`Player has not choosen an active pokemon (ID : ${p})`);
    if (!this[p].state)
      throw new Error(
        `Player is not initialized properly (ID : ${p}, MISSING : "state" )`
      );
    this[p].state.ready = true;

    this.emit("ready", { player: p, ready: true });

    this.updatePlayer();

    if (this.allPlayersReady()) {
      this.started = true;
      let ps = ["p1", "p2"];
      this.whoseTurn = Tools.sampleOne(ps);
      let sendData: any = {};
      sendData.data = this.getUpdate();
      sendData.whoseTurn = this.whoseTurn;
      this.started = true;
      this.emit("gamestart", sendData);
      this.nextTurn();
      //  this.whoMovesFirst()
    }
  }

  chooseActive(player: PlayerID, card: string) {
    if (!card) throw new Error("Expected a pokemon to put as active");
    try {
      if (this[player].active != null) return;
      this[player].putOnActive(card);
      let sendData: any = {};
      sendData.player = player;
      sendData.active = this[player].active;

      if (this[player].basicCards.includes(card))
        this[player].basicCards.splice(
          this[player].basicCards.indexOf(card),
          1
        );

      this.emit("activepokemon", sendData);
      this.sendSideUpdate(player);
      this.askForChoices(player, ["bench", "ready"]);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  addToBench(p: PlayerID, id: string) {
    if (!id) throw new Error("Expected a pokemon card id");
    let player = this[p];

    try {
      if (player.active == null)
        return this.PMError(
          p,
          "Please choose a active pokemon before adding to bench"
        );
      if (player.bench.length == 5)
        return this.PMError(
          p,
          "You cannot put more than 5 cards on your bench"
        );
      player.putOnBench(id);
      let sendData: any = {};
      sendData.player = p;
      sendData.bench = player.deck.getPokemon(id);

      if (player.basicCards.includes(id))
        player.basicCards.splice(
          player.basicCards.indexOf(id),
          1
        );

      this.emit("benchupdate", sendData);
      this.sendSideUpdate(p);
      this.askForChoices(p, ["bench", "ready"]);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  drawSingleCard(p: PlayerID) {
    let player = this[p];
    player.drawCard();
    this.send(`Player ${player.userid} has drawn a card`);
    this.emit("carddrawn", {
      player: p,
      card: player.hand[player.hand.length - 1],
    });
    if (player.deck.getCard(player.hand[player.hand.length - 1]).isBasic)
      player.basicCards.push(player.hand[player.hand.length - 1]);

    this.updatePlayer();
  }

  drawMultipleCards(p: PlayerID, num: number) {
    let player = this[p];
    player.drawCard(num);
    this.send(`Player ${player.userid} has drawn ${num} cards`);
    let cards = [];
    for (let i = player.hand.length - 1; i >= player.hand.length - num; i--) {
      cards.push(player.hand[i]);
      if (player.deck.getCard(player.hand[i]).isBasic)
        player.basicCards.push(player.hand[i]);
    }
    this.emit("carddrawn", { player: p, cards: cards });
    this.updatePlayer();
  }

  revealHand(p: PlayerID) {
    let player = this[p];
    if (!player.hand.length)
      throw new Error(`Player hand is empty (Player : ${p})`);
    let hand = this.getDetailedPlayer(p).hand;
    this.emit("reveal", { data: { hand, player: p } });
    player.handRevealed = true;
  }

  reDrawHand(p: PlayerID) {
    let player = this[p];
    player.hand.forEach((id: any) => {
      player.putToDeck(id);
    });

    this.send("Shuffling your deck", p);
    player.deck.shuffle(true);
    this.send("Re-Drawing 7 cards", p);
    player.handRevealed = false;
    this.drawMultipleCards(p, 7);
    this.updatePlayer();
    this.performBeforeGameStartChecks();
  }

  attack(p: PlayerID, id: number) {
    let player = this[p];
    let move = this[p].active.moves[id];
  }

  retreat(p:PlayerID,target:string) {
    
  }

  useCard(p: PlayerID, id: string, target?: string) {
    if (this.whoseTurn != p)
      throw new Error(
        `It is not your turn (Turn : ${this.turn}, WhoseTurn : ${this.whoseTurn}`
      );
    let player: Player = this[p];
    let deck: any = player.deck;
    let card;
    try {
      card = deck.getCard(id);
    } catch (e) {
      throw e;
    }

    switch (card.cardtype) {
      case "energy":
        {
          if (!target)
            throw new Error(
              "To use an energy card you must provide target pokemon"
            );
          if (!player.benchHas(target) || !player.isActive(target))
            throw new Error(
              "Target pokemon is not your active pokemon nor in your bench"
            );
          if (!this.canUseCard(p, id, target))
            throw new Error("Cannot use energy cards more than once in a turn");
          let type = card.type;
          player.attachEnergyCard(target, id);
          this.updateTurn(p, "energy");
        }
        break;

      case "pokemon":
        {
          if (!target)
            throw new Error(
              "To use an evolution card you must provide target pokemon"
            );
          if (!player.benchHas(target) || !player.isActive(target))
            throw new Error(
              "Target pokemon is not your active pokemon nor in your bench"
            );
          if (!this.canUseCard(p, id, target))
            throw new Error("Cannot evolve a pokemon twice in a single turn");
          let type = card.type;
          player.attachEvolutionCard(target, id);
          this.updateTurn(p, id);
          this.updateTurn(p, target);
        }
        break;
    }
  }

  flipCoin(): CoinTossOutcomes {
    let outputs = ["HEADS", "TAILS"];
    return Tools.sampleOne(outputs);
  }

  flipMultipleCoins(times: number): ICoinToss {
    let data: ICoinToss = { HEADS: 0, TAILS: 0, outcomes: [] };
    let outputs: Array<string> = [];

    for (let i = 0; i < times; i++) {
      let o: CoinTossOutcomes = this.flipCoin();
      data.outcomes.push(o);
      data[o] += 1;
    }
    return data;
  }

  /* @Game-Mechanics-Events */

  runItemCard(p: PlayerID, id: string) {}
  runStadiumCard(p: PlayerID, id: string) {}
  runSupporterCard(p: PlayerID, id: string) {}

  runAbility(p: PlayerID, ability: string) {}
  runMove(p: PlayerID, move: string) {}

  // before game start

  performBeforeGameStartChecks() {
    let players = ["p1", "p2"];
    let p1ReadyToChoose = false;
    let p2ReadyToChoose = false;

    players.forEach((id: any) => {
      if (!this.playerHasValidHand(id)) {
        let p = id == "p1" ? this.p1 : this.p2;
        let p2 = id == "p1" ? this.p2 : this.p1;
        this.send(
          `Player ${p.userid} does not have any basic pokemon card in hand and is forced to redraw hand`
        );
        this.emit("invalidhand", { player: p, hand: p.hand });
        this.emit("choose", {
          event: "redrawhand",
          player: id,
          msg: "You dont have basic cards, re-drawing hand",
        });
        this.send(`Player ${p2.userid} draws one more card as per rules`);
        this.drawSingleCard("p2");
        this.reDrawHand(id);

      } else {
        if (id == "p1") p1ReadyToChoose = true;
        if (id == "p2") p2ReadyToChoose = true;
      }
    });

    this.sendSideUpdate("p1");
    this.sendSideUpdate("p2");

    if (p1ReadyToChoose) {
      this.emit("choose", {
        event: "activepokemon",
        player: "p1",
        data: this.getDetailedPlayer("p1"),
      });
    }
    if (p2ReadyToChoose) {
      this.emit("choose", {
        event: "activepokemon",
        player: "p2",
        data: this.getDetailedPlayer("p2"),
      });
    }
  }

  /* @Ask-Players-For-Input-Events */

  askForChoices(p: PlayerID, except?: Array<string>) {
    let defaultChoices = playerChoices;
    if (except) defaultChoices = except;

    this.emit("choice", {
      player: p,
      choices: defaultChoices,
      game: this.getUpdate(),
    });
  }

  /* @Game-Updates-Events */

  updateTurn(p: PlayerID, event: string, override?: boolean) {
    let multiEvents: Array<string> = ["item"];
    if (!this.turnData[this.turn]) this.turnData[this.turn] = {};
    if (!this.turnData[this.turn][p]) this.turnData[this.turn][p] = {};
    this.turnData[this.turn][p][event] = true;
    if (override) this.turnData[this.turn][p][event] = override;
  }

  getDetailedPlayer(p: PlayerID) {
    let player = this[p];
    let data = player.getUpdatedSide();

    let hand: Record<string, Cards> = {};
    let bench: Record<string, PokemonCard> = {};
    let active: PokemonCard = data.active;
    let attachedCards: Record<string, Cards> = {};

    data.hand.forEach((id: string) => {
      hand[id] = player.deck.getCard(id);
    });
    data.bench.forEach((id: string) => {
      bench[id] = player.deck.getPokemon(id);
    });

    return { hand, bench, active, basicCards: player.basicCards };
  }

  updatePlayer(p?: string) {
    let p1update: any = this.getDetailedPlayer("p1");
    let p2update: any = this.getDetailedPlayer("p2");
    if (this.activeAbilities.p1.length)
      p1update.abilities = this.activeAbilities.p1;
    if (this.activeAbilities.p2.length)
      p2update.abilities = this.activeAbilities.p2;

    if (p == "p1")
      return this.emit("playerupdate", {
        player: "p1",
        data: p1update,
        state: this[p].state,
      });

    if (p == "p2")
      return this.emit("playerupdate", {
        player: "p2",
        data: p2update,
        state: this[p].state,
      });
    this.emit("playerupdate", {
      player: "p1",
      data: p1update,
      state: this.p1.state,
    });
    this.emit("playerupdate", {
      player: "p2",
      data: p2update,
      state: this.p2.state,
    });
  }

  sendSideUpdate(p: PlayerID) {
    let side: any = {};
    let player = this[p];
    side = player.getPlayer();
    side.basicCards = player.basicCards;
    this.emit("sideupdate", { player: p, data: side });
  }

  sendTurnUpdate(text: "start" | "end") {
    let gamedata: any = this.getUpdate();
    let sendData: any = { name: text, data: gamedata };
    sendData.turn = this.turn;
    sendData.whoseTurn = this.whoseTurn;

    this.emit("turnupdate", sendData);
  }

  getUpdate() {
    let gameData: any = {};
    gameData.id = this.ID;
    gameData.created = this.created;
    gameData.p1 = this.p1.getPlayer();
    gameData.p2 = this.p2.getPlayer();
    gameData.turn = this.turn;
    gameData.previousTurn = this.previousTurn;
    gameData.previousTurnEvents = this.previousTurnEvents;

    gameData.field = this.field;
    gameData.activeAbilities = this.activeAbilities;

    gameData.states = this.states;

    gameData.started = this.started;
    gameData.ended = this.ended;
    gameData.winner = this.winner;

    return gameData;
  }

  send(msg: string, p?: string) {
    console.log(`[SIM] |${p}|${msg}`)
    this.emit("msg", `:${p ? p : "all"}:${msg}`);
  }

  PMError(p: PlayerID, msg: string) {
    this.emit("pmerror", { player: p, data: msg });
  }

  error(msg: string, unexpected?: string) {
    this.emit("error", msg);
  }
}
