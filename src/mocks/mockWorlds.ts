import type { World } from '../types/world';

/**
 * Mock 数据 —— 仅开发环境使用
 * 涵盖：featured（最活跃）、有未读消息、有图片、纯 emoji、已封存等状态
 */

const now = Date.now();
const hour = 3600_000;
const day = 86400_000;

export const mockWorlds: World[] = [
  {
    id: 'mock-1',
    name: '梦境花园',
    description: '在花海与星空之间，种下每一帧温柔的梦境',
    ownerId: 'mock-user',
    icon: '🌸',
    color: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    isSealed: false,
    createdAt: new Date(now - 30 * day).toISOString(),
    updatedAt: new Date(now - 1 * hour).toISOString(),
    entryCount: 42,
    permissions: [],
    unreadCount: 5,
    latestExcerpt: '今天的云像棉花糖，软软地铺满了整个天空…',
  },
  {
    id: 'mock-2',
    name: '深海图书馆',
    description: '沉入海底的书架间，文字化作气泡缓缓升起',
    ownerId: 'mock-user',
    icon: '📚',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    isSealed: false,
    createdAt: new Date(now - 20 * day).toISOString(),
    updatedAt: new Date(now - 3 * hour).toISOString(),
    entryCount: 28,
    permissions: [],
    unreadCount: 2,
    latestExcerpt: '翻到一页被海水浸泡的字迹，依稀可辨…',
  },
  {
    id: 'mock-3',
    name: '火山熔岩日记',
    description: '岩浆流淌过的每一寸土地，都是炽热的记忆',
    ownerId: 'mock-user',
    icon: '🌋',
    color: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    isSealed: false,
    createdAt: new Date(now - 15 * day).toISOString(),
    updatedAt: new Date(now - 2 * day).toISOString(),
    entryCount: 17,
    permissions: [],
    /* 无未读消息 */
  },
  {
    id: 'mock-4',
    name: '极光信箱',
    description: '在北纬 69°的天空下，写给未来的信',
    ownerId: 'mock-user',
    icon: '✉️',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    isSealed: false,
    createdAt: new Date(now - 10 * day).toISOString(),
    updatedAt: new Date(now - 5 * day).toISOString(),
    entryCount: 9,
    permissions: [],
    unreadCount: 1,
  },
  {
    id: 'mock-5',
    name: '猫咪咖啡馆',
    description: '橘猫趴在键盘上打了个哈欠，今天的拿铁格外好喝',
    ownerId: 'mock-user',
    icon: '🐱',
    color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    isSealed: false,
    createdAt: new Date(now - 7 * day).toISOString(),
    updatedAt: new Date(now - 12 * hour).toISOString(),
    entryCount: 33,
    permissions: [],
    unreadCount: 8,
    latestExcerpt: '小橘又把杯子推倒了，但看它的脸实在生不起气…',
  },
  {
    id: 'mock-sealed',
    name: '旧时光收藏柜',
    description: '已经被封存的世界，不会出现在首页',
    ownerId: 'mock-user',
    icon: '🏛️',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    isSealed: true,
    sealedAt: new Date(now - 3 * day).toISOString(),
    createdAt: new Date(now - 60 * day).toISOString(),
    updatedAt: new Date(now - 3 * day).toISOString(),
    entryCount: 56,
    permissions: [],
  },
];

/**
 * 模拟消息数据 —— 对应每个世界的 unreadCount
 */
export const mockMessagesMap: Record<string, { id: string; content: string; timeAgo: string }[]> = {
  'mock-1': [
    { id: 'm1-1', content: '今天的晚霞好美，想和你分享', timeAgo: '刚刚' },
    { id: 'm1-2', content: '花园里的玫瑰开了，是你说喜欢的那个品种', timeAgo: '1小时前' },
    { id: 'm1-3', content: '记得多喝水呀～', timeAgo: '2小时前' },
    { id: 'm1-4', content: '刚路过你说的那家书店，真的很棒', timeAgo: '4小时前' },
    { id: 'm1-5', content: '晚安，梦里见 🌙', timeAgo: '6小时前' },
  ],
  'mock-2': [
    { id: 'm2-1', content: '推荐你一本《深海之歌》，很适合你的世界', timeAgo: '30分钟前' },
    { id: 'm2-2', content: '那段关于气泡的诗，我抄下来了', timeAgo: '3小时前' },
  ],
  'mock-4': [
    { id: 'm4-1', content: '信已寄出，请查收 ✨', timeAgo: '2小时前' },
  ],
  'mock-5': [
    { id: 'm5-1', content: '喵～来摸我呀', timeAgo: '刚刚' },
    { id: 'm5-2', content: '今天的拿铁配方有惊喜哦', timeAgo: '1小时前' },
    { id: 'm5-3', content: '小橘把你的日记本当枕头了', timeAgo: '2小时前' },
    { id: 'm5-4', content: '新来的布偶猫好粘人！', timeAgo: '3小时前' },
    { id: 'm5-5', content: '窗外的麻雀又来了', timeAgo: '5小时前' },
    { id: 'm5-6', content: '今天的生乳卷绝了', timeAgo: '6小时前' },
    { id: 'm5-7', content: '猫咖要打烊了，明天再来吧', timeAgo: '8小时前' },
    { id: 'm5-8', content: '小橘翻了个身继续睡', timeAgo: '10小时前' },
  ],
};
