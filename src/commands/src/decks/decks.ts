/*
 *   # 23-02-24 | @Author - Pokem9n
 *
 *   - Deck handler
 *   - Pass array of Cards to deck constructor
 *   - Call load() function to handle duplicate cards with same IDs
 *     cards with same initial IDs will get a new ID ending with a "#" followed by an unique number attached to it
 *     for example (xy1-23#1) where xy1-23 is the initial ID
 *   - deck,inputdeck will remain constant always they contain the original deck data (after loading)
 *   - livedeck contains the IDs of cards
 *     all in-game deck operations should be performed on livedeck, discardedIDs and drawn
 *     such as :
 *     shuffle(), drawCard(), discard() etc
 *   - deck.discardedIDs is the discard pile.
 *     always treat it as an array
 *   - deck.drawn is the array of card IDs which is neither in livedeck nor in discardedIDs
 *
 *
 */

import { Cards, CardsList, EnergyCard, ItemCard, PokemonCard } from "../cards";

export type DeckDict = Record<string, Cards>;

export class Deck {
	private _top: Cards;
	private _deck: DeckDict;
	private _inputdeck: CardsList;
	private _liveDeck: Array<string>;
	private _shuffleCount: number;
	private _discarded: DeckDict;
	private _discardedIDs: Array<string>;
	private _drawn: Array<string>;
	private _isLoaded: boolean;
	public count: number;

	readonly _pokemons: Record<string, PokemonCard>;
	readonly _items: Record<string, ItemCard>;
	readonly _energies: Record<string, EnergyCard>;

	constructor(deck: CardsList) {
		this._top = deck[0];
		this._inputdeck = deck;
		this._deck = {};
		this._liveDeck = [];
		this.count = 0;
		this._shuffleCount = 0;
		this._discarded = {};
		this._discardedIDs = [];
		this._drawn = [];
		this._isLoaded = false;

		this._pokemons = {};
		this._items = {};
		this._energies = {};

		this.init();
	}

	public static load(mydeck: CardsList) {
		if (mydeck.length >= 59)
			throw new Error("Input deck is already a loaded deck");
		let deck = mydeck;
		if (mydeck && typeof mydeck == typeof []) deck = mydeck;
		let newDeck: DeckDict = {};
		for (let i = 0; i < deck.length; i++) {
			let card = deck[i];

			let count = card.count;
			if (count > 1) {
				for (let j = 1; j <= count; j++) {
					if (card.cardtype.startsWith("pok"))
						newDeck[card.ID + "#" + j] = new PokemonCard(card);
					if (card.cardtype.startsWith("item"))
						newDeck[card.ID + "#" + j] = new ItemCard(card);
					if (card.cardtype.startsWith("energy"))
						newDeck[card.ID + "#" + j] = new EnergyCard(card);
				}
			} else {
				newDeck[card.ID] = card;
			}
		}

		return newDeck;
	}

	private load(): DeckDict {
		if (this._isLoaded) return this._deck;
		let deck = Deck.load(this._inputdeck);

		Object.keys(deck).forEach((key) => {
			this._liveDeck.push(key);
			let card = deck[key];
			deck[key].ID = key;
			deck[key].id = key;
			if (card.cardtype.startsWith("pok"))
				this._pokemons[key] = new PokemonCard(card);
			if (card.cardtype.startsWith("item"))
				this._items[key] = new ItemCard(card);
			if (card.cardtype.startsWith("energy"))
				this._energies[key] = new EnergyCard(card);
		});

		this._isLoaded = true;
		return deck;
	}

	public init() {
		this.parse();
		this._deck = this.load();

		this.shuffle(true);

		this.count = this._liveDeck.length;
	}

	private parse() {
		if (!this._inputdeck) throw Error("Deck not initialised");
		if (typeof this._inputdeck != typeof [])
			throw Error(
				"Invalid input deck : Expected an array, received : " +
					typeof this._inputdeck
			);
	}

