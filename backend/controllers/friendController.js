const { execute } = require('../db');
const { success, fail } = require('../utils/response');

// GET /api/friends — 获取好友列表
async function listFriends(req, res, next) {
  try {
    const friends = await execute(
      `SELECT f.*, u.username as friend_username, u.nickname as friend_name, u.avatar as friend_avatar
       FROM friendships f
       JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = ?
       ORDER BY f.added_at DESC`,
      [req.user.id]
    );
    const result = friends.map(f => ({
      id: f.id,
      userId: f.user_id,
      friendId: f.friend_id,
      friendName: f.friend_name,
      friendUsername: f.friend_username || '',
      friendAvatar: f.friend_avatar,
      addedAt: f.added_at,
      sharedWorlds: typeof f.shared_worlds === 'string' ? JSON.parse(f.shared_worlds || '[]') : (f.shared_worlds || []),
    }));
    success(res, result);
  } catch (err) {
    next(err);
  }
}

// GET /api/friends/requests — 获取好友请求
async function listRequests(req, res, next) {
  try {
    const pending = await execute(
      `SELECT fr.*, u.username as from_username, u.nickname as from_name
       FROM friend_requests fr
       JOIN users u ON fr.from_id = u.id
       WHERE fr.to_id = ? AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [req.user.id]
    );
    const sent = await execute(
      `SELECT fr.*, u.username as to_username, u.nickname as to_name
       FROM friend_requests fr
       JOIN users u ON fr.to_id = u.id
       WHERE fr.from_id = ? AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [req.user.id]
    );
    success(res, {
      pending: pending.map(r => ({
        id: r.id, fromId: r.from_id, fromName: r.from_name, fromAvatar: null,
        toId: r.to_id, toName: r.to_name,
        status: r.status, message: r.message, createdAt: r.created_at,
      })),
      sent: sent.map(r => ({
        id: r.id, fromId: r.from_id, fromName: r.from_name, fromAvatar: null,
        toId: r.to_id, toName: r.to_name,
        status: r.status, message: r.message, createdAt: r.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/friends/request — 发送好友请求
async function sendRequest(req, res, next) {
  const { toId, message } = req.body;
  if (!toId) return fail(res, 400, '缺少 toId');
  if (toId === req.user.id) return fail(res, 400, '不能添加自己');

  try {
    // Check if already friends
    const existing = await execute(
      'SELECT id FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [req.user.id, toId, toId, req.user.id]
    );
    if (existing.length > 0) return fail(res, 400, '已经是好友了');

    // Check pending request
    const pending = await execute(
      "SELECT id FROM friend_requests WHERE ((from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)) AND status = 'pending'",
      [req.user.id, toId, toId, req.user.id]
    );
    if (pending.length > 0) return fail(res, 400, '已有待处理的请求');

    const id = require('crypto').randomUUID();
    await execute(
      'INSERT INTO friend_requests (id, from_id, to_id, message) VALUES (?, ?, ?, ?)',
      [id, req.user.id, toId, message || null]
    );
    success(res, { id }, '请求已发送', 201);
  } catch (err) {
    next(err);
  }
}

// PUT /api/friends/request/:id/accept
async function acceptRequest(req, res, next) {
  try {
    const rows = await execute(
      "SELECT * FROM friend_requests WHERE id = ? AND to_id = ? AND status = 'pending'",
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return fail(res, 404, '请求不存在', 404);

    const req_row = rows[0];
    // Update request status
    await execute("UPDATE friend_requests SET status = 'accepted' WHERE id = ?", [req.params.id]);
    // Create bidirectional friendship
    const id1 = require('crypto').randomUUID();
    const id2 = require('crypto').randomUUID();
    await execute('INSERT INTO friendships (id, user_id, friend_id) VALUES (?, ?, ?)', [id1, req_row.to_id, req_row.from_id]);
    await execute('INSERT INTO friendships (id, user_id, friend_id) VALUES (?, ?, ?)', [id2, req_row.from_id, req_row.to_id]);
    success(res, null, '已接受');
  } catch (err) {
    next(err);
  }
}

// PUT /api/friends/request/:id/reject
async function rejectRequest(req, res, next) {
  try {
    const rows = await execute(
      "SELECT * FROM friend_requests WHERE id = ? AND to_id = ? AND status = 'pending'",
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return fail(res, 404, '请求不存在', 404);
    await execute("UPDATE friend_requests SET status = 'rejected' WHERE id = ?", [req.params.id]);
    success(res, null, '已拒绝');
  } catch (err) {
    next(err);
  }
}

// DELETE /api/friends/:id — 删除好友
async function removeFriend(req, res, next) {
  try {
    const rows = await execute('SELECT * FROM friendships WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) return fail(res, 404, '好友关系不存在', 404);
    const friend = rows[0];
    // Remove both directions
    await execute(
      'DELETE FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [friend.user_id, friend.friend_id, friend.friend_id, friend.user_id]
    );
    success(res, null, '已删除');
  } catch (err) {
    next(err);
  }
}

module.exports = { listFriends, listRequests, sendRequest, acceptRequest, rejectRequest, removeFriend };
