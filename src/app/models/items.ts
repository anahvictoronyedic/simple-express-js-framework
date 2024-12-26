
import { ID, Model } from "../../types";
import mySqlDb from "../datastore/mysql-db";
import util from 'util';

class ItemsModel implements Model{

    private readonly itemsTableName = 'items';

    private readonly itemsQuantitiesTableName = 'items_quantities';

    private readonly dbHandler = mySqlDb.getHandler() ;
    private readonly queryFunction = util.promisify(this.dbHandler.query);

    async sellItem( idOrSlug:ID ,quantity:number ):Promise<any>{

        const queryPart = `item_id = ${this.getIdQueryFragment(idOrSlug)} AND valid_till > CURRENT_TIMESTAMP AND obsolete = FALSE`;
        
        const query = `
        SET @quantity_sum = 0;
        UPDATE ${this.itemsQuantitiesTableName} SET @quantity_sum := @quantity_sum + quantity , 
        obsolete = CASE WHEN ? >= @quantity_sum THEN FALSE ELSE TRUE ,
        quantity = CASE WHEN ? >= @quantity_sum THEN 0 ELSE @quantity_sum - ?
        WHERE ${queryPart} AND ? >= ( SELECT SUM(quantity) WHERE ${queryPart} )`;
        
        return this.queryFunction({
            sql:query,
            values:[quantity , quantity,quantity , idOrSlug,quantity , idOrSlug],
        }).catch((err)=>{
            return Promise.reject( {reason:'error' , err} );
        }).then((results:any)=>{
            if(results.affectedRows > 0 ) {

                // Call purge function, to clear new obsolete data. The result of purgeItems is not critical to the local logic
                // hence do not await
                this.purgeItems();

                return Promise.resolve();
            }
            return Promise.reject( {reason:'insufficient-item-quantity' } );
        });
    }

    async addItemQuantity( idOrSlug:ID , quantity:number, validTillEpochMillis:number ) {
        
        const query = `
        INSERT INTO ${this.itemsQuantitiesTableName}( item_id , quantity , valid_till ) 
        VALUES( ${this.getIdQueryFragment(idOrSlug)} , ? , FROM_UNIXTIME(?) ) `;

        return this.queryFunction({
            sql:query,
            values:[idOrSlug , quantity , validTillEpochMillis]
        }).then((results:any)=>{
            if(results.affectedRows > 0 ) return Promise.resolve();
            return Promise.reject();
        });
    }

    async getItemQuantity( idOrSlug:ID ) {

        const query = `
        SELECT SUM(quantity) as total_quantity , MIN( valid_till ) as min_valid_till FROM ${this.itemsQuantitiesTableName}
        WHERE item_id = ${this.getIdQueryFragment(idOrSlug)} AND obsolete = FALSE
        HAVING min_valid_till > CURRENT_TIMESTAMP
        `;

        return this.queryFunction({
            sql:query,
            values:[idOrSlug]
        }).then((results:any)=>{
            return results.length > 0 ? results.rows[0]['total_quantity'] : 0;
        });
    }

    async purgeItems(){
        const query = `
        DELETE FROM ${this.itemsQuantitiesTableName}
        WHERE obsolete = TRUE OR valid_till < CURRENT_TIMESTAMP`;
        return this.queryFunction({
            sql:query,
        });
    }

    private getIdQueryFragment( idOrSlug:ID ){
        return `${ typeof idOrSlug == 'number' ? '?' : `( SELECT id FROM ${this.itemsTableName} WHERE slug = ? )` }`;
    }
}

const itemsModelInst = new ItemsModel;

export default itemsModelInst;