	dictify(cards?: Array<string>): CardsList {
		let list: CardsList = [];
		(cards ? cards : this._liveDeck).forEach((id) => {
			list.push(this._deck[id]);
		});
		return list;
	}

	isEmpty(): boolean {
		return !this._liveDeck.length;
	}

	unliveCard(id: string): boolean {
		if (!this._liveDeck.includes(id))
			throw new Error(`Card does not exist on deck (ID : ${id})`);
		this._liveDeck.splice(this._liveDeck.indexOf(id), 1);
		this.count = this._liveDeck.length;
		return true;
	}

	card(id: string): Cards {
		if (!this._deck[id]) throw new Error("Card does not exist on deck");
		return this._deck[id];
	}

	random(num: number = 1, updateDeck: boolean = false): CardsList {
		let result = [];
		for (let i = 0; i < num; i++) {
			const len = this._inputdeck.length;
			if (!len)
				throw new Error("Deck.random does not accept empty arrays");
			result.push(this._deck[this.shuffle(false)[0]]);
		}

		return result;
	}

	draw(num: number): Array<string> {
		if (num > this._liveDeck.length)
			throw new Error(
				`The deck does not have enough cards (NumberOfCardsWanted : ${num}, NumberOfCardsPresent : ${this._liveDeck.length})`
			);
		let cards: Array<string> = this._liveDeck.slice(0, num);
		cards.forEach((card) => {
			this.unliveCard(card);
			this._drawn.push(card);
		});

		return cards;
	}

	drawCustom(id: string): string {
		if (!this._liveDeck.includes(id))
			throw new Error(`Card does not exist in deck (ID : ${id})`);

		this.unliveCard(id);
		this._drawn.push(id);
		return id;
	}

	drawFromDiscardPile(num: number): Array<string> | boolean {
		if (this.discardedIDs.length < num)
			throw new Error(
				`The discard pile does not have enough cards (NumberOfCardsWanted : ${num}, NumberOfCardsPresent : ${this.discardedIDs.length})`
			);
		let cards: Array<string> = this._discardedIDs.slice(0, num);
		cards.forEach((card) => {
			this.unliveCard(card);
			this._drawn.push(card);
		});

		return cards;
	}

	getCard(id: string): Cards {
		if (this._deck[id]) return this._deck[id];
		throw new Error(`Card does not exist in deck (ID : ${id}`);
	}

	deckHasCard(id: string): boolean {
		if (this._liveDeck.includes(id) && this._deck[id]) return true;
		return false;
	}

	putBackDrawnCard(id: string): boolean {
		if (this._deck[id] && this._drawn.includes(id)) {
			this._liveDeck.push(id);
			this._drawn.splice(this._drawn.indexOf(id), 1);
			return true;
		}
		if (!this._deck[id] || !this._drawn.includes(id)) {
			throw new Error(`Card has not been drawn (ID : ${id}`);
			return false;
		}
		return false;
	}

	putBackDiscardedCard(id: string): boolean {
		if (this._deck[id] && this._discardedIDs.includes(id)) {
			this._liveDeck.push(id);
			this._discardedIDs.splice(this._discardedIDs.indexOf(id), 1);
			return true;
		}
		if (!this._deck[id] || !this._discardedIDs.includes(id)) {
			throw new Error(`Card does not exist in discard pile (ID : ${id})`);
			return false;
		}
		return false;
	}

