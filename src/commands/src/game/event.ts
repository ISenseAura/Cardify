import { EventEmitter } from "events";

 let ev: EventEmitter = new EventEmitter()

 ev.on("test",(hello => {
    console.log(hello)
}))
ev.emit("test","hello")

