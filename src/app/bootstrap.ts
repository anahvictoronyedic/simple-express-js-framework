
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
process.env.APP_CONTROLLERS_PATH = path.join( __dirname , '/controllers' );
process.env.APP_MODELS_PATH = path.join( __dirname , '/models' );

console.log('process.env.APP_ROOT_PATH : ',process.env.APP_ROOT_PATH);

let boostrapState:'loading'|'loaded'|'error';

const boostrapper = async function( appLevel:'concrete'|'mini', options?:{
    mysql:MySQLDB_CONFIG,
}){

    if( boostrapState != undefined ) return;

    return (async ()=>{

        boostrapState = 'loading';

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

        console.log( 'bootstrapping with config : ' , options );

        const mySqlDb = new MySQLDB();
        await mySqlDb.init(options.mysql);
        CoreRoutines.objectStore.set(Constants.GLOBAL_OBJECT_KEYS.system.mysql,mySqlDb);
    })().then(()=>{
        boostrapState = 'loaded';
    }).catch((err)=>{
        boostrapState = 'error';
        console.error('Bootstrapper failed to complete with exception : ' , err);
        process.exit(1);
    })
};

export default boostrapper;
