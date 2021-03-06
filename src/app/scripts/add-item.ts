import bootstrap from "../bootstrap";
import { isString } from "lodash";
import Constants from "../abstracts/constants";
import { PLAIN_OBJECT, Script } from "../abstracts/types";
import util from "util";
import MySQLDB from "../datastore/mysql-db";
import CoreRoutines from "../services/core-routines/core-routines";

export class AddItem implements Script{

    private mySqlDb = CoreRoutines.getObjectSafely<MySQLDB>( Constants.GLOBAL_OBJECT_KEYS.system.mysql );

    async run(args?: PLAIN_OBJECT){

        const handler = this.mySqlDb.getHandler();

        const slug = args.slug;
        if( !isString(slug) ) throw new Error('cannot add item due to invalid slug');
        await util.promisify(handler.query)
        // NOTE: this is ugly, util.promisify should allow context to be defined. A better solution is needed.
        .bind(handler)({
            sql:`INSERT INTO ${Constants.itemsTableName}(slug) VALUES(?)`,
            values:[slug],
        })
    }
}

/*
Load the bootstrapper and use mini option to indicate the application only need a little amount of resources.
*/
bootstrap('mini').then(()=>{

    const argv = process.argv.slice(2);
    new AddItem().run( {
        slug:argv.length>0?argv[0]:null,
    } ).then(()=>{
        console.log('script executed successfully');
    }).catch((e)=>{
        console.error('script failed',e);
    });
});
