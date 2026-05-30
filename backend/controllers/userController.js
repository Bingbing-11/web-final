const { execute } = require('../db');
const { success, fail } = require('../utils/response');

// GET /api/users/search?q=xxx
async function searchUser(req, res, next) {
  const { q } = req.query;
  if (!q) return fail(res, 400, '缺少搜索关键词');

  try {
    const rows = await execute(
      'SELECT id, username, nickname, avatar, created_at FROM users WHERE username = ? OR id = ? LIMIT 1',
      [q, q]
    );
    if (rows.length === 0) return fail(res, 404, '用户不存在', 404);
    success(res, {
      id: rows[0].id,
      username: rows[0].username,
      nickname: rows[0].nickname,
      avatar: rows[0].avatar,
      createdAt: rows[0].created_at,
      settings: {
        theme: rows[0].theme || 'light',
        nightMode: false,
        nightModeStart: 22,
        nightModeEnd: 6,
        language: 'zh-CN',
      },
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/profile
async function updateProfile(req, res, next) {
  const { nickname, avatar } = req.body;
  try {
    const updates = [];
    const params = [];
    if (nickname) { updates.push('nickname = ?'); params.push(nickname); }
    if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }
    if (updates.length === 0) return fail(res, 400, '没有需要更新的字段');

    updates.push("updated_at = NOW()");
    params.push(req.user.id);
    await execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    success(res, null, '更新成功');
  } catch (err) {
    next(err);
  }
}

module.exports = { searchUser, updateProfile };
