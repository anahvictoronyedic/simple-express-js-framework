
import MySQLDB, { MySQLDB_CONFIG } from "./datastore/mysql-db";

import { merge } from "lodash";
import dotenv from "dotenv";
import path from "path";
import CoreRoutines from "./services/core-routines/core-routines";
import Constants from "./abstracts/constants";

// initialize configuration
dotenv.config();

// make sure node_env is always set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

process.env.APP_ROOT_PATH = path.join(__dirname , '../../');

console.log('process.env.APP_ROOT_PATH : ',process.env.APP_ROOT_PATH);

export default async function( appLevel:'concrete'|'mini', options?:{
    mysql:MySQLDB_CONFIG,
}){

    const mysqlConfig:MySQLDB_CONFIG = {
        host:process.env.MYSQL_HOST,
        user:process.env.MYSQL_USER,
        password:process.env.MYSQL_PASSWORD,
        port:Number(process.env.MYSQL_PORT),
        database:process.env.MYSQL_DATABASE,
        connectionLimit:Number(appLevel === 'concrete' ? process.env.MYSQL_CONCRETE_POOL_CONNECTION_LIMIT :
        process.env.MYSQL_MINI_POOL_CONNECTION_LIMIT),
        multipleStatements:true,
    };

    options = merge({
        mysql:mysqlConfig,
    } , options);

    const mySqlDb = new MySQLDB();
    CoreRoutines.objectStore.set(Constants.GLOBAL_OBJECT_KEYS.system.mysql,mySqlDb);

    await mySqlDb.load(options.mysql);
};
