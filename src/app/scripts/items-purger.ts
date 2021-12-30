
import { PLAIN_OBJECT, Script } from "../abstracts/types";
import bootstrap from "../bootstrap";

import itemsModel from "../models/items/items";

/*
Load the bootstrap program. Use mini option to indicate the application only need a little amount of resources, an economical choice
that could save substancial money as the server scales.
*/
bootstrap('mini').then();

export class ItemsPurger implements Script{

    async run(args?: PLAIN_OBJECT){
        // clear the items that needs purging 
        itemsModel.purgeItems();
    }
}

const itemsPurger = new ItemsPurger;

// run the script
itemsPurger.run().then().catch((e)=>{
    console.error('script failed',e);
});