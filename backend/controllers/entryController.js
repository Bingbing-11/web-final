const { execute } = require('../db');
const { success, fail } = require('../utils/response');

// GET /api/entries?worldId=xxx
async function listEntries(req, res, next) {
  const { worldId } = req.query;
  if (!worldId) return fail(res, 400, '缺少 worldId 参数');
  try {
    const entries = await execute(
      `SELECT e.*, w.name as world_name, w.color as world_color
       FROM entries e LEFT JOIN worlds w ON e.world_id = w.id
       WHERE e.world_id = ? ORDER BY e.created_at DESC`,
      [worldId]
    );
    const result = entries.map(e => ({
      id: e.id,
      worldId: e.world_id,
      userId: e.user_id,
      title: e.title,
      content: e.content,
      mode: e.mode,
      status: e.status,
      emotion: e.emotion,
      emotionHue: e.emotion_hue,
      keywords: typeof e.keywords === 'string' ? JSON.parse(e.keywords || '[]') : (e.keywords || []),
      createdAt: e.created_at,
      updatedAt: e.updated_at,
      readCount: e.read_count,
      burnedAt: e.burned_at,
      sealedUntil: e.sealed_until,
      capsuleOpenAt: e.capsule_open_at,
      worldName: e.world_name,
      worldColor: e.world_color,
    }));
    success(res, result);
  } catch (err) {
    next(err);
  }
}

// POST /api/entries
async function createEntry(req, res, next) {
  const { worldId, title, content, mode, status, emotion, emotionHue, keywords } = req.body;
  if (!worldId || !title) return fail(res, 400, 'worldId 和 title 不能为空');
  try {
    const id = require('crypto').randomUUID();
    await execute(
      `INSERT INTO entries (id, world_id, user_id, title, content, mode, status, emotion, emotion_hue, keywords)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, worldId, req.user.id, title, content || '',
        mode || 'normal', status || 'published', emotion || null,
        emotionHue || null, JSON.stringify(keywords || []),
      ]
    );
    success(res, {
      id, worldId, userId: req.user.id, title, content: content || '',
      mode: mode || 'normal', status: status || 'published',
      emotion, emotionHue, keywords: keywords || [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      readCount: 0,
    }, '创建成功', 201);
  } catch (err) {
    next(err);
  }
}

// PUT /api/entries/:id
async function updateEntry(req, res, next) {
  const { title, content, mode, status, emotion, emotionHue, keywords } = req.body;
  try {
    const rows = await execute('SELECT * FROM entries WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) return fail(res, 404, '日记不存在', 404);

    const updates = [];
    const params = [];
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (mode !== undefined) { updates.push('mode = ?'); params.push(mode); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (emotion !== undefined) { updates.push('emotion = ?'); params.push(emotion); }
    if (emotionHue !== undefined) { updates.push('emotion_hue = ?'); params.push(emotionHue); }
    if (keywords !== undefined) { updates.push('keywords = ?'); params.push(JSON.stringify(keywords)); }
    if (updates.length === 0) return fail(res, 400, '没有需要更新的字段');

    updates.push("updated_at = NOW()");
    params.push(req.params.id);
    await execute(`UPDATE entries SET ${updates.join(', ')} WHERE id = ?`, params);
    success(res, null, '更新成功');
  } catch (err) {
    next(err);
  }
}

// DELETE /api/entries/:id
async function deleteEntry(req, res, next) {
  try {
    const rows = await execute('SELECT * FROM entries WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) return fail(res, 404, '日记不存在', 404);
    await execute('DELETE FROM entries WHERE id = ?', [req.params.id]);
    success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
}

// PATCH /api/entries/:id/burn — 焚毁日记
async function burnEntry(req, res, next) {
  try {
    const rows = await execute('SELECT * FROM entries WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) return fail(res, 404, '日记不存在', 404);
    await execute(
      "UPDATE entries SET status = 'burned', burned_at = NOW(), updated_at = NOW() WHERE id = ?",
      [req.params.id]
    );
    success(res, null, '已焚毁');
  } catch (err) {
    next(err);
  }
}

module.exports = { listEntries, createEntry, updateEntry, deleteEntry, burnEntry };
