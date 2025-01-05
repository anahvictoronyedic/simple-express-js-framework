
import bootstrap from "../bootstrap";
import { PLAIN_OBJECT, Script } from "../abstracts/types";
import ItemsModel from "../models/items/items";

export class ItemsPurger implements Script{

    private itemsModel:ItemsModel;

    constructor(){
        this.init();
    }

    private init(){
        this.itemsModel = new ItemsModel();
        this.itemsModel.init({});
    }

    async run(args?: PLAIN_OBJECT){
        // clear the items that needs purging
        this.itemsModel.purgeItems();
    }
}

/*
Load the bootstrapper and use mini option to indicate the application only need a little amount of resources, an economical choice
that could save substancial money as the server scales.
*/
bootstrap('mini').then(()=>{

    const itemsPurger = new ItemsPurger();

    // run the script
    itemsPurger.run().then(()=>{
        console.log('script executed successfully');
    }).catch((e)=>{
        console.error('script failed',e);
    });
});
