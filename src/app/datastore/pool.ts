
import mysql from "mysql";

/**
 * Rather than a single connection, use a pool of connections for scalability and performance
 */
const pool  = mysql.createPool({
  connectionLimit : ,
  host            : ,
  user            : ,
  password        : ,
  database        : 
});

export default pool;