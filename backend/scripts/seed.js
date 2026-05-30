require('dotenv').config();
const { execute } = require('../db');

async function seed() {
  console.log('开始初始化数据库...\n');

  // Create database if not exists
  try {
    const mysql = require('mysql2/promise');
    const tmpConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    await tmpConn.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'private_world_db'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tmpConn.end();
    console.log('数据库已创建（如不存在）');
  } catch (err) {
    console.error('创建数据库失败:', err.message);
    process.exit(1);
  }

  // Create tables
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      nickname VARCHAR(50) NOT NULL,
      avatar VARCHAR(500),
      theme VARCHAR(10) DEFAULT 'light',
      night_mode TINYINT(1) DEFAULT 0,
      night_mode_start INT DEFAULT 22,
      night_mode_end INT DEFAULT 6,
      language VARCHAR(10) DEFAULT 'zh-CN',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS worlds (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      owner_id VARCHAR(36) NOT NULL,
      icon VARCHAR(100),
      color VARCHAR(20) NOT NULL,
      is_sealed TINYINT(1) DEFAULT 0,
      sealed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_owner (owner_id),
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS entries (
      id VARCHAR(36) PRIMARY KEY,
      world_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      mode VARCHAR(20) DEFAULT 'normal',
      status VARCHAR(20) DEFAULT 'draft',
      emotion VARCHAR(50),
      emotion_hue INT,
      keywords JSON,
      read_count INT DEFAULT 0,
      burned_at TIMESTAMP NULL,
      sealed_until TIMESTAMP NULL,
      capsule_open_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_world (world_id),
      INDEX idx_user (user_id),
      FOREIGN KEY (world_id) REFERENCES worlds(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS friendships (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      friend_id VARCHAR(36) NOT NULL,
      shared_worlds JSON,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_pair (user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS friend_requests (
      id VARCHAR(36) PRIMARY KEY,
      from_id VARCHAR(36) NOT NULL,
      to_id VARCHAR(36) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_to (to_id, status),
      FOREIGN KEY (from_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (to_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS resonances (
      id VARCHAR(36) PRIMARY KEY,
      world_id VARCHAR(36),
      author_id VARCHAR(36) NOT NULL,
      emotion VARCHAR(50) NOT NULL,
      emotion_hue INT NOT NULL,
      content TEXT NOT NULL,
      keywords JSON,
      reactions JSON,
      is_anonymous TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_world (world_id),
      INDEX idx_emotion (emotion),
      FOREIGN KEY (world_id) REFERENCES worlds(id) ON DELETE SET NULL,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS token_blacklist (
      token_hash VARCHAR(64) PRIMARY KEY,
      expires_at DATETIME(3) NOT NULL,
      INDEX idx_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];

  for (const sql of tables) {
    try {
      await execute(sql);
      const tableName = sql.match(/IF NOT EXISTS (\w+)/)[1];
      console.log(`  ✓ 表 ${tableName} 已就绪`);
    } catch (err) {
      console.error(`  ✗ 建表失败:`, err.message);
    }
  }

  console.log('\n数据库初始化完成！');
  process.exit(0);
}

seed().catch(err => {
  console.error('初始化失败:', err);
  process.exit(1);
});
