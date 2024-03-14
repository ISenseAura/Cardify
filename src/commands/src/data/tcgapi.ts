import pokemon from 'pokemontcgsdk'

pokemon.configure({apiKey: '211cfd2c-7f19-49de-a9f1-9945ad4a7215'})

export async function findCard(id:string): Promise<string> {
    let card: any = await pokemon.card.find(id)
    return card;
}


export async function findAll(id:string): Promise<string> {
    let card: any = await pokemon.card.all({q:id})
    return card;
}


export async function findSet(id:string): Promise<string> {
    let set: any = await pokemon.set.find(id)
    return set;
}



export async function getAllSupertypes(): Promise<string> {
    let suptypes: any = await pokemon.supertype.all();
    return suptypes;
}