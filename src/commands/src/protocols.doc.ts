/*
@Writing-To-Simulator

@ PLAYER-DATA-INPUT 
   {
    userid:"pokem9n",
    deck: Arracy<cards>
   }

>start {id: uniqueID, p1 : { PLAYER }, p2 : { PLAYER }, rules : { RULES }, format : "formatID"} \n
>p1 activepokemon CARD_ID
>p1 bench CARD_ID
>p1 retreat TO_CARD_ID
>p1 attach CARD_ID (of EVOLUTION | STADIUM | ENERGY ) TO_CARD_ID 
>p1 use CARD_ID (of ITEM | SUPPORTER )
>p1 attack NUMBER ABILITY|MOVE
>p1 ready


@Reading-From-Simulator
 GENERAL_FORMAT : |broadcastTo|type|subtype|arguments

 broadcastTo = "all" | "p1" | "p2"
 type = "action" | "update" | "sideupdate" | "init" | "start" | "turnupdate" | "message"
 subtype = "choose" | "choices" | "takeprize" (only for type = "action")


 |all|init|JSON(GameData)
 |p1|action|choose|activepokemon
 |p1|action|choices|bench,attachenergy,usecard,pass|GAME_DATA
 |p1|message|timestamp|message






*/