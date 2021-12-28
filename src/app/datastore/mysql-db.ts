
import mysql from "mysql";
import { System } from "../abstracts/types";

export type MySQLDB_CONFIG = {
  connectionLimit ?: number,
  host            : string,
  user            : string,
  password        : string,
  database        : string,
  port            ?: number
};

type HANDLER = mysql.Connection|mysql.Pool;

class MySQLDB implements System<MySQLDB_CONFIG , HANDLER>{

  private connection:HANDLER;

  async load(config:MySQLDB_CONFIG) {
    
    this.connection = typeof config.connectionLimit === 'number' ? 
    
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

const mySqlDb = new MySQLDB;

export default mySqlDb;