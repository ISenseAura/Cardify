/*  Moves Mechanics -  @Author - Pokem9n
*   
*   - This file contains all the moves mechanics and logic related code
* 
* 
* 
*/



import { PokemonCard } from "../cards";
import { Game } from "../game";

export class Moves {
    readonly movesList: Record<string,any>
    constructor(game:Game) {
        this.movesList = {};
    }

    public static hasRequiredEnergy(pokemon:PokemonCard,num:number) : boolean {
        if(!pokemon.moves[num]) throw new Error(`Pokemon has no such move (Moves : ${pokemon.moves}, LookingFor : ${num})`)
        let moveEnergies: any = pokemon.moves[num].energy;
        let totalEnergies: any = pokemon.attachedCards["energy"]
        let totalCount = 0;

        let colorWaleMatched = false;

        Object.keys(totalEnergies).forEach((energy:string) => {
            totalCount += totalEnergies[energy];
            if(moveEnergies[energy] && totalEnergies[energy] >= moveEnergies[energy]) {
                colorWaleMatched = true;
                totalCount -= moveEnergies[energy];
            }
        })

        if(colorWaleMatched && moveEnergies["colorless"] <= totalCount) return true;
        return false;
    }


    // @MOVES_IMPLEMENTATION_STARTS_FROM_HERE

    public static cheerfulcharge(player:any,game:Game,target:PokemonCard) {

        /* @Describe
        * You can use this attack only if you go second, and only during your first turn. 
        * Choose up to 2 of your Benched Pokémon. For each of those Pokémon,
        *  search your deck for a basic Energy card and attach it to that Pokémon. Then, shuffle your deck.",
        */

        if(game.turn !== 2) throw new Error("You can only use this attack if you go second and this is your first turn");
        target.damage(10);
        game.activeAttacks[player.id].push("useenergy")
        game.activeAttacks[player.id].push("useenergy")
        let energies = player.deck.getFromDeck("energy");
        let sendData: any = {};
        sendData.player = player.id
        sendData.energies = energies
        sendData.allowUse = true
        sendData.useCount = 2
        
    }
}