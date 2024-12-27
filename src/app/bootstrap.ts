
import mySqlDb, { MySQLDB_CONFIG } from "./datastore/mysql-db";

import { merge } from "lodash";

export default async function( appLevel:'concrete'|'mini', options?:{
    mysql:MySQLDB_CONFIG,
}){

    options = merge({
        mysql:{
            host:process.env.MYSQL_HOST,
            user:process.env.MYSQL_USER,
            password:process.env.MYSQL_PASSWORD,
            port:Number(process.env.MYSQL_PORT),
            database:process.env.MYSQL_DATABASE,
            connectionLimit:Number(appLevel == 'concrete' ? process.env.MYSQL_STANDARD_POOL_CONNECTION_LIMIT : 
            process.env.MYSQL_MINI_POOL_CONNECTION_LIMIT),
        } as MySQLDB_CONFIG,
    } , options);
    
    await mySqlDb.load(options.mysql);
};
