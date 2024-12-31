
import bootstrap from "../bootstrap";

/*
Load the bootstrap program early enough because further imports might immediately depend on it while being imported. 
Use mini option to indicate the application only need a little amount of resources, an economical choice
that could save substancial money as the server scales.
*/
bootstrap('mini').then();

import { PLAIN_OBJECT, Script } from "../abstracts/types";
import itemsModel from "../models/items/items";

export class ItemsPurger implements Script{

    async run(args?: PLAIN_OBJECT){
        // clear the items that needs purging
        itemsModel.purgeItems();
    }
}

const itemsPurger = new ItemsPurger();

// run the script
itemsPurger.run().then(()=>{
    console.log('script executed successfully');
}).catch((e)=>{
    console.error('script failed',e);
});