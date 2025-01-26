import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create a pool with proper configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Simple check to ensure connection (optional)
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();

// Export the pool to be used in other modules
export default pool;
