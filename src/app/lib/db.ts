import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { promisify } from 'util';
import { FieldPacket } from 'mysql2';
// import path from 'path';
dotenv.config();

const dbPort: number = process.env.DB_PORT as unknown as number
// const caCertPath = path.resolve(process.cwd(), 'src/app/lib/ca.pem');
// console.log('caCertPath:', caCertPath)

// Create a pool with proper configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,

  // debug: true,
  // timezone: '+08:00',
  // ssl: false,
  // ssl: {
  //   // ca: process.env.DB_SSL_CA,
  //   ca: fs.readFileSync(caCertPath),
  //   rejectUnauthorized: false,
  // }
});

export const getConnection = promisify(pool.getConnection).bind(pool);

// Function to query the database

export const query = async (sql: string, params: unknown[]) =>
  {
    let conn
    try
    {
      conn = await pool.getConnection()
      const [rows]: [unknown[], FieldPacket[]] = await conn.query(sql, params) as [unknown[], FieldPacket[]]
  
      return rows
    } catch (error) {
      console.error('Database query error:', error)
    } finally {
  
      if (conn)
        conn.release()
    }
}

// Export the pool to be used in other modules
export default pool;
