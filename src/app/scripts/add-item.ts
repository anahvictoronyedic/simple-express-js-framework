
import { isString } from "lodash";
import Constants from "../abstracts/constants";
import { PLAIN_OBJECT, Script } from "../abstracts/types";
import bootstrap from "../bootstrap";
import mySqlDb from "../datastore/mysql-db";
import util from "util";

/*
Load the bootstrap program. Use mini option to indicate the application only need a little amount of resources.
*/
bootstrap('mini').then();

export class AddItem implements Script{

    async run(args?: PLAIN_OBJECT){
        const slug = args.slug;
        if( !isString(slug) ) throw new Error('cannot add item due to invalid slug');
        await util.promisify(mySqlDb.getHandler().query)({
            sql:`INSERT INTO ${Constants.itemsTableName}(slug) VALUES(?)`,
            values:[slug],
        })
    }
}

const argv = process.argv.slice(2);
new AddItem().run( {
    slug:argv.length>0?argv[0]:null,
} ).then().catch((e)=>{
    console.error('script failed',e)
});