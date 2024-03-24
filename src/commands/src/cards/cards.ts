import Tools from "../utils/tools";

export type Typings =
  | "fire"
  | "water"
  | "grass"
  | "fighting"
  | "colorless"
  | "lightning"
  | "dragon"
  | "darkness"
  | "metal"
  | "psychic"
  | "fairy";

export type Factors = "x2" | "x4" | "-20" | "-30" | "-40";
export type FlipEffect = "+" | "*";
export type Supertype = "Pokemon" | "Trainer" | "Energy";

interface MoveEntity {
  name: string;
  power: number;
  text: string;
  energy: Record<Typings, number> | {};
  requireFlip: boolean;
  flipEffect: FlipEffect;
}

export class Move implements MoveEntity {
  readonly name: string;
  readonly power: number;
  readonly text: string;
  energy: Record<Typings | string, number>;
  readonly requireFlip: boolean;
  readonly flipEffect: FlipEffect;

  constructor(moveData: any) {
    this.name = moveData.name;
    this.power = parseInt(moveData.damage) > 1 ? parseInt(moveData.damage) : 0;
    this.text = moveData.text;
    this.energy = {};

    moveData.cost.forEach((e: Typings) => {
      this.energy[e.toLowerCase()] += 1;
    });
    this.requireFlip = false;
    this.flipEffect = "+";
  }
}

export abstract class Card {
  public ID: string;
  public id:string;
  public supertype: Supertype;
  public name: string;
  public multiUses: boolean;
  public cardtype: string;
  public count: number;

  public supertypes: Array<string>
  public subtypes: Array<string>
  public types: any;


  public images:any;
  public regulationMark: any;

  constructor(data: any) {
    this.ID = data.ID ? data.ID : data.id;
    this.id = this.ID
    this.name = data.name;
    this.supertype = data.supertype;
    this.multiUses = data.multiUses ? data.multiUses : false;
    this.cardtype = data.supertype;
    this.count = data.count ? data.count : 1;

    this.supertypes = data.supertypes;
    this.subtypes = data.subtypes;
    this.types = data.types;

    this.images = data.images;
    this.regulationMark = data.regulationMark;
  }
}

export class EnergyCard extends Card {
  public type: Typings;
  constructor(cardData: any) {
    super(cardData);
    this.cardtype = "energy";
    this.type = cardData.name.split(" ")[0].toLowerCase();
  }
}

export class ItemCard extends Card {
  private rules: Array<string>;
  private effects: Array<string>;

  constructor(cardData: any) {
    super(cardData);
    this.rules = cardData.rules;
    this.effects = this.rules;
    this.cardtype = "item";
    this.multiUses = true;
  }
}

export class SupporterCard extends Card {
  private effects: Array<string>;

  constructor(cardData: any) {
    super(cardData);
    this.effects = cardData.rules;
    this.cardtype = "supporter";
    this.multiUses = false;
  }
}



export class PokemonCard extends Card {
  readonly release: string;
  readonly type: string;

  //  readonly stage: number;
  readonly subtypes: Array<string>;
  readonly evolvesFrom: string;
  readonly evolvesTo: string;
  readonly weaknesses: Record<Typings, Factors>;
  readonly resistances: Record<Typings, Factors>;

  readonly abilities: Record<string, string>;

  readonly moves: Array<Move>;
  readonly retreatCost: string;

  readonly isEX: boolean;
  readonly isMega: boolean;
  readonly isBasic: boolean;

  readonly originalHP: number;

  // GAME STATES

  public hp: number;
  public damageCounters: number;

  public damageCounter: number;
  public isParalyzed: boolean;
  public isConfused: boolean;
  public isPoisoned: boolean;
  public isAsleep: boolean;
  public attachedCards: Record<string, any>;

  constructor(pokemonData: any) {
    super(pokemonData);

    this.release = "test";
    this.type = pokemonData.types
      ? pokemonData.types[0].toLowerCase()
      : pokemonData.type;

    this.cardtype = "pokemon";

    this.originalHP = pokemonData.hp;
    this.hp = pokemonData.hp;
    this.damageCounters = 0;
    this.subtypes = pokemonData.subtypes;
    this.isEX = pokemonData.subtypes
      ? pokemonData.subtypes.includes("EX")
      : pokemonData.isEX;
    this.isMega = pokemonData.subtypes
      ? pokemonData.subtypes.includes("MEGA")
      : pokemonData.isMEGA;
    this.isBasic = pokemonData.subtypes
      ? pokemonData.subtypes.includes("Basic")
      : pokemonData.isBasic;

    this.abilities = pokemonData.abilities;

    if (typeof pokemonData.abilities == typeof []) {
      pokemonData.abilities.forEach((a: any) => {
        this.abilities[Tools.toId(a.name)] = a.text;
      });
    }

    this.evolvesFrom = pokemonData.evolvesFrom;
    this.evolvesTo = pokemonData.evolvesTo;

    this.weaknesses = pokemonData.weaknesses;
    this.resistances = pokemonData.resistances;

    this.retreatCost = typeof pokemonData.retreatCost ==  typeof [] ? pokemonData.retreatCost.length : pokemonData.retreatCost;
    /*  (typeof pokemonData.retreatcost == typeof []
        ? pokemonData.retreatcost[0] + "X" + pokemonData.retreatcost.length
        : pokemonData.retreatcost).toLowerCase();
*/
    this.moves = [];

    this.damageCounter = 0;
    this.isParalyzed = false;
    this.isConfused = false;
    this.isPoisoned = false;
    this.isAsleep = false;
    this.attachedCards = { energies: {} };

    if (pokemonData.attacks) {
      pokemonData.attacks.forEach((attack: any) => {
        let move: Move = new Move(attack);
        this.moves.push(move);
      });
    } else {
      this.moves = pokemonData.moves;
    }
  }

  damage(num:number) {
    if(!num || typeof num != typeof 5) throw new Error("Damage needs to be a number value")
    this.damageCounter += num;
    this.damageCounters += num;
    this.hp -= num;
  }

}
