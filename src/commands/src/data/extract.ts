import { findCard, findSet, findAll } from "./tcgapi";
import Tools from "../utils/tools";

import * as fs from "fs";



console.log("testt")
if(!fs.existsSync("attacks.json")) fs.writeFileSync("attacks.json",JSON.stringify({}));
if(!fs.existsSync("abilities.json")) fs.writeFileSync("abilities.json",JSON.stringify({}));
if(!fs.existsSync("trainers.json")) fs.writeFileSync("trainers.json",JSON.stringify({}));

if(!fs.existsSync("attacksF.json")) fs.writeFileSync("attacksF.json",JSON.stringify({}));
if(!fs.existsSync("abilitiesF.json")) fs.writeFileSync("abilitiesF.json",JSON.stringify({}));
if(!fs.existsSync("trainersF.json")) fs.writeFileSync("trainersF.json",JSON.stringify({}));



let attacks: any = JSON.parse(fs.readFileSync("attacks.json").toString());
let abilities: any = JSON.parse(fs.readFileSync("abilities.json").toString());
let trainers: any = JSON.parse(fs.readFileSync("trainers.json").toString());

let attacksF: any = JSON.parse(fs.readFileSync("attacksF.json").toString());
let abilitiesF: any = JSON.parse(fs.readFileSync("abilitiesF.json").toString());
let trainersF: any = JSON.parse(fs.readFileSync("trainersF.json").toString());


let set = "sv";

