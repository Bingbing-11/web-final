const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { execute } = require('../db');
const { success, fail } = require('../utils/response');
const { signToken } = require('../middleware/auth');

// POST /api/auth/register
async function register(req, res, next) {
  const { username, nickname, password } = req.body;
  if (!username || !nickname || !password) {
    return fail(res, 400, '用户名、昵称和密码不能为空', 400);
  }
  if (password.length < 4) {
    return fail(res, 400, '密码至少4位', 400);
  }

  try {
    const existing = await execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return fail(res, 409, '用户名已存在', 409);
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    await execute(
      'INSERT INTO users (id, username, password, nickname) VALUES (?, ?, ?, ?)',
      [userId, username, hashedPassword, nickname]
    );

    const user = { id: userId, username, nickname };
    const token = signToken(user);
    success(res, { token, user }, '注册成功', 201);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return fail(res, 1001, '用户名和密码不能为空', 401);
  }

  try {
    const rows = await execute('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    if (rows.length === 0) {
      return fail(res, 1001, '用户名或密码错误', 401);
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return fail(res, 1001, '用户名或密码错误', 401);
    }

    const token = signToken(user);
    success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        createdAt: user.created_at,
        settings: {
          theme: user.theme || 'light',
          nightMode: !!user.night_mode,
          nightModeStart: user.night_mode_start || 22,
          nightModeEnd: user.night_mode_end || 6,
          language: user.language || 'zh-CN',
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return success(res, null, '已登出');
  }

  const token = authHeader.slice(7);
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'default_secret');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await execute(
      'INSERT INTO token_blacklist (token_hash, expires_at) VALUES (?, ?)',
      [tokenHash, new Date(decoded.exp * 1000)]
    );
  } catch {
    // Token already invalid, just clear client-side
  }
  success(res, null, '已登出');
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const rows = await execute(
      'SELECT id, username, nickname, avatar, theme, night_mode, night_mode_start, night_mode_end, language, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return fail(res, 404, '用户不存在', 404);
    }
    const user = rows[0];
    success(res, {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      createdAt: user.created_at,
      settings: {
        theme: user.theme || 'light',
        nightMode: !!user.night_mode,
        nightModeStart: user.night_mode_start || 22,
        nightModeEnd: user.night_mode_end || 6,
        language: user.language || 'zh-CN',
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getMe };
