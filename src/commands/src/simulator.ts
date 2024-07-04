import { ObjectReadWriteStream, ReadWriteStream } from "./utils/streams";

import { Game, Player, PlayerID } from "./game";
import { GameInitData } from "./game/game";

export type StartData = {
  id: string;
  p1: any;
  p2: any;
  rules?: Record<string, boolean>;
  format?: string;
};

export class Simulator extends ObjectReadWriteStream<string>{
 // private stream: ReadWriteStream;
  private logs: string[];
  private game: Game | any;

  constructor(streamListener?: any) {
    super()
  //  this.stream = new ReadWriteStream();
    this.logs = [];
    this.game = null;
    
  }

  _write(data: string): void {
    console.log(data.slice(0,300));
    this.logs.push(data);
    this.push(data + "\n");

  }

  _writeLine(type: string, message: string): void {
    console.log(type + " "+message.slice(0,100))

    type = type.replace(">","")
    switch (type) {
      case "start":
        {
          if (!message)
            return this.inputError(
              "'start' protocol received invalid or missing argument (Expected a JSON)"
            );

          let data: StartData = JSON.parse(message);

          if (!data.p1 || !data.p2)
            return this.inputError("Please provide both players detail");
          if (!data.id)
            return this.inputError("Each game requires an unique ID");
          let gameData: GameInitData = {
            players: [data.p1, data.p2],
            id: data.id,
          };
          try {
          this.game = new Game(gameData);
          this.bindEventListeners();
          } catch (e) {
            console.log(e);
          }

          this.game.init();
        
    
        }
        break;

      case "p1":
      case "p2": {
     //   console.log(message + "====")
        this.parsePlayerProtocol(type, message);
      }
      break

      default:
        this.inputError("Invalid message type");
    }
  }

  _writeLines(data: string): void {
    for (const chunk of data.split("\n")) {
      if (chunk.startsWith(">")) {
        let type: string = chunk.split(" ")[0];
        let message: string = chunk.replace(type, "");
        this._writeLine(type, message.trim());
      }
    }
  }

  bindEventListeners() {
    this.game.on("initiated", (data:any) => { this.handleInitiated(data)});

    this.game.on("validateFail", (data:any) => { this.handleValidateFail(data)});
    this.game.on("choose",(data:any) => { this.handleChooseEvents(data)});
    this.game.on("invaliddeck", (data:any) => { this.handleChooseEvents(data) });
    this.game.on("msg", (data:any) => { this.handleCustomMessage(data) });
    this.game.on("sideupdate", (data:any) => { this.handleSideUpdate(data) });
    this.game.on("playerupdate", (data:any) => { this.handlePlayerUpdate(data) });
    this.game.on("reveal", (data:any) => { this.handleReveal(data) });
    this.game.on("choice", (data:any) => { this.handleChoices(data) });

    this.game.on("activepokemon",(data:any) => { this.handleActivePokemon(data)})
    this.game.on("benchupdate",(data:any) => { this.handleBenchUpdate(data)})
    this.game.on("ready", (data:any) => { this.handlePlayerReady(data) });
    this.game.on("gamestart", (data:any) => { this.handleGameStart(data) });
    this.game.on("turnupdate", (data:any) => { this.handleTurnUpdate(data) });

    this.game.on("pmerror", (data:any) => { this.handlePMError(data) });


  }

  // @Player-Related-Methods
  // @Handling >p1 Protocol

  parsePlayerProtocol(p: PlayerID, args: string) {
    let argsA = args.split(" ");
    let type = argsA[0];


    console.log("[SIMULATOR] : Test")
    console.log("[SIMULATOR] : " + args.split(" "))

    switch (type) {
      case "activepokemon":
        {

          let pokemon = argsA[1];
          if (!pokemon || pokemon.length < 2)
            this.inputError(
              "Not enough arguments specified (Expected : Pokemon)",
              type
            );
          try {
            console.log(p + " --------")
            this.game.chooseActive(p, pokemon);
          } catch (e: any) {
            console.log(e);
            this.inputError(e.message, "ERROR");
          }
        }
        break;

        case "bench":
          {
  
            console.log("@@@@@@ " + p)
            let pokemon = argsA[1];
            if (!pokemon || pokemon.length < 2)
              this.inputError(
                "Not enough arguments specified (Expected : Pokemon)",
                type
              );
            try {
              console.log(p + " --------")
              this.game.addToBench(p, pokemon);
            } catch (e: any) {
              console.log(e);
              this.inputError(e.message, "ERROR");
            }
          }
          break;

      case "ready": {
        if(this.game.started) return;
        try {
          this.game.playerReady(p);

        } catch (e: any) {
          this.inputError(e.message, type);
        }
      }
    }
  }
  
  // @Event-Listeners

  handleInitiated(data:any) {
    this._write(`|all|init|${JSON.stringify(data)}`)
  }

  handleValidateFail(data: any) {
   // console.log(data);
  }

  handleChooseEvents(data: any) {
    switch(data.event) {
      case "activepokemon": {
        this._write(`|${data.player}|action|choose|activepokemon`)
      }
      break;
    }

  }

  handleCustomMessage(data: any) {
   let to = data.to;
   this._write(`|${to}|message|${new Date().getTime()}|${data.msg}`)
  }

  handlePMError(data: any) {
    this._write(`|${data.player}|pmerror|${data}`)
    }

  handlePlayerUpdate(data: any) {
    //console.log(data);
  }

  
  handleSideUpdate(data: any) {
    if(!this.game.turn) return  this._write(`|${data.player}|sideupdate|${data.player}|${JSON.stringify(data.data)}`)
    ;
    this._write(`|all|sideupdate|${data.player}|${JSON.stringify(data.data)}`)
  }

  handleReveal(data: any) {
    console.log(data);
  }

  handleActivePokemon(data:any) {
    let p = data.player;
    let pokemon = data.active;
    this._write(`|${p}|activepokemon|true`);
    if(this.game.started) this._write(`|all|${p}|activepokemon|${JSON.stringify(pokemon)}`)
  }

  handleBenchUpdate(data:any) {
    let p = data.player;
    let pokemon = data.bench;
    this._write(`|${p}|benchupdate|${JSON.stringify(pokemon)}`)
    if(this.game.started) this._write(`|all|${p}|benchupdate|${JSON.stringify(pokemon)}`)
  }


  handlePlayerReady(data: any) {
    let p = data.player;
    
  this._write(`|${p}|ready|true`);
  this._write(`|all|${p}|ready`)

  }

  handleChoices(data: any) {
    let player  = data.player.id ? data.player.id : data.player;
    let choices = data.choices.join(",");
    this._write(`|${player}|action|choices|${choices}|${JSON.stringify(data.game)}`)
  }

  handleGameStart(data: any) {
    let p = data.whoseTurn;
    let gamedata = data.data;
    let msg = `|all|start|${JSON.stringify(gamedata)}`
    this._write(msg);
    this._write(`|all|message|${new Date().getTime()}|${p} was randomly choosen to move first`);
    }

  handleTurnUpdate(data: any) {
    let p = data.whoseTurn;
    //console.log(data);
  }

  // @Error-Logging

  inputError(msg: string, type?: string) {
    this._write(`|inputerror|${msg} [PROToCOL : ${type}]`);
  }
}

export default Simulator;
