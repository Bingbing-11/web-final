const { execute } = require('../db');
const { success, fail } = require('../utils/response');

// GET /api/worlds — 获取当前用户的世界列表
async function listWorlds(req, res, next) {
  try {
    const worlds = await execute(
      'SELECT * FROM worlds WHERE owner_id = ? ORDER BY updated_at DESC',
      [req.user.id]
    );
    const result = worlds.map(w => ({
      id: w.id,
      name: w.name,
      description: w.description,
      ownerId: w.owner_id,
      icon: w.icon,
      color: w.color,
      isSealed: !!w.is_sealed,
      sealedAt: w.sealed_at,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
      entryCount: 0, // Will be populated below
      permissions: [],
    }));
    // Get entry counts
    if (result.length > 0) {
      const ids = result.map(w => w.id);
      const counts = await execute(
        `SELECT world_id, COUNT(*) as cnt FROM entries WHERE world_id IN (?) AND status != 'burned' GROUP BY world_id`,
        [ids]
      );
      const countMap = {};
      counts.forEach(c => { countMap[c.world_id] = c.cnt; });
      result.forEach(w => { w.entryCount = countMap[w.id] || 0; });
    }
    success(res, result);
  } catch (err) {
    next(err);
  }
}

// POST /api/worlds — 创建世界
async function createWorld(req, res, next) {
  const { name, description, icon, color } = req.body;
  if (!name || !color) {
    return fail(res, 400, '名称和颜色不能为空');
  }
  try {
    const id = require('crypto').randomUUID();
    await execute(
      'INSERT INTO worlds (id, name, description, owner_id, icon, color) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, description || '', req.user.id, icon || null, color]
    );
    success(res, {
      id, name, description: description || '', ownerId: req.user.id,
      icon: icon || null, color, isSealed: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      entryCount: 0, permissions: [],
    }, '世界创建成功', 201);
  } catch (err) {
    next(err);
  }
}

// PUT /api/worlds/:id
async function updateWorld(req, res, next) {
  const { name, description, icon, color } = req.body;
  try {
    const rows = await execute('SELECT * FROM worlds WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) return fail(res, 404, '世界不存在', 404);

    const updates = [];
    const params = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (icon !== undefined) { updates.push('icon = ?'); params.push(icon); }
    if (color !== undefined) { updates.push('color = ?'); params.push(color); }

    if (updates.length === 0) return fail(res, 400, '没有需要更新的字段');
    updates.push("updated_at = NOW()");
    params.push(req.params.id);

    await execute(`UPDATE worlds SET ${updates.join(', ')} WHERE id = ?`, params);
    success(res, null, '更新成功');
  } catch (err) {
    next(err);
  }
}

// DELETE /api/worlds/:id
async function deleteWorld(req, res, next) {
  try {
    const rows = await execute('SELECT * FROM worlds WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) return fail(res, 404, '世界不存在', 404);
    await execute('DELETE FROM worlds WHERE id = ?', [req.params.id]);
    success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
}

// PATCH /api/worlds/:id/seal
async function toggleSeal(req, res, next) {
  const { seal } = req.body; // true to seal, false to unseal
  try {
    const rows = await execute('SELECT * FROM worlds WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) return fail(res, 404, '世界不存在', 404);

    if (seal) {
      await execute('UPDATE worlds SET is_sealed = 1, sealed_at = NOW(), updated_at = NOW() WHERE id = ?', [req.params.id]);
    } else {
      await execute('UPDATE worlds SET is_sealed = 0, sealed_at = NULL, updated_at = NOW() WHERE id = ?', [req.params.id]);
    }
    success(res, null, seal ? '已封存' : '已解封');
  } catch (err) {
    next(err);
  }
}

module.exports = { listWorlds, createWorld, updateWorld, deleteWorld, toggleSeal };
