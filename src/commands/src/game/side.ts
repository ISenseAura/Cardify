import { Cards, CardsList, EnergyCard, PokemonCard } from "../cards";
import { Deck, DeckDict } from "../decks";

export type PrizeCards = [Cards, Cards, Cards, Cards, Cards, Cards] | CardsList;
export type BenchCards =
  | [PokemonCard, PokemonCard, PokemonCard, PokemonCard, PokemonCard]
  | CardsList;

export abstract class IdealSide {
  abstract putOnBench(id: string): CardsList;
  abstract makeActivePokemon(id: string): void;
  abstract updatePrizes(id: string): CardsList;
  abstract removeFromHand(id: string): CardsList;
  abstract addToHand(id: string): CardsList;
}

export abstract class Side {
  protected hand: Array<string>;
  protected prizes: Array<string>;
  protected active: PokemonCard | null;
  protected bench: Array<string>;

  protected attachedCards: Record<string,Array<string>>

  public deck: Deck;
  public discardpile: DeckDict;

  constructor(deck: CardsList) {
    this.hand = [];
    this.prizes = [];
    this.active = null;
    this.bench = [];

    this.attachedCards = {};

    this.deck = new Deck(deck);
    this.discardpile = this.deck.discarded;
  }

  private init() {
    this.hand = this.deck.draw(6);
    this.prizes = this.deck.draw(6);
  }

  drawCard(num: number = 1): Array<string> | boolean {
    if (this.deck.isEmpty()) throw new Error("Deck is empty");
    this.hand = this.deck.draw(num);
    return this.hand;
  }

  drawCustomCard(id: string): Array<string> | boolean {
    if (this.deck.isEmpty()) throw new Error("Deck is empty");
    if (!this.deck.liveDeck.includes(id))
      throw new Error("Card is not in the deck");
    this.hand.push(this.deck.drawCustom(id));
    return this.hand;
  }

  handHas(id: string): boolean {
    console.log("HANDDD -- " + this.hand)
    if (!this.deck.deck[id]) return false;
    if (!this.hand.includes(id)) return false;
    return true;
  }

  benchHas(id: string): boolean {
    if (!this.deck.deck[id]) return false;
    if (!this.bench.includes(id)) return false;
    return true;
  }

  removeFromHand(id: string): boolean {
    let card: Cards = this.deck.deck[id];
    if (!this.hand.includes(id)) return false;
    this.hand.splice(this.hand.indexOf(id), 1);
    return true;
  }

  putOnBench(id: string, pos?: 1|2|3|4|5): Array<string> {
    if (!this.handHas(id)) throw new Error(`The card is not in your hand (ID : ${id}, HAND : ${this.hand}) `);

    if (pos) {
      let benchCard: PokemonCard = this.deck.getPokemon(id);
      if (!benchCard) throw Error("No card exists on that bench position");
      let card: PokemonCard = this.deck.getPokemon(id);
      if (card.evolvesFrom !== benchCard.evolvesTo)
        throw new Error("Evolution chain does not match");
      this.bench[pos] = card.ID;
      this.removeFromHand(id);
      return this.bench;
    } else {
      if (!this.deck.pokemons[id]) throw new Error("A pokemon card expected");
      if (!this.hand.includes(id))
        throw new Error("Pokemon card is not in hand");
      if(!this.deck.getPokemon(id).isBasic) throw new Error("You can only put basic card on bench. Maybe you're looking for the evolution method.")
      this.removeFromHand(id);
      this.bench.push(id);
      return this.bench;
    }
  }

  putOnActive(id: string) {
    if (!this.handHas(id)) throw new Error(`The card is not in your hand (ID : ${id}, HAND : ${this.hand})`);
    if (!this.active) {
      let card: PokemonCard = this.deck.pokemons[id];
      if (!card) throw new Error(`Card does not exist in deck (ID : ${id})`);
      if (!card.isBasic) {
        throw new Error(
          "Only basic cards can be put on active at the beginning"
        );
      }
      this.removeFromAll(card.ID);
      this.active = card;
    } else {
      if (this.active.evolvesTo) {
        let card: PokemonCard = this.deck.pokemons[id];
        if (this.active.evolvesTo !== card.evolvesFrom) {
          throw new Error(`Invalid evolution card (ID : ${id})`);
        }
        this.active = card;
      }
    }
  }

  putToHand(id: string) {
    if (!this.deck.deck[id]) throw new Error("Card does not exist");
    this.hand.push(id);
  }

  removeFromAll(id: string) {
    if (!this.deck.deck[id]) throw new Error("Card does not exist");
    let pcard: Cards = this.deck.deck[id];
    if (this.bench.includes(id)) this.bench.splice(this.bench.indexOf(id), 1);
    if (this.hand.includes(id)) this.hand.splice(this.hand.indexOf(id), 1);
    if(this.active?.ID == pcard.ID) this.active = null;
  }

  putToDeck(id:string) {
    if(this.deck.deckHasCard(id)) throw new Error(`The card is already in the deck (ID : ${id})`)
    if(this.deck.discardedIDs.includes(id)) this.deck.putBackDiscardedCard(id);
    if(this.deck.drawn.includes(id)) this.deck.putBackDrawnCard(id);
    return true;
  }

  attachEnergyCard(to:string,id:string) {
    let toCard: PokemonCard = this.deck.getPokemon(to);
    let card: EnergyCard = this.deck.getEnergy(id);
    if(!toCard.attachedCards.energies[card.type]) toCard.attachedCards.energies[card.type] = 0;
    toCard.attachedCards.energies[card.type] += 1;
  }

  attachEvolutionCard(fromID:string,toID:string) {
    let from: PokemonCard = this.deck.getPokemon(fromID); // old
    let to: PokemonCard = this.deck.getPokemon(toID); // new

    if(from.evolvesTo != to.evolvesFrom) throw new Error(`Invalid evolution chain (FROM : ${fromID}, TO : ${toID}`)

    to.attachedCards = from.attachedCards;
    to.damageCounter = from.damageCounter;
    to.hp = from.hp;

    if(!to.attachedCards["evolution"]) to.attachedCards.evolution = [fromID]

  }

  isActive(id:string): boolean {
    if(!this.active) return false;
    if(this.active.ID != id) return false;
    return true;
  }


  getUpdatedSide() {
    return {
      hand : this.hand,
      bench: this.bench,
      active: this.active,
      prizes: this.prizes,
      deck: this.deck.count,
    }
  }

  public get Hand() {
    return this.hand;
  }

  public get Bench() {
    return this.bench;
  }

  public get Active() {
    return this.active;
  }

  public get Prizes() {
    return this.prizes;
  }

  public get AttachedCards() {
    return this.attachedCards;
  }
}
