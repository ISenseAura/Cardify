import path = require("path");
import { User } from "../users";
import * as fs from "fs";

import { Tools } from "../tools";
let tools = new Tools();
const rootFolder = path.resolve(__dirname, '..', '..',"..");


class Currency {
	name: string;
	perUnit: number;
    boss:string;

	givePerSec: number;
	givePerHour: number;
	initialCurrency: number;

	dir: string;
	loc: string;
	db: Record<string, any>;

	constructor() {
		this.name = "Points";
		this.perUnit = 100;
        this.boss = "Cardiy"

		this.givePerHour = 0.9;
		this.givePerSec = 0.000005;
		this.initialCurrency = 10.00;

		this.dir = path.join(rootFolder, "databases");
		this.loc = this.dir + "/currency.json";

		if (!fs.existsSync(this.loc))
			fs.writeFileSync(this.loc, JSON.stringify({ logs: {} }));
		this.db = JSON.parse(fs.readFileSync(this.loc).toString());
	}

	add(user: User, amount: number, by: string, reason: string) {
		let userdb = this.db[user.id];
		if (!userdb) this.db[user.id] = { total: this.initialCurrency };
		userdb = this.db[user.id];
		userdb.total = (parseFloat(userdb.total) + amount).toFixed(2);
		this.log(user, amount, by, reason);
		this.update();
	}

    awardPerSec(user:User,secs:number) {
        let amount: number = secs * this.givePerSec;
		if(amount < 0.01) return;
        this.add(user,amount,this.boss,"Award as staying online for " + secs + " seconds");
    }

	remove(user: User, amount: number, by: string, reason: string) {
		this.add(user, -amount, by, reason);
	}

	log(to: User, amount: number, by: string, reason: string) {
		let date = tools.toTimestampString(new Date()).split(" ")[0];
		if (!this.db.logs[date]) this.db.logs[date] = [];
		this.db.logs[date].push(
			`${to.id} was ${amount < 0 ? "taken" : "given"} ${
				amount + " " + this.name
			} by ${by} (${reason}) `
		);
	}

    get(user:User) {
        if(!this.db[user.id]) return 0.00 + " " + this.name;
        return this.db[user.id].total + " " + this.name;
    }

	update() {
		fs.writeFileSync(this.loc, JSON.stringify(this.db));
	}
}


export let currency = new Currency();