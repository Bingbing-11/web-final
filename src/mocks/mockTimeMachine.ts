import type { Entry } from '../types/entry';

/**
 * 时光机 Mock 数据 —— 按 MM-DD 分组的多年记忆
 * yearsAgo / label 动态计算
 */

const now = Date.now();
const day = 86400_000;

export interface TimeMemory {
  id: string;
  type: 'memory' | 'echo';
  entry: Entry | null;     // null 表示"遥远的回声"占位态
  worldName: string;
  imageUrl?: string;
}

export interface TimeDateGroup {
  key: string;             // "MM-DD" 格式
  memories: TimeMemory[];
}

/* ── 05-25：多个年份的记忆 ── */
const date0525: TimeDateGroup = {
  key: '05-25',
  memories: [
    {
      id: 'tm-1',
      type: 'memory',
      worldName: '梦境花园',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWPq9dMrEaXHSGZi_U5oSDZOKsQwNQFxE9mFOSuxOxU9ErpbZXjDCWXPTiDlvMV7Au9mQBi5u_bIJs5XFS8wfsUpAgjdelUI3GPlNUFPP9JCt2_c24vq0JGEAqMrXEbN4tqll7fcMptDeOv8zt5t7ciNPaN_JxG63K2zvU8jzqpFmrJfR4LqW1NHo7lCx8hDMnNltnjrQaui_IW05cJEz8bOCvphRo_HT3bnMyZTBF1MOzEwGIoj-b3il2ydXbypOf3Gs9rivIy1Q',
      entry: {
        id: 'tm-entry-1',
        worldId: 'mock-1',
        userId: 'mock-user',
        title: '清晨的寂静',
        content: `我记得在新鲜薰衣草的香气中醒来。那时的世界似乎更小，更易掌控。

窗外的阳光斜斜地洒在木地板上，灰尘在光束里缓缓舞动。我记录下那些细微的变化——光斑从地板移动到墙面，从早晨到傍晚，像是时间的另一种语言。

那时候我还不明白，有些东西越是想要紧紧抓住，越是会从指缝间溜走。就像这束光，无论怎样努力，都无法将它留在同一个地方。

现在回想起来，那段时间的安静和秩序，像是一座小小的避难所。`,
        mode: 'normal',
        status: 'published',
        keywords: [],
        createdAt: new Date(now - 5 * 365 * day).toISOString(),
        updatedAt: new Date(now - 5 * 365 * day).toISOString(),
        readCount: 23,
      },
    },
    {
      id: 'tm-2',
      type: 'memory',
      worldName: '猫咪咖啡馆',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAp3XlsJrtW7htI-3ntRsfKo-QABTl_FThV1W2FxS_Xx76_YKAV87OP8OIZkTxXs1rp9PEY9TKHiNe9jW9TBpe-XrjaPQYAIBuyreZ2rAoPzl0xU7QDuZolxcc4HEEga7kOEqFvh_O1gOVRIBiOeHMJM43b_yyX3YuV1sNVkFpy9-bAtQ9z9msCy8w4GYB277OqgylClgu-d9oavJHHxzUstFpMJ12_Ot1thwtf6_a8OnPxqKrZRHNutD-uM7BRAV0kLqNwEzrvBFo',
      entry: {
        id: 'tm-entry-2',
        worldId: 'mock-5',
        userId: 'mock-user',
        title: '项目完成',
        content: `"我要赶紧完成项目开发"——我在日记里这样写道。

回头看，压力不过是过眼云烟。水晶球的世界仍在旋转，而我当时以为的终点，其实只是一个小小的路标。

坐在咖啡馆靠窗的位置，耳机里放着轻音乐，键盘上的手指在飞快地敲击。窗外的行人来来往往，没有人知道我在写一个关于水晶球和记忆的故事。

有时候最幸福的时刻，就是你知道自己在做一件对的事情，即使周围没有人理解。`,
        mode: 'normal',
        status: 'published',
        keywords: [],
        createdAt: new Date(now - 365 * day).toISOString(),
        updatedAt: new Date(now - 365 * day).toISOString(),
        readCount: 15,
      },
    },
  ],
};

/* ── 06-01 ── */
const date0601: TimeDateGroup = {
  key: '06-01',
  memories: [
    {
      id: 'tm-4',
      type: 'memory',
      worldName: '深海图书馆',
      imageUrl: '',
      entry: {
        id: 'tm-entry-3',
        worldId: 'mock-2',
        userId: 'mock-user',
        title: '海底的留言瓶',
        content: `今天翻到了一篇关于海洋的旧文章。忽然想起三年前去海边的那次旅行。

退潮后的沙滩上留下了一道道波纹，像是大海写给天空的信。
我在沙滩上写了几个字，还没来得及拍照，下一个浪头就把它们抹平了。

海水带走的不仅是字迹，还有那个夏天的燥热和不安。
留下的是被冲刷过的、干净的沙滩，和我记住了的那种咸咸的味道。`,
        mode: 'normal',
        status: 'published',
        keywords: [],
        createdAt: new Date(now - 3 * 365 * day).toISOString(),
        updatedAt: new Date(now - 3 * 365 * day).toISOString(),
        readCount: 18,
      },
    },
    {
      id: 'tm-5',
      type: 'memory',
      worldName: '极光信箱',
      imageUrl: '',
      entry: {
        id: 'tm-entry-4',
        worldId: 'mock-4',
        userId: 'mock-user',
        title: '写给未来的信',
        content: `亲爱的未来的我：

今天天气很好，阳光透过树叶洒下斑驳的影子。
我在咖啡馆写到一半，笔没墨了，只好停下来去找墨水。

你知道吗，有时候我觉得生活就像是一支快没墨的笔——
写出来的字迹断断续续，但正因为如此，每一个字才更值得被珍惜。

希望收到这封信的你，还保持着写字的心情。`,
        mode: 'timecapsule',
        status: 'published',
        keywords: [],
        createdAt: new Date(now - 365 * day).toISOString(),
        updatedAt: new Date(now - 365 * day).toISOString(),
        readCount: 11,
      },
    },
  ],
};

