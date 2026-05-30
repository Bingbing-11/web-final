const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { execute } = require('../db');
const { AppError } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, nickname: user.nickname },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录或 token 已过期', data: null });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Check token blacklist
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    try {
      const rows = await execute(
        'SELECT 1 FROM token_blacklist WHERE token_hash = ? AND expires_at > NOW()',
        [tokenHash]
      );
      if (rows.length > 0) {
        return res.status(401).json({ code: 401, message: 'token 已失效，请重新登录', data: null });
      }
    } catch (dbErr) {
      // Graceful degradation: if DB check fails, allow auth to proceed
      console.warn('Token blacklist check failed:', dbErr.message);
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'token 无效或已过期', data: null });
  }
}

module.exports = { requireAuth, signToken, JWT_SECRET };
