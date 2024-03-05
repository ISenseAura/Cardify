/*export type ItemType = "pack" | "deck"

export class ShopItem {
    private name: string;
    private description?: string;
    private image?:string;
    private price: number;
    private id: string;
    private type: ItemType
    private updatedOn: Date;
    private addBy: string;
    private payTo: string;

    constructor(name:string,type:ItemType,price:number,addedBy:string,payTo:string) {
        this.name = name;
        this.type = type;
        this.addBy = addedBy
        this.payTo = payTo
        this.price = price;

        this.id = Tools.toId(name + type);
        this.updatedOn = new Date();
    }

    public setDescription(d:string) {
        if(d.length > 230) return "Too long description";
        this.description = d;
    }
    public setImage(d:string){
        this.image = d;
    }

    public setName(d:string){
        this.name = d;
        this.id = Tools.toId(this.name + this.type);
    }

    public setPrice(d:number){
        this.price = d;
    }
}



class Shop {
    private name: string;
    private updatedOn: Date;
    private latestItem: ShopItem;

    private items: Record<string,ShopItem>

}

*/