import type { Entry } from '../types/entry';

/**
 * Mock 日记数据 —— 仅开发环境使用
 * worldId 对应 mockWorlds.ts 中的 id（mock-1 ~ mock-5）
 * 覆盖状态：normal / burned
 */

const now = Date.now();
const day = 86400_000;
const hour = 3600_000;

export const mockEntries: Entry[] = [
  /* ════════════════ mock-1 梦境花园 ════════════════ */
  {
    id: 'entry-1-1',
    worldId: 'mock-1',
    userId: 'mock-user',
    title: '云朵棉花糖',
    content: `今天的云像棉花糖，软软地铺满了整个天空。

下午三点，阳光从窗帘缝隙里溜进来，在地板上画了一道金色的线。我蹲下来看那束光里飞舞的灰尘，像无数微小的星星。

忽然想起小时候奶奶说，每一朵云都是天空写给大地的信。
那时候我总想爬上梯子去拆信，现在却只想静静地看完一整封信慢慢散开。`,
    mode: 'normal',
    status: 'published',
    emotion: '平静',
    emotionHue: 180,
    keywords: ['天空', '阳光', '童年'],
    createdAt: new Date(now - 1 * hour).toISOString(),
    updatedAt: new Date(now - 1 * hour).toISOString(),
    readCount: 3,
  },
  {
    id: 'entry-1-2',
    worldId: 'mock-1',
    userId: 'mock-user',
    title: '玫瑰开了',
    content: `花园里的玫瑰开了，是你说喜欢的那个品种——龙沙宝石。

第一朵是昨天清晨发现的，花瓣层层叠叠像小裙摆。我拍了张照片想发给你，又觉得照片永远拍不出那种淡淡的粉白色，像是被水洗过很多遍之后留下的温柔。`,
    mode: 'normal',
    status: 'published',
    emotion: '期待',
    emotionHue: 320,
    keywords: ['花朵', '玫瑰', '春天'],
    createdAt: new Date(now - 5 * hour).toISOString(),
    updatedAt: new Date(now - 5 * hour).toISOString(),
    readCount: 7,
  },
  {
    id: 'entry-1-3',
    worldId: 'mock-1',
    userId: 'mock-user',
    title: '雨后的泥土味',
    content: `昨晚下了一场雨，今早推开门就闻到那种味道。

不是花香，不是草香，是泥土被雨唤醒之后特有的气息。深吸一口气，感觉整个人都沉静下来了。

穿着拖鞋踩在湿漉漉的石板路上，水洼里倒映着洗过的天空。
一只橘猫从篱笆上跳下来，看了我一眼，又若无其事地走开了。

有些幸福不需要什么特别的理由，
只需要一个雨后的早晨，和一双愿意弄湿的鞋子。`,
    mode: 'normal',
    status: 'published',
    emotion: '治愈',
    emotionHue: 140,
    keywords: ['雨天', '猫咪', '散步'],
    createdAt: new Date(now - 1 * day).toISOString(),
    updatedAt: new Date(now - 1 * day).toISOString(),
    readCount: 12,
  },
  {
    id: 'entry-1-4',
    worldId: 'mock-1',
    userId: 'mock-user',
    title: '',
    content: `在书店角落待了整个下午。
翻到一本旧诗集，第 47 页折了一角，上面写着：

"你不必成为谁的答案，
你本身就是一道完整的题目。"

把那页拍下来做了书签。
走出书店的时候天已经暗了，路灯刚好亮起，像是为我一个人点亮的。`,
    mode: 'normal',
    status: 'published',
    emotion: '温暖',
    emotionHue: 35,
    keywords: ['书店', '诗句'],
    createdAt: new Date(now - 2 * day).toISOString(),
    updatedAt: new Date(now - 2 * day).toISOString(),
    readCount: 5,
  },
  {
    id: 'entry-1-5',
    worldId: 'mock-1',
    userId: 'mock-user',
    title: '星夜散步',
    content: `今晚的星星特别多。
沿着河堤走了好久，风吹过来不冷不热刚刚好。

对面楼里亮着的窗户越来越少，每一盏灯背后都是一个正在发生的故事吧。
我不想知道那些故事，光是知道它们存在，就觉得世界很拥挤也很安心。`,
    mode: 'normal',
    status: 'published',
    emotion: '安宁',
    emotionHue: 230,
    keywords: ['夜晚', '星星', '散步'],
    createdAt: new Date(now - 3 * day).toISOString(),
    updatedAt: new Date(now - 3 * day).toISOString(),
    readCount: 9,
  },
  /* ─── 已焚烧的日记 ─── */
  {
    id: 'entry-1-burned',
    worldId: 'mock-1',
    userId: 'mock-user',
    title: '秘密',
    content: '这一页已经随着火焰化为灰烬，只留下淡淡的痕迹。',
    mode: 'burn',
    status: 'burned',
    emotion: undefined,
    emotionHue: undefined,
    keywords: [],
    createdAt: new Date(now - 10 * day).toISOString(),
    updatedAt: new Date(now - 10 * day).toISOString(),
    readCount: 2,
    burnedAt: new Date(now - 7 * day).toISOString(),
  },

  /* ════════════════ mock-2 深海图书馆 ════════════════ */
  {
    id: 'entry-2-1',
    worldId: 'mock-2',
    userId: 'mock-user',
    title: '海底字迹',
    content: `翻到一页被海水浸泡的字迹，依稀可辨几个词：
"……光"、"……回声"、……"深海"

墨水晕开的样子很好看，像是某种水生植物在水流中舒展的形状。
我把这页单独剪了下来，夹在玻璃相框里挂在墙上。
现在它成了一幅画。`,
    mode: 'normal',
    status: 'published',
    emotion: '好奇',
    emotionHue: 210,
    keywords: ['海洋', '文字', '发现'],
    createdAt: new Date(now - 3 * hour).toISOString(),
    updatedAt: new Date(now - 3 * hour).toISOString(),
    readCount: 4,
  },
  {
    id: 'entry-2-2',
    worldId: 'mock-2',
    userId: 'mock-user',
    title: '气泡诗',
    content: `今天写了一首短诗，关于气泡：
每个气泡都是一句没说完的话，
升到水面就破了，
但那一瞬间的弧光，
已经足够证明它存在过。`,
    mode: 'timecapsule',
    status: 'published',
    emotion: '诗意',
    emotionHue: 260,
    keywords: ['诗歌', '气泡'],
    createdAt: new Date(now - 1 * day).toISOString(),
    updatedAt: new Date(now - 1 * day).toISOString(),
    readCount: 6,
  },

  /* ════════════════ mock-3 火山熔岩日记 ════════════════ */
  {
    id: 'entry-3-1',
    worldId: 'mock-3',
    userId: 'mock-user',
    title: '余温',
    content: `火山口还有余温。
站在边缘往下看，红色的光在黑暗的岩石缝隙里跳动，像一颗巨大的心脏还在缓慢地搏动。

导游说这座火山上次喷发是三百年前。
三百年前的某个人，也许也站在这里看过同样的光。`,
    mode: 'normal',
    status: 'published',
    emotion: '震撼',
    emotionHue: 15,
    keywords: ['火山', '旅行'],
    createdAt: new Date(now - 2 * day).toISOString(),
    updatedAt: new Date(now - 2 * day).toISOString(),
    readCount: 8,
  },

  /* ════════════════ mock-4 极光信箱 ════════════════ */
  {
    id: 'entry-4-1',
    worldId: 'mock-4',
    userId: 'mock-user',
    title: '寄给五年后',
    content: `亲爱的五年后的我：

你现在还在写日记吗？梦境花园的花还开着吗？
如果你已经不再惊讶于一朵花的开放，请记得翻回这一页。
我想提醒那个你——曾经有一个傍晚，因为看到晚霞而驻足了整整二十分钟。

那时候的幸福很简单，
希望现在的你也一样。`,
    mode: 'timecapsule',
    status: 'published',
    emotion: '希望',
    emotionHue: 160,
    keywords: ['未来', '信件'],
    createdAt: new Date(now - 5 * day).toISOString(),
    updatedAt: new Date(now - 5 * day).toISOString(),
    readCount: 11,
  },

  /* ════════════════ mock-5 猫咪咖啡馆 ════════════════ */
  {
    id: 'entry-5-1',
    worldId: 'mock-5',
    userId: 'mock-user',
    title: '小橘又闯祸了',
    content: `小橘又把杯子推倒了，但看它的脸实在生不起气。
咖啡洒了一桌子，它坐在旁边舔爪子，一脸无辜。

店员笑着递来抹布："习惯了，它每周至少打翻三次杯。"
我问它叫什么名字。"没有名字，大家叫它橘子就行，因为它到哪里都像在自己家。"

也许这就是猫的哲学——
走到哪里，哪里就是家。`,
    mode: 'normal',
    status: 'published',
    emotion: '开心',
    emotionHue: 45,
    keywords: ['猫咪', '日常'],
    createdAt: new Date(now - 12 * hour).toISOString(),
    updatedAt: new Date(now - 12 * hour).toISOString(),
    readCount: 15,
  },
  {
    id: 'entry-5-2',
    worldId: 'mock-5',
    userId: 'mock-user',
    title: '拿铁配方惊喜',
    content: `今天的拿铁换了一个新配方——加了肉桂粉和一点点海盐。
第一口下去，咸甜交织的味道在舌尖炸开，像一场小型烟花。

把配方记下来了：
双份浓缩 + 燕麦奶 + 肉桂粉少许 + 海盐一小撮 + 焦糖酱沿杯壁一圈。

下次你来的时候请你喝。`,
    mode: 'normal',
    status: 'published',
    emotion: '满足',
    emotionHue: 30,
    keywords: ['咖啡', '美食'],
    createdAt: new Date(now - 1 * day).toISOString(),
    updatedAt: new Date(now - 1 * day).toISOString(),
    readCount: 20,
  },
];
