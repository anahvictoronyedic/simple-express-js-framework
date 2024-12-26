
import mySqlDb, { MySQLDB_CONFIG } from "./datastore/mysql-db";

import { merge } from "lodash";

export default async function(options?:{
    mysql:MySQLDB_CONFIG,
}){

    options = merge({
        mysql:{
            
        } as MySQLDB_CONFIG,
    } , options);
    
    await mySqlDb.load(options.mysql);
};
