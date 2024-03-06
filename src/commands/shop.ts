import fs = require("fs");

import { copyPokemonShowdownShaBase, exec, getInputFolders } from "../../tools";
import type { BaseCommandDefinitions } from "../types/command-parser";

import { Packs } from "../pokemon-tcg/packs";
import { shop } from "../pokemon-tcg/shop";

export const commands: BaseCommandDefinitions = {
	shop: {
		command(target, room, user) {
            if(!target) return this.say("Usage : ``.shop add [item type], [item name], [item description],[item price], [image (Optional)]``. Do not include the '[]' brackets")
            let subcmd = target.split(" ")[0];

            switch(subcmd) {
                case "add": {
                 //   this.say(target)
                 if (!user.hasRank(Rooms.get("tcgtabletop"), "+")) return this.say("Access denied.")
                    let opts = target.replace("add","").split(",");
                    this.say(opts)
                    let type = opts[0].trim();
                    let name = opts[1]
                    let description = opts[2]
                    let price = opts[3]
                    let image = opts[4]

                    this.say(shop.addItem(user,name,type,description,price,image))

                }
                break;

                default : return this.say("Usage : ``.shop add [item type], [item name], [item description],[item price], [image (Optional)]``. Do not include the '[]' brackets")
            }
        },
    },
}