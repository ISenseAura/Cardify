import Simulator from "./simulator";

export function sayHello() : string {
    return "Hello";
}

let sim: Simulator = new Simulator();
sim.write("test");
console.log("test")

console.log(sayHello());