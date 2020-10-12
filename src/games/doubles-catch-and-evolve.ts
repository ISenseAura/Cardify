import type { IGameFile } from '../types/games';
import { EliminationTournament, game as eliminationTournamentGame } from './templates/elimination-tournament';

const name = "Doubles Catch and Evolve";
const description = "Every player is given 2 randomly generated Pokemon to use as their starters. Each battle that you win, you " +
	"must 'catch' 2 of your opponent's Pokemon (add them to your team) and then evolve 2 Pokemon on your team.";

class DoublesCatchAndEvolve extends EliminationTournament {
	additionsPerRound = 2;
	evolutionsPerRound = 2;
	startingTeamsLength = 2;
	maxPlayers = 64;
	defaultTier = 'doublesou';
	requiredAddition = true;
	requiredEvolution = true;
	canReroll = true;
	baseTournamentName = name;
	tournamentDescription = description;
	banlist = ['Burmy', 'Caterpie', 'Combee', 'Kricketot', 'Magikarp', 'Scatterbug', 'Sunkern', 'Tynamo', 'Type: Null', 'Weedle',
		'Wurmple', 'Cosmog', 'Blipbug', 'Snom'];
}

export const game: IGameFile<DoublesCatchAndEvolve> = Games.copyTemplateProperties(eliminationTournamentGame, {
	aliases: ['doublescande', 'doublesce', 'doublescatchevolve', 'dce'],
	class: DoublesCatchAndEvolve,
	description,
	name,
	variants: [
		{
			name: "Monoregion Doubles Catch and Evolve",
			variant: "monoregion",
			variantAliases: ["monogen"],
		},
		{
			name: "Doubles Catch and Evolve Ubers",
			variant: "doublesubers",
		},
		{
			name: "Doubles Catch and Evolve UU",
			variant: "doublesuu",
		},
	],
});