	shuffle(save: boolean): Array<string> {
		//let deck : CardsList = this._inputdeck.slice();

		let deck: Array<string> = this._liveDeck;
		// Fisher-Yates shuffle algorithm
		let currentIndex: number = deck.length;
		let randomIndex: number = 0;
		let temporaryValue: string;

		// While there remain elements to shuffle...
		while (currentIndex !== 0) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = deck[currentIndex];
			deck[currentIndex] = deck[randomIndex];
			deck[randomIndex] = temporaryValue;
		}
		if (save) {
			this._liveDeck = deck;
			this.count = this._liveDeck.length;
			//this.init();
			this._top = this.deck[this._liveDeck[0]];
		}
		return deck;
	}

	shuffleDiscardPile(save: boolean): Array<string> {
		//let deck : CardsList = this._inputdeck.slice();

		let deck: Array<string> = this._discardedIDs;
		// Fisher-Yates shuffle algorithm
		let currentIndex: number = deck.length;
		let randomIndex: number = 0;
		let temporaryValue: string;

		// While there remain elements to shuffle...
		while (currentIndex !== 0) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = deck[currentIndex];
			deck[currentIndex] = deck[randomIndex];
			deck[randomIndex] = temporaryValue;
		}
		if (save) {
			this._discardedIDs = deck;
			//this.init();
			// this._top = this._inputdeck[0];
		}
		return deck;
	}

	discard(id: string): boolean {
		if (!this._deck[id])
			throw new Error(`Card does not exist in deck (ID : ${id})`);
		this._discarded[id] = this._deck[id];
		this._discardedIDs.push(id);
		this.unliveCard(id);
		return true;
	}

	public getPokemon(id: string): PokemonCard {
		if (!this.pokemons[id])
			throw new Error(
				"Pokemon Card does not exist in deck (ID : " + id + ")"
			);
		return this.pokemons[id];
	}

	public getEnergy(id: string): EnergyCard {
		if (!this.energies[id])
			throw new Error(
				"Energy Card does not exist in deck (ID : " + id + ")"
			);
		return this.energies[id];
	}

	public getItem(id: string): ItemCard {
		if (!this.items[id])
			throw new Error(
				"Item Card does not exist in deck (ID : " + id + ")"
			);
		return this.items[id];
	}

	public getFromDeck(category: string) {
		switch (category) {
			case "energy":
				{
					let energies: Array<string> = [];
					this._liveDeck.forEach((id: string) => {
						let card = this.getCard(id);
						if (card.cardtype == "energy") energies.push(id);
					});
					return energies;
				}
				break;

			case "pokemon":
				{
					let pkmns: Array<string> = [];
					this._liveDeck.forEach((id: string) => {
						let card = this.getCard(id);
						if (card.cardtype == "pokemon") pkmns.push(id);
					});
					return pkmns;
				}
				break;

			case "item":
				{
					let items: Array<string> = [];
					this._liveDeck.forEach((id: string) => {
						let card = this.getCard(id);
						if (card.cardtype == "item") items.push(id);
					});
					return items;
				}
				break;
		}
	}

	public get deck() {
		return this._deck;
	}

	public get top() {
		return this._top;
	}

	public get liveDeck() {
		return this._liveDeck;
	}

	public get inputdeck() {
		return this._inputdeck;
	}

	public get drawn() {
		return this._drawn;
	}
	public get discarded() {
		return this._discarded;
	}
	public get discardedIDs() {
		return this._discardedIDs;
	}

	public get pokemons() {
		return this._pokemons;
	}

	public get items() {
		return this._items;
	}
	public get energies() {
		return this._energies;
	}

	public static validate(deck: CardsList): boolean {
		// console.log(deck.length)

		let totalCards = 0;
		let hasBasic = false;

		for (let i = 0; i < deck.length; i++) {
			let card: any = deck[i];
			totalCards += card.count;
			if (card.isBasic) hasBasic = true;
			if (card.count > 4 && card.cardtype != "energy")
				throw new Error(
					"[INVALID DECK] A Deck can only have upto 4 copies of a card"
				);
		}
		if (!hasBasic)
			throw new Error(
				"[INVALID DECK] A deck must have atleast one basic pokemon card"
			);
		console.log(totalCards);
		if (totalCards !== 60)
			throw new Error(
				"[INVALID DECK] The deck must contain exactly 60 cards"
			);
		return true;
	}
}
