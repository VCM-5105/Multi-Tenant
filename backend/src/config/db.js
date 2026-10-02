import mysql from "mysql2/promise";

// console.log("DB_HOST:", process.env.DB_HOST);
// console.log("DB_USER:", process.env.DB_USER);
// console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "LOADED" : "MISSING");


const isRemoteDb =
  process.env.DB_HOST &&
  process.env.DB_HOST !== "localhost" &&
  process.env.DB_HOST !== "127.0.0.1";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: isRemoteDb
    ? {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      }
    : undefined,
});



const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(
      `MySQL connected successfully to database "${process.env.DB_NAME }" on port ${
        process.env.DB_PORT 
      }`
    );
    connection.release();
  } catch (error) {
    console.error(`Failed to connect to MySQL:`, error.message);
    process.exit(1);
  }
};


export {testConnection};
export default pool;
