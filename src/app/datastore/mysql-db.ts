
import mysql from "mysql";
import { SubSystem } from "../abstracts/types";

export type MySQLDB_CONFIG =  (mysql.PoolConfig | mysql.ConnectionConfig);

type HANDLER = mysql.Connection|mysql.Pool;

/**
 * This class interfaces the mysql server to various parts of the application.
 */
export default class MySQLDB implements SubSystem<MySQLDB_CONFIG , HANDLER>{

  private connection:HANDLER;

  async init(config:MySQLDB_CONFIG) {

    this.connection = 'connectionLimit' in config && typeof config.connectionLimit === 'number' ?

    /**
     * If connection limit is provided, rather than a single connection, use a pool of connections for scalability and performance
     */
    mysql.createPool(config) :

    mysql.createConnection(config);
  }

  getHandler(){
    return this.connection;
  }
}
