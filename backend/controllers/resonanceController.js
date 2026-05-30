const { execute } = require('../db');
const { success, fail } = require('../utils/response');

// GET /api/resonances?worldId=xxx&emotion=xxx&limit=xx
async function listResonances(req, res, next) {
  const { worldId, emotion, limit } = req.query;
  try {
    let sql = `SELECT r.*, w.name as world_name
               FROM resonances r LEFT JOIN worlds w ON r.world_id = w.id
               WHERE 1=1`;
    const params = [];
    if (worldId) { sql += ' AND r.world_id = ?'; params.push(worldId); }
    if (emotion) { sql += ' AND r.emotion = ?'; params.push(emotion); }
    sql += ' ORDER BY r.created_at DESC';
    if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }

    const rows = await execute(sql, params);
    const result = rows.map(r => ({
      id: r.id,
      worldId: r.world_id,
      worldName: r.world_name,
      authorId: r.author_id,
      authorName: r.author_name || (r.is_anonymous ? '匿名' : '未知'),
      emotion: r.emotion,
      emotionHue: r.emotion_hue,
      content: r.content,
      keywords: typeof r.keywords === 'string' ? JSON.parse(r.keywords || '[]') : (r.keywords || []),
      reactions: typeof r.reactions === 'string' ? JSON.parse(r.reactions || '[]') : (r.reactions || []),
      isAnonymous: !!r.is_anonymous,
      createdAt: r.created_at,
    }));
    success(res, result);
  } catch (err) {
    next(err);
  }
}

// POST /api/resonances
async function createResonance(req, res, next) {
  const { worldId, emotion, emotionHue, content, keywords, isAnonymous } = req.body;
  if (!emotion || !content) return fail(res, 400, 'emotion 和 content 不能为空');

  try {
    const id = require('crypto').randomUUID();
    const authorName = isAnonymous ? null : req.user.nickname;
    await execute(
      `INSERT INTO resonances (id, world_id, author_id, author_name, emotion, emotion_hue, content, keywords, is_anonymous, reactions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, worldId || null, req.user.id, authorName,
        emotion, emotionHue || 0, content,
        JSON.stringify(keywords || []), isAnonymous ? 1 : 0, JSON.stringify([]),
      ]
    );
    success(res, {
      id, worldId: worldId || null, worldName: null,
      authorId: req.user.id, authorName: isAnonymous ? '匿名' : req.user.nickname,
      emotion, emotionHue: emotionHue || 0, content,
      keywords: keywords || [], reactions: [],
      isAnonymous: !!isAnonymous, createdAt: new Date().toISOString(),
    }, '发布成功', 201);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/resonances/:id
async function removeResonance(req, res, next) {
  try {
    const rows = await execute('SELECT * FROM resonances WHERE id = ? AND author_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) return fail(res, 404, '共鸣不存在', 404);
    await execute('DELETE FROM resonances WHERE id = ?', [req.params.id]);
    success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
}

// POST /api/resonances/:id/react — 切换反应
async function toggleReaction(req, res, next) {
  const { type } = req.body;
  if (!type) return fail(res, 400, '缺少反应类型');

  try {
    const rows = await execute('SELECT * FROM resonances WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return fail(res, 404, '共鸣不存在', 404);

    let reactions = typeof rows[0].reactions === 'string' ? JSON.parse(rows[0].reactions || '[]') : (rows[0].reactions || []);
    const existing = reactions.findIndex(r => r.userId === req.user.id && r.type === type);
    if (existing >= 0) {
      reactions.splice(existing, 1);
    } else {
      reactions.push({ userId: req.user.id, type });
    }
    await execute('UPDATE resonances SET reactions = ? WHERE id = ?', [JSON.stringify(reactions), req.params.id]);
    success(res, reactions, '操作成功');
  } catch (err) {
    next(err);
  }
}

module.exports = { listResonances, createResonance, removeResonance, toggleReaction };