/* ── 07-15 ── */
const date0715: TimeDateGroup = {
  key: '07-15',
  memories: [
    {
      id: 'tm-6',
      type: 'memory',
      worldName: '火山熔岩日记',
      imageUrl: '',
      entry: {
        id: 'tm-entry-5',
        worldId: 'mock-3',
        userId: 'mock-user',
        title: '余温',
        content: `火山口的岩石还有余温。站在边缘往下看，红色的光芒在黑暗的缝隙里缓缓跳动。

导游说这座火山已经三百年没有喷发了。三百年前的某个人，也许也站在这里看过同样的光。

我突然想到，我们所经历的每一件小事，快乐或痛苦，最终都会沉淀下来，变成岩石里一道微不可见的纹路。

在漫长的时间面前，一切都会冷却，只剩下安静的轮廓。`,
        mode: 'normal',
        status: 'published',
        keywords: [],
        createdAt: new Date(now - 2 * 365 * day).toISOString(),
        updatedAt: new Date(now - 2 * 365 * day).toISOString(),
        readCount: 8,
      },
    },
    {
      id: 'tm-7',
      type: 'memory',
      worldName: '梦境花园',
      imageUrl: '',
      entry: {
        id: 'tm-entry-6',
        worldId: 'mock-1',
        userId: 'mock-user',
        title: '夜晚的星星',
        content: `今晚的星星特别多。沿着河堤走了好久，风吹过来不冷不热刚刚好。

对面楼里亮着的窗户越来越少，每一扇窗后面都有一个正在发生的故事吧。我不想打探那些故事，光是知道它们存在，就觉得这个世界很拥挤也很安心。

河面上倒映着零星的灯光，风一吹就碎了，又慢慢聚拢。

我想，记忆大概也是这样——碎了又聚，聚了又碎，从来不会真正消失。`,
        mode: 'normal',
        status: 'published',
        keywords: [],
        createdAt: new Date(now - 365 * day).toISOString(),
        updatedAt: new Date(now - 365 * day).toISOString(),
        readCount: 12,
      },
    },
  ],
};

/* ── 03-12（额外示例：只有一年有记录）── */
const date0312: TimeDateGroup = {
  key: '03-12',
  memories: [
    {
      id: 'tm-8',
      type: 'memory',
      worldName: '梦境花园',
      imageUrl: '',
      entry: {
        id: 'tm-entry-7',
        worldId: 'mock-1',
        userId: 'mock-user',
        title: '春天的第一个电话',
        content: `窗外的玉兰花开了，白得像一盏盏小灯。
今天接到一个很久没联系的朋友的电话，声音听起来和以前一样。
我们聊了一个下午，从工作聊到生活，从过去聊到未来。

挂掉电话之后，屋子里变得特别安静。
那种安静不是寂寞，而是一种被填满之后的满足。`,
        mode: 'normal',
        status: 'published',
        keywords: [],
        createdAt: new Date(now - 4 * 365 * day).toISOString(),
        updatedAt: new Date(now - 4 * 365 * day).toISOString(),
        readCount: 7,
      },
    },
  ],
};

/* ── 所有数据映射 ── */
const ALL_GROUPS: TimeDateGroup[] = [
  date0525,
  date0601,
  date0715,
  date0312,
];

/** 按 MM-DD 构建查找 Map */
export const MOCK_TIME_MEMORIES_MAP: Record<string, TimeDateGroup> = {};
ALL_GROUPS.forEach(g => {
  MOCK_TIME_MEMORIES_MAP[g.key] = g;
});

/** 获取所有可用的 MM-DD 键列表 */
export const MOCK_TIME_KEYS = ALL_GROUPS.map(g => g.key);

/** 根据 MM-DD 获取记忆组 */
export function getTimeMemoriesByDate(mmdd: string): TimeMemory[] | null {
  return MOCK_TIME_MEMORIES_MAP[mmdd]?.memories ?? null;
}

/** 计算 yearAgo 中文标签 */
const CN_NUMBERS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
export function formatYearsAgo(years: number): string {
  if (years <= 0) return '今年';
  if (years <= 10) return `${CN_NUMBERS[years]}年前的今天`;
  return `${years}年前的今天`;
}