findAll(`set.id:swsh* regulationMark:G`).then((result:any) => {

let total = result.length;

console.log("SWSH G - " + total);
for (let i = 1; i < total; i++) {

  let card = result[i]
//  console.log(card.supertype)
    if (card.supertype == "Trainer") {
      console.log(card.supertype)

  //    card.abilities.forEach((ability: any) => {
        let id: string = Tools.toId(card.name)
        if (trainers[id]) {
          trainers[id].otherCards.push(card.id);
        }
        if (!trainers[id]) {
          trainers[id] = card;

          trainers[id].otherCards = []
        }
    //  })
    }

    if (card.abilities) {
      card.abilities.forEach((ability: any) => {
        let id: string = Tools.toId(ability.name);
        if (abilities[id]) {
          abilities[id].others.push(ability.text);
          abilities[id].pokemon.push(card.id);
          abilities[id].sets.push(set)
        }
        if (!abilities[id]) {
          abilities[id] = {
            name: ability.name,
            effect: ability.text,
            others: [],
            pokemon: [card.id],
            sets: [set]
          };
        }
      })
    }

    if (card.attacks) {
        card.attacks.forEach((attack: any) => {
          let id: string = Tools.toId(attack.name);
          if (attacks[id]) {
            attacks[id].others.push(attack.text);
            attacks[id].pokemon.push(card.id);
            attacks[id].sets.push(set)
            attacks[id].otherdamages.push(attack.damage)
            if(!attacks[id].othercosts.includes(attack.cost)) attacks[id].othercosts.push(attack.cost)
          }
          if (!attacks[id]) {
            attacks[id] = {
              name: attack.name,
              effect: attack.text,
              others: [],
              pokemon: [card.id],
              cost: attack.cost,
              othercosts: [],
              sets: [set],
              damage : attack.damage,
              otherdamages: [attack.damage]
            
            };
          }
        });
      }
    }

      fs.writeFileSync("./abilities.json",JSON.stringify(abilities))
fs.writeFileSync("./attacks.json",JSON.stringify(attacks))
fs.writeFileSync("./trainers.json",JSON.stringify(trainers))





}).catch((e) => {
    console.log("SET ERROR : " + e.message);
    process.exit(-1)

  })

  findAll(`set.id:sv* regulationMark:G`).then((result:any) => {

    let total = result.length;
    
    console.log("SV G - " + total);
    for (let i = 1; i < total; i++) {
    
      let card = result[i]
    //  console.log(card.supertype)
        if (card.supertype == "Trainer") {
          console.log(card.supertype)
    
      //    card.abilities.forEach((ability: any) => {
            let id: string = Tools.toId(card.name)
            if (trainers[id]) {
              trainers[id].otherCards.push(card.id);
            }
            if (!trainers[id]) {
              trainers[id] = card;
    
              trainers[id].otherCards = []
            }
        //  })
        }
    
        if (card.abilities) {
          card.abilities.forEach((ability: any) => {
            let id: string = Tools.toId(ability.name);
            if (abilities[id]) {
              abilities[id].others.push(ability.text);
              abilities[id].pokemon.push(card.id);
              abilities[id].sets.push(set)
            }
            if (!abilities[id]) {
              abilities[id] = {
                name: ability.name,
                effect: ability.text,
                others: [],
                pokemon: [card.id],
                sets: [set]
              };
            }
          })
        }
    
        if (card.attacks) {
            card.attacks.forEach((attack: any) => {
              let id: string = Tools.toId(attack.name);
              if (attacks[id]) {
                attacks[id].others.push(attack.text);
                attacks[id].pokemon.push(card.id);
                attacks[id].sets.push(set)
                attacks[id].otherdamages.push(attack.damage)
                if(!attacks[id].othercosts.includes(attack.cost)) attacks[id].othercosts.push(attack.cost)
              }
              if (!attacks[id]) {
                attacks[id] = {
                  name: attack.name,
                  effect: attack.text,
                  others: [],
                  pokemon: [card.id],
                  cost: attack.cost,
                  othercosts: [],
                  sets: [set],
                  damage : attack.damage,
                  otherdamages: [attack.damage]
                
                };
              }
            });
          }
        }
    
          fs.writeFileSync("./abilities.json",JSON.stringify(abilities))
    fs.writeFileSync("./attacks.json",JSON.stringify(attacks))
    fs.writeFileSync("./trainers.json",JSON.stringify(trainers))
    
    
    
    
    
    }).catch((e) => {
        console.log("SET ERROR : " + e.message);
        process.exit(-1)
    
      })


      findAll(`set.id:swsh* regulationMark:F`).then((result:any) => {
        
        let total = result.length;
        
        console.log("SWSH F - " + total);
        for (let i = 1; i < total; i++) {
        
          let card = result[i]
        //  console.log(card.supertype)
            if (card.supertype == "Trainer") {
              console.log(card.supertype)
        
          //    card.abilities.forEach((ability: any) => {
                let id: string = Tools.toId(card.name)
                if (trainersF[id]) {
                  trainersF[id].otherCards.push(card.id);
                }
                if (!trainersF[id]) {
                  trainersF[id] = card;
        
                  trainersF[id].otherCards = []
                }
            //  })
            }
        
            if (card.abilities) {
              card.abilities.forEach((ability: any) => {
                let id: string = Tools.toId(ability.name);
                if (abilitiesF[id]) {
                  abilitiesF[id].others.push(ability.text);
                  abilitiesF[id].pokemon.push(card.id);
                  abilitiesF[id].sets.push(set)
                }
                if (!abilitiesF[id]) {
                  abilitiesF[id] = {
                    name: ability.name,
                    effect: ability.text,
                    others: [],
                    pokemon: [card.id],
                    sets: [set]
                  };
                }
              })
            }
        
            if (card.attacks) {
                card.attacks.forEach((attack: any) => {
                  let id: string = Tools.toId(attack.name);
                  if (attacksF[id]) {
                    attacksF[id].others.push(attack.text);
                    attacksF[id].pokemon.push(card.id);
                    attacksF[id].sets.push(set)
                    attacksF[id].otherdamages.push(attack.damage)
                    if(!attacksF[id].othercosts.includes(attack.cost)) attacksF[id].othercosts.push(attack.cost)
                  }
                  if (!attacksF[id]) {
                    attacksF[id] = {
                      name: attack.name,
                      effect: attack.text,
                      others: [],
                      pokemon: [card.id],
                      cost: attack.cost,
                      othercosts: [],
                      sets: [set],
                      damage : attack.damage,
                      otherdamages: [attack.damage]
                    
                    };
                  }
                });
              }
            }
        
              fs.writeFileSync("./abilitiesF.json",JSON.stringify(abilitiesF))
        fs.writeFileSync("./attacksF.json",JSON.stringify(attacksF))
        fs.writeFileSync("./trainersF.json",JSON.stringify(trainersF))
        
        
        
        
        
        }).catch((e) => {
            console.log("SET ERROR : " + e.message);
            process.exit(-1)
        
          })
        
          findAll(`set.id:sv* regulationMark:F`).then((result:any) => {
        
            let total = result.length;
            
            console.log("SV F - " + total);
            for (let i = 1; i < total; i++) {
            
              let card = result[i]
            //  console.log(card.supertype)
                if (card.supertype == "Trainer") {
                  console.log(card.supertype)
            
              //    card.abilities.forEach((ability: any) => {
                    let id: string = Tools.toId(card.name)
                    if (trainersF[id]) {
                      trainersF[id].otherCards.push(card.id);
                    }
                    if (!trainersF[id]) {
                      trainersF[id] = card;
            
                      trainersF[id].otherCards = []
                    }
                //  })
                }
            
                if (card.abilities) {
                  card.abilities.forEach((ability: any) => {
                    let id: string = Tools.toId(ability.name);
                    if (abilitiesF[id]) {
                      abilitiesF[id].others.push(ability.text);
                      abilitiesF[id].pokemon.push(card.id);
                      abilitiesF[id].sets.push(set)
                    }
                    if (!abilitiesF[id]) {
                      abilitiesF[id] = {
                        name: ability.name,
                        effect: ability.text,
                        others: [],
                        pokemon: [card.id],
                        sets: [set]
                      };
                    }
                  })
                }
            
                if (card.attacks) {
                    card.attacks.forEach((attack: any) => {
                      let id: string = Tools.toId(attack.name);
                      if (attacksF[id]) {
                        attacksF[id].others.push(attack.text);
                        attacksF[id].pokemon.push(card.id);
                        attacksF[id].sets.push(set)
                        attacksF[id].otherdamages.push(attack.damage)
                        if(!attacksF[id].othercosts.includes(attack.cost)) attacksF[id].othercosts.push(attack.cost)
                      }
                      if (!attacksF[id]) {
                        attacksF[id] = {
                          name: attack.name,
                          effect: attack.text,
                          others: [],
                          pokemon: [card.id],
                          cost: attack.cost,
                          othercosts: [],
                          sets: [set],
                          damage : attack.damage,
                          otherdamages: [attack.damage]
                        
                        };
                      }
                    });
                  }
                }
            
                  fs.writeFileSync("./abilitiesF.json",JSON.stringify(abilitiesF))
            fs.writeFileSync("./attacksF.json",JSON.stringify(attacksF))
            fs.writeFileSync("./trainersF.json",JSON.stringify(trainersF))
            
            
            
            
            
            }).catch((e) => {
                console.log("SET ERROR : " + e.message);
                process.exit(-1)
            
              })


