require('dotenv').config();

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'private_world_db',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  charset: 'utf8mb4',
  waitForConnections: true,
  queueLimit: 0,
});

async function execute(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function query(sql, params = []) {
  const [rows, fields] = await pool.query(sql, params);
  return { rows, fields };
}

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('MySQL 连接成功');
    conn.release();
  } catch (err) {
    console.error('MySQL 连接失败:', err.message);
    console.error('请检查 .env 配置和 MySQL 服务是否启动');
  }
})();

module.exports = { pool, execute, query };
