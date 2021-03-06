
import { ID, Model } from "../../abstracts/types";
import util from 'util';
import Constants from "../../abstracts/constants";
import CoreRoutines from "../../services/core-routines/core-routines";
import MySQLDB from "../../datastore/mysql-db";
import { QueryFunction, QueryOptions } from "mysql";

export default class ItemsModel implements Model<any>{

    public readonly INSUFFICIENT_QUANTITY_REASON = 'insufficient-item-quantity';

    private mySqlDb :MySQLDB;

    private queryFunction : (options:string|QueryOptions)=>Promise<any>;

    async init(config: any){

        this.mySqlDb = CoreRoutines.getObjectSafely<MySQLDB>( Constants.GLOBAL_OBJECT_KEYS.system.mysql );

        const dbHandler = this.mySqlDb.getHandler();

        // promisify the function to make it thenable.
        this.queryFunction = util.promisify(dbHandler.query)
        // NOTE: this is ugly, util.promisify should allow context to be defined. A better solution is needed.
        .bind(dbHandler);
    }

    async sellItem( idOrSlug:ID ,quantity:number ):Promise<any>{

        const mySqlResultVariableName = '@success';
        const mySqlItemIdVariableName = '@item_id';

        const query = `
        SET ${mySqlResultVariableName} := FALSE;
        ${ this.isIdASlug(idOrSlug) ? this.getIdQueryFragment(idOrSlug , mySqlItemIdVariableName) : `SET ${mySqlItemIdVariableName} := ?` };`
        // call the mysql procedure
        +`CALL sell_by_quantity( ${mySqlItemIdVariableName} , ? , ${mySqlResultVariableName} );
        SELECT ${mySqlResultVariableName};`;

        return this.queryFunction({
            sql:query,
            values:[idOrSlug,quantity],
        }).catch((err:any)=>{
            return Promise.reject( {reason:'error' , err} );
        }).then((results:any)=>{

            if(results.length > 0

                // this expression uses mysql representation of true and false, which is 1 and 0 respectively.
                && results[results.length-1][0][mySqlResultVariableName] == 1){

                return Promise.resolve();
            }
            return Promise.reject( {reason:this.INSUFFICIENT_QUANTITY_REASON } );
        });
    }

    async addItemQuantity( idOrSlug:ID , quantity:number, expiry:number ) {

        const query = `
        INSERT INTO ${Constants.itemsQuantitiesTableName}( item_id , quantity , expiry )
        VALUES( ${this.getIdQueryFragment(idOrSlug)} , ? , `+
        // convert from milliseconds to seconds by mutiplying with 0.001
        `FROM_UNIXTIME(? * 0.001) `
        +`) `;

        return this.queryFunction({
            sql:query,
            values:[idOrSlug , quantity , expiry]
        }).then((results:any)=>{
            if(results.affectedRows > 0 ) return Promise.resolve();
            return Promise.reject();
        });
    }

    async getItemQuantity( idOrSlug:ID ) :Promise<{quantity:number,validTill:number}>{

        const query = `
        SELECT SUM(quantity) as total_quantity , MIN( UNIX_TIMESTAMP( expiry ) * 1000 ) as min_expiry_epoch_millis
        FROM ${Constants.itemsQuantitiesTableName}
        WHERE item_id = ${this.getIdQueryFragment(idOrSlug)} AND expiry > CURRENT_TIMESTAMP AND obsolete = FALSE
        `;

        return this.queryFunction({
            sql:query,
            values:[idOrSlug]
        }).then((results:any)=>{

            const result:any = {quantity:0,validTill:null};

            if(results.length > 0){
                const row = results[0];
                const quantity = row.total_quantity;
                if( quantity > 0 ){
                    result.quantity = quantity;
                    result.validTill = row.min_expiry_epoch_millis;
                }
            }

            return result;
        });
    }

    async itemExists( idOrSlug:ID ) :Promise<boolean>{

        const query = `
        SELECT id FROM ${Constants.itemsTableName} WHERE id = ${this.getIdQueryFragment(idOrSlug)}
        `;

        return this.queryFunction({
            sql:query,
            values:[idOrSlug]
        }).then((results:any)=>{
            return results.length > 0;
        });
    }

    async purgeItems(){
        const query = `
        DELETE FROM ${Constants.itemsQuantitiesTableName}
        WHERE obsolete = TRUE OR expiry < CURRENT_TIMESTAMP`;
        return this.queryFunction({
            sql:query,
        });
    }

    private getIdQueryFragment( idOrSlug:ID , sqlVarNameForSlug?:string ){
        return this.isIdASlug(idOrSlug) ? `${ ` ${sqlVarNameForSlug ? '' : '(' } SELECT id ${ sqlVarNameForSlug ? `INTO ${sqlVarNameForSlug}`:'' } FROM ${Constants.itemsTableName} WHERE slug = ? ${sqlVarNameForSlug ? '' : ')' } ` } ` : '?';
    }

    private isIdASlug(idOrSlug:ID){
        return typeof idOrSlug !== 'number';
    }
}
