
import mysql from "mysql";
import { System } from "../../types";

export type MySQLDB_CONFIG = {
  connectionLimit : number,
  host            : string,
  user            : string,
  password        : string,
  database        : string
};

type HANDLER = mysql.Connection|mysql.Pool;

class MySQLDB implements System<MySQLDB_CONFIG , HANDLER>{

  private connection:HANDLER;

  async load(config:MySQLDB_CONFIG) {
    /**
     * Rather than a single connection, use a pool of connections for scalability and performance
     */
    this.connection = mysql.createPool(config);
  }

  async getHandler(){
    return this.connection;
  }
}

const mySqlDb = new MySQLDB;

export default mySqlDb;