 /*
 @ Choices {
    choose active pokemon
    add bench pokemon
    draw card from deck
    attach energy card
    attach trainer card
    attach item/stadium card
    evolve
    attack
}


 @ Player-Choices {
    choose active pokemon
    add bench pokemon
    retreat a pokemon
    draw card from deck
    attach energy card
    attach trainer card
    attach item/stadium card
    use available abilities
    evolve a pokemon
    attack [turn ends]
}

@ Events {
    init()
    beforeStart()
    start()
    nextTurn()
    duringTurn()
    afterTurnEnd()
}

@ Win-Conditions {
    - take all opponent's prize cards
    - Knock out all opponent's on-field pokemon
    - If opponent has no card to draw (0 cards in deck)
}

@ Special-Or-Status-Conditions {
    Asleep - 
    Confused -
    Poisoned -
    Paralyzed -
}


@ On-Game-Start {
    - flip a coin to decide who moves first
    - shuffle your deck and draw 7 cards
    - check if you have atleast one basic card
      if you don't then {
        - reveal your hand to opponent
        - put back your hand into the deck
        - shuffle your deck
        - draw 7 cards again
        - your opponent may draw 1 more card
        - repeat until you have atleast 1 basic pokemon card
       }

    - choose one basic pokemon card as your active pokemon
    - you may put upto 5 basic pokemon card on bench 
    - reveal active, bench pokemon
    - turnStart()


}

@ In-A-Single-Turn-Player-Can {
    - draw a card
    - put basic pokemon from hand onto bench (max bench limit : 5)
    - evolve your pokemon (not in 1st turn | as many times | not same pokemon twice)
    - attach energy card to your bench or active pokemon (once per turn)
    - play trainer cards {
        - supporter (once per turn)
        - stadium (once per turn)
        - items (as many times)
    }
    - retreat active pokemon (once per turn)
    - use abilities (as many times)
    - attack (turn ends)
}

@ Turn-Ends-If-A-Player {
    - attacks
}


@ When-Evolution-Takes-Place {
    - the new evolved pokemon keeps all the attached cards (energy cards, evolution cards)
    - keep damage counters also
    - Any effects of attacks affecting previous pokemon ENDs
    - Any effects of special conditions affecting previous pokemon ENDs
    - cannot use attacks/abilities of previous evolution
}


*/