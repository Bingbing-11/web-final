import type { Comment } from '../types/comment';
import { mockMessagesMap } from './mockWorlds';

/**
 * Mock 留言数据 —— 仅开发环境使用
 * 与 mockMessagesMap 联动：首页消息 → 详情页留言
 * 将 mockMessagesMap 中每条消息分配给对应世界的某篇日记
 */

const now = Date.now();
const hour = 3600_000;
const day = 86400_000;

/* 头像池 */
const avatars = ['🧑', '👩', '👨', '🧒', '👧', '👦', '🧓', '👵'];

/* 留言者池 */
const users = [
  { id: 'friend-star', name: '小星', avatar: '⭐' },
  { id: 'friend-moon', name: '阿月', avatar: '🌙' },
  { id: 'friend-cloud', name: '流云', avatar: '☁️' },
  { id: 'friend-deer', name: '小鹿', avatar: '🦌' },
  { id: 'friend-wood', name: '木子', avatar: '🌿' },
  { id: 'friend-sunny', name: '晴天', avatar: '☀️' },
  { id: 'mock-user', name: '我', avatar: '🧑' },
];

function randomUser(exclude?: string) {
  const pool = exclude ? users.filter(u => u.id !== exclude) : users;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 世界 → 日记 ID 的映射
 * 每条留言需要关联到该世界的某篇日记
 */
const worldEntryMap: Record<string, string[]> = {
  'mock-1': ['entry-1-1', 'entry-1-2', 'entry-1-3', 'entry-1-4', 'entry-1-5'],
  'mock-2': ['entry-2-1', 'entry-2-2'],
  'mock-3': ['entry-3-1'],
  'mock-4': ['entry-4-1'],
  'mock-5': ['entry-5-1', 'entry-5-2'],
};

/**
 * 将 mockMessagesMap 中的首页消息转为留言
 * 每条消息分配给对应世界的第一篇日记（或随机日记）
 */
function buildCommentsFromMessages(): Comment[] {
  const comments: Comment[] = [];
  let idx = 0;

  for (const [worldId, msgs] of Object.entries(mockMessagesMap)) {
    const entryIds = worldEntryMap[worldId];
    if (!entryIds?.length) continue;

    msgs.forEach((msg, i) => {
      /* 不同的消息分配给不同的日记，循环分配 */
      const entryId = entryIds[i % entryIds.length];
      const author = randomUser('mock-user');

      comments.push({
        id: msg.id, // 复用消息 ID，保持联动
        entryId,
        userId: author.id,
        userName: author.name,
        userAvatar: author.avatar,
        content: msg.content,
        createdAt: new Date(now - (i + 1) * hour).toISOString(),
      });

      /* 部分留言有主人回复 */
      if (i === 0 && worldId === 'mock-1') {
        comments.push({
          id: `reply-${idx}`,
          entryId,
          userId: 'mock-user',
          userName: '我',
          userAvatar: '🧑',
          content: '谢谢你的分享，晚霞确实很美 🌅',
          replyToId: msg.id,
          replyToName: author.name,
          createdAt: new Date(now - i * hour - 30 * 60 * 1000).toISOString(),
        });
        idx++;
      }

      if (i === 1 && worldId === 'mock-5') {
        comments.push({
          id: `reply-${idx}`,
          entryId,
          userId: 'mock-user',
          userName: '我',
          userAvatar: '🧑',
          content: '哈哈哈小橘太可爱了',
          replyToId: msg.id,
          replyToName: author.name,
          createdAt: new Date(now - i * hour - 20 * 60 * 1000).toISOString(),
        });
        idx++;
      }
    });
  }

  return comments;
}

export const mockComments: Comment[] = buildCommentsFromMessages();

/**
 * 额外补充一些日记直接留言（不来自首页消息）
 */
export const extraMockComments: Comment[] = [
  /* 梦境花园 entry-1-3 雨后泥土味 */
  {
    id: 'extra-1',
    entryId: 'entry-1-3',
    userId: 'friend-deer',
    userName: '小鹿',
    userAvatar: '🦌',
    content: '读完觉得好治愈，雨天果然是最适合发呆的日子',
    createdAt: new Date(now - 4 * hour).toISOString(),
  },
  {
    id: 'extra-1-r',
    entryId: 'entry-1-3',
    userId: 'mock-user',
    userName: '我',
    userAvatar: '🧑',
    content: '对呀，下次一起踩水洼吧 😄',
    replyToId: 'extra-1',
    replyToName: '小鹿',
    createdAt: new Date(now - 3.5 * hour).toISOString(),
  },
  /* 猫咪咖啡馆 entry-5-2 拿铁配方惊喜 */
  {
    id: 'extra-2',
    entryId: 'entry-5-2',
    userId: 'friend-cloud',
    userName: '流云',
    userAvatar: '☁️',
    content: '海盐拿铁！改天我也试试这个配方',
    createdAt: new Date(now - 18 * hour).toISOString(),
  },
  /* 深海图书馆 entry-2-2 气泡诗 */
  {
    id: 'extra-3',
    entryId: 'entry-2-2',
    userId: 'friend-moon',
    userName: '阿月',
    userAvatar: '🌙',
    content: '好美的诗，每个气泡都是一句没说完的话 ✨',
    createdAt: new Date(now - 6 * hour).toISOString(),
  },
];

/** 合并所有模拟留言 */
export const allMockComments: Comment[] = [...mockComments, ...extraMockComments];
