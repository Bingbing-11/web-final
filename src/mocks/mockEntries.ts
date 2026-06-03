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

  /* ════════════════ amber-2 Sunset Beach ════════════════ */
  {
    id: 'entry-amber2-1',
    worldId: 'amber-2',
    userId: 'mock-user',
    title: '金色海浪',
    content: `今天的日落是我见过最浓烈的颜色。
整个天空从橙红渐变到玫瑰紫，像是在举行一场盛大的告别仪式。

海浪把余晖揉碎了又拼起来，一遍又一遍。
我脱了鞋踩在退潮后的沙滩上，脚印很快就被水抹平了。
也好，这样就没有人知道我来过。`,
    mode: 'normal',
    status: 'published',
    emotion: '宁静',
    emotionHue: 30,
    keywords: ['日落', '海滩', '治愈'],
    createdAt: new Date(now - 8 * day).toISOString(),
    updatedAt: new Date(now - 8 * day).toISOString(),
    readCount: 6,
  },
  {
    id: 'entry-amber2-2',
    worldId: 'amber-2',
    userId: 'mock-user',
    title: '漂流瓶',
    content: `捡到一个半埋在沙里的玻璃瓶，里面塞着一张潮透的纸条。
展开来只能看清几个字："…还在等…"
不知道它在海里漂了多久，也不知道等它的那个人还在不在等。

我把瓶子洗干净带回了家，插了一枝干花进去。
现在它是一件新的摆件了。`,
    mode: 'normal',
    status: 'published',
    emotion: '好奇',
    emotionHue: 210,
    keywords: ['漂流瓶', '海滩', '发现'],
    createdAt: new Date(now - 6 * day).toISOString(),
    updatedAt: new Date(now - 6 * day).toISOString(),
    readCount: 4,
  },

  /* ════════════════ amber-3 Midnight Rain ════════════════ */
  {
    id: 'entry-amber3-1',
    worldId: 'amber-3',
    userId: 'mock-user',
    title: '窗边的雨',
    content: `半夜被雨声吵醒了。
也不想睡，就披了件外套坐在窗边看雨。

路灯把雨丝照得像一根根发亮的银线，
整条街道都是湿漉漉的反光，像覆盖了一层黑釉。

这样的夜晚最适合想一些不会说出口的事吧。`,
    mode: 'normal',
    status: 'published',
    emotion: '沉思',
    emotionHue: 240,
    keywords: ['雨夜', '独处', '沉思'],
    createdAt: new Date(now - 15 * day).toISOString(),
    updatedAt: new Date(now - 15 * day).toISOString(),
    readCount: 9,
  },

  /* ════════════════ amber-4 Old Library ════════════════ */
  {
    id: 'entry-amber4-1',
    worldId: 'amber-4',
    userId: 'mock-user',
    title: '书页之间',
    content: `在旧书市集淘到一本1978年的日记本。
前主人是一个叫"林"的人，字迹清秀，断断续续写了三年。

翻到最后一页，只写了四个字：
"算了，不记了。"

不知道为什么，看到这里笑了一下。又觉得有点心酸。`,
    mode: 'normal',
    status: 'published',
    emotion: '感动',
    emotionHue: 350,
    keywords: ['旧书', '日记', '回忆'],
    createdAt: new Date(now - 22 * day).toISOString(),
    updatedAt: new Date(now - 22 * day).toISOString(),
    readCount: 14,
  },
  {
    id: 'entry-amber4-2',
    worldId: 'amber-4',
    userId: 'mock-user',
    title: '借阅记录',
    content: `在图书馆的旧书借阅记录卡上，看到同一个名字出现了七次。
借的书从《海子诗选》到《数据结构》，跨度大得离谱。

不知道这个人后来怎么样了。
现在还读书吗？还像当年一样什么都想看看吗？

我把卡放回去，夹了一枚书签——也许下一个看见的人也会想这些问题。`,
    mode: 'normal',
    status: 'published',
    emotion: '温暖',
    emotionHue: 40,
    keywords: ['图书馆', '阅读', '时间'],
    createdAt: new Date(now - 20 * day).toISOString(),
    updatedAt: new Date(now - 20 * day).toISOString(),
    readCount: 11,
  },

  /* ════════════════ amber-5 Forest Mist ════════════════ */
  {
    id: 'entry-amber5-1',
    worldId: 'amber-5',
    userId: 'mock-user',
    title: '晨雾',
    content: `五点醒的，天还没亮。
推开窗户，白茫茫一片。

穿上外套去了后山的松林。雾大得十步之外就看不见人了，
只能听见自己的脚步踩在松针上发出的沙沙声。

走到一半忽然停下——世界好像消失了。
没有方向，没有目的，只有脚下的路和眼前的雾。
这种感觉意外地让人安心。`,
    mode: 'normal',
    status: 'published',
    emotion: '安宁',
    emotionHue: 150,
    keywords: ['森林', '雾', '清晨'],
    createdAt: new Date(now - 31 * day).toISOString(),
    updatedAt: new Date(now - 31 * day).toISOString(),
    readCount: 7,
  },

  /* ════════════════ amber-6 Starry Night ════════════════ */
  {
    id: 'entry-amber6-1',
    worldId: 'amber-6',
    userId: 'mock-user',
    title: '银河',
    content: `开车到远离城市灯光的地方看星星。
躺在引擎盖上，感觉自己像浮在宇宙中间。

银河不是一条河，
是一道由无数个遥远的太阳组成的旋臂。
每一颗都比我们的太阳大，每一颗都孤独地燃烧了数十亿年。

想到这里，今晚遇到的那点烦恼突然就不算什么了。`,
    mode: 'normal',
    status: 'published',
    emotion: '敬畏',
    emotionHue: 260,
    keywords: ['星空', '银河', '宇宙'],
    createdAt: new Date(now - 46 * day).toISOString(),
    updatedAt: new Date(now - 46 * day).toISOString(),
    readCount: 16,
  },
  {
    id: 'entry-amber6-2',
    worldId: 'amber-6',
    userId: 'mock-user',
    title: '流星',
    content: `看到一颗流星。
太快了，来不及许愿就消失了。

旁边的朋友说："没许到愿好可惜。"
我说："能看见就已经很幸运了。"

后来想想，也许流星的意义不是让你许愿，
而是提醒你——有些美好转瞬即逝，所以记得抬头看。`,
    mode: 'normal',
    status: 'published',
    emotion: '感动',
    emotionHue: 300,
    keywords: ['流星', '朋友', '感悟'],
    createdAt: new Date(now - 44 * day).toISOString(),
    updatedAt: new Date(now - 44 * day).toISOString(),
    readCount: 13,
  },

  /* ════════════════ amber-7 Cherry Blossom ════════════════ */
  {
    id: 'entry-amber7-1',
    worldId: 'amber-7',
    userId: 'mock-user',
    title: '樱吹雪',
    content: `在樱花树下坐了整整一个下午。
风一吹，花瓣就像雪一样落下来，落在头上、肩膀上、翻开的书页上。

旁边有个老人在画水彩，画的不是樱花，是坐在树下的我。
他画完给我看，我笑了——在他的画里，我变成了樱花树上的一片花瓣。

他说："你坐在那里的时候，本来就是风景的一部分。"`,
    mode: 'normal',
    status: 'published',
    emotion: '幸福',
    emotionHue: 340,
    keywords: ['樱花', '春天', '偶遇'],
    createdAt: new Date(now - 61 * day).toISOString(),
    updatedAt: new Date(now - 61 * day).toISOString(),
    readCount: 22,
  },

  /* ════════════════ amber-8 Winter Solitude ════════════════ */
  {
    id: 'entry-amber8-1',
    worldId: 'amber-8',
    userId: 'mock-user',
    title: '初雪',
    content: `今年冬天的第一场雪。
不大，薄薄的一层，像面粉撒在大地上。

小区里很安静，没有人出来扫雪，也没有人出来玩。
大家都躲在温暖的屋子里，隔着玻璃看外面白色的世界。

只有我一个人在外面。
没有特别的原因，只是觉得——如果第一场雪没有人踩过，它会不会太寂寞了。`,
    mode: 'normal',
    status: 'published',
    emotion: '孤单',
    emotionHue: 200,
    keywords: ['雪', '冬天', '独处'],
    createdAt: new Date(now - 91 * day).toISOString(),
    updatedAt: new Date(now - 91 * day).toISOString(),
    readCount: 5,
  },
  /* ════════════════ 好友世界日记 (friend world entries) ════════════════ */

  /* ─── friend-u1-world 雪山 (小星) ─── */
  {
    id: 'entry-f1-1',
    worldId: 'friend-u1-world',
    userId: 'u1',
    title: '山顶的日出',
    content: `凌晨四点出发，打着手电走了一个半小时的山路。\n\n到达山顶的时候天刚好亮起来。太阳从云海里跳出来的那一刻，金色洒满了雪山的每一道褶皱。\n\n我拍了照，但觉得还是不够。\n有些景色只能用心记住。`,
    mode: 'normal',
    status: 'published',
    emotion: '震撼',
    emotionHue: 35,
    keywords: ['雪山', '日出', '登山'],
    createdAt: new Date(now - 2 * day).toISOString(),
    updatedAt: new Date(now - 2 * day).toISOString(),
    readCount: 5,
  },
  {
    id: 'entry-f1-2',
    worldId: 'friend-u1-world',
    userId: 'u1',
    title: '雪地上的脚印',
    content: `今早推开木屋的门，发现外面的雪地上有两串小脚印。\n\n不是人的，是某种小动物的。跟着脚印走了一段，最后消失在松树林里。\n\n我猜是狐狸。\n它也许在夜里来过，看了看这间亮着灯的木屋，又走了。`,
    mode: 'normal',
    status: 'published',
    emotion: '好奇',
    emotionHue: 180,
    keywords: ['雪地', '动物', '冬天'],
    createdAt: new Date(now - 5 * day).toISOString(),
    updatedAt: new Date(now - 5 * day).toISOString(),
    readCount: 8,
  },
  {
    id: 'entry-f1-3',
    worldId: 'friend-u1-world',
    userId: 'u1',
    title: '',
    content: `下了一整天的雪，山上很安静。\n\n泡了一壶热茶坐在窗前，看雪花一片一片贴到玻璃上。\n屋里炉火烧得旺，木柴偶尔发出噼啪的声响。\n\n这样的日子，什么也不做就很好。`,
    mode: 'normal',
    status: 'published',
    emotion: '平静',
    emotionHue: 200,
    keywords: ['下雪', '独处', '温暖'],
    createdAt: new Date(now - 8 * day).toISOString(),
    updatedAt: new Date(now - 8 * day).toISOString(),
    readCount: 3,
  },

  /* ─── friend-u2-world 月光森林 (阿月) ─── */
  {
    id: 'entry-f2-1',
    worldId: 'friend-u2-world',
    userId: 'u2',
    title: '萤火虫之夜',
    content: `今晚和几个朋友去森林深处看萤火虫。\n\n走了大约二十分钟，前面的人突然停下，熄了手电。\n然后我们就看到了——整片空地被萤火虫照亮了，像星空掉到了地上。\n\n没有人说话。\n那种安静是会传染的。`,
    mode: 'normal',
    status: 'published',
    emotion: '惊喜',
    emotionHue: 120,
    keywords: ['萤火虫', '森林', '夜晚'],
    createdAt: new Date(now - 1 * day).toISOString(),
    updatedAt: new Date(now - 1 * day).toISOString(),
    readCount: 12,
  },
  {
    id: 'entry-f2-2',
    worldId: 'friend-u2-world',
    userId: 'u2',
    title: '树洞',
    content: `在森林里发现一棵老榕树，树干上有一个很深的洞。\n\n把耳朵贴上去，能听到风在里面转圈的声音，像有人在很远的地方说话。\n\n我在树洞里放了一张纸条，写的是今天一直想但没说出口的话。\n这样就够了。`,
    mode: 'normal',
    status: 'published',
    emotion: '释然',
    emotionHue: 160,
    keywords: ['树洞', '秘密', '森林'],
    createdAt: new Date(now - 3 * day).toISOString(),
    updatedAt: new Date(now - 3 * day).toISOString(),
    readCount: 7,
  },

  /* ─── friend-u3-world 我跟他的日常 (流云) ─── */
  {
    id: 'entry-f3-1',
    worldId: 'friend-u3-world',
    userId: 'u3',
    title: '飞机上的日落',
    content: `今天他第一次来我实习的公司找我吃午饭。我在楼下等他，看他穿着那件洗得有点发白的卫衣从地铁口走出来，头发被风吹得乱七八糟，心里忽然被什么东西撞了一下。\n\n吃饭的时候他一直在给我夹菜，说他周末学了新菜，下回做给我吃。我问是什么，他说「会发光的东西」，然后憋了半天承认是番茄炒蛋——因为「鸡蛋黄黄的，番茄红红的，看起来就很亮」。我笑了整整两分钟。\n\n回去路上他非要牵着手过马路，说这样「安全」。我说绿灯了不走才不安全。他说那是红灯。我看了一眼，确实。\n\n行吧，有时候他比我看得清楚。`,
    mode: 'normal',
    status: 'published',
    emotion: '感动',
    emotionHue: 320,
    keywords: ['飞行', '日落', '云'],
    createdAt: new Date(now - 2 * day).toISOString(),
    updatedAt: new Date(now - 2 * day).toISOString(),
    readCount: 9,
  },
  {
    id: 'entry-f3-2',
    worldId: 'friend-u3-world',
    userId: 'u3',
    title: '云的名字',
    content: `下午在家两个人窝沙发上看电影，选了部评分很低的老片，全程吐槽。他毒舌功力见长，我笑得肚子疼。电影演到一半我睡着了，醒的时候头枕在他腿上，身上盖了他的外套。屏幕上已经在放片尾字幕，他低头看我醒了，若无其事说了句：「刚演到你睡着的那段，特别精彩。」\n\n晚上他叫了外卖，名字写错了，东西送错了。我正要打电话投诉，他已经津津有味地吃上了，说「这家随机派送挺好的，每次都有惊喜」。我不知道他是真的豁达还是单纯的懒，但看他吃得开心，我也跟着开心了。\n\n后来我偷偷把外卖App里他的默认地址备注改成了「请勿随机派送」。这事没告诉他。`,
    mode: 'normal',
    status: 'published',
    emotion: '开心',
    emotionHue: 45,
    keywords: ['云', '学习', '童年'],
    createdAt: new Date(now - 5 * day).toISOString(),
    updatedAt: new Date(now - 5 * day).toISOString(),
    readCount: 4,
  },

  /* ─── friend-u4-world 鹿鸣谷 (小鹿) ─── */
  {
    id: 'entry-f4-1',
    worldId: 'friend-u4-world',
    userId: 'u4',
    title: '遇见鹿群',
    content: `清晨在山谷里散步的时候，远远看到一群鹿在溪边喝水。\n\n大概有七八只，领头的那只角特别大。\n我悄悄蹲下来，不敢动，怕惊走它们。\n\n有一只小鹿好像发现了我，歪着头看了我好一会儿，然后又低头喝水去了。\n被一只鹿信任的感觉，真好。`,
    mode: 'normal',
    status: 'published',
    emotion: '治愈',
    emotionHue: 140,
    keywords: ['鹿', '山谷', '清晨'],
    createdAt: new Date(now - 1 * day).toISOString(),
    updatedAt: new Date(now - 1 * day).toISOString(),
    readCount: 11,
  },

  /* ─── friend-u5-world 林间小屋 (木子) ─── */
  {
    id: 'entry-f5-1',
    worldId: 'friend-u5-world',
    userId: 'u5',
    title: '木工日记',
    content: `花了两天时间做了一张小木桌。\n\n不是什么很精致的东西，甚至有一边的腿有点短，垫了一块木片才稳。\n但这是我自己做的。\n\n每次看到它就觉得——啊，原来我也可以创造点什么。`,
    mode: 'normal',
    status: 'published',
    emotion: '满足',
    emotionHue: 30,
    keywords: ['木工', '手工', '小屋'],
    createdAt: new Date(now - 4 * day).toISOString(),
    updatedAt: new Date(now - 4 * day).toISOString(),
    readCount: 6,
  },
  {
    id: 'entry-f5-2',
    worldId: 'friend-u5-world',
    userId: 'u5',
    title: '雨天的早晨',
    content: `下雨了，不能去林子里，就在屋里待着。\n\n把前几天捡的松果涂了颜色，摆在窗台上。\n红色的、蓝色的、金色的——一排彩色的松果。\n\n没有什么特别的意义，就是觉得好看。\n也许有些事不需要意义。`,
    mode: 'normal',
    status: 'published',
    emotion: '放松',
    emotionHue: 80,
    keywords: ['雨天', '松果', '手工'],
    createdAt: new Date(now - 7 * day).toISOString(),
    updatedAt: new Date(now - 7 * day).toISOString(),
    readCount: 5,
  },

  /* ─── friend-u6-world 向日葵田 (晴天) ─── */
  {
    id: 'entry-f6-1',
    worldId: 'friend-u6-world',
    userId: 'u6',
    title: '向日葵开了',
    content: `今年的第一朵向日葵开了。\n\n比去年早了三天。\n蹲在田边看了好久，花盘慢慢地跟着太阳转，像是在跳一支很慢很慢的舞。\n\n种了三年向日葵，每年开花的时候还是会像第一次一样开心。`,
    mode: 'normal',
    status: 'published',
    emotion: '开心',
    emotionHue: 45,
    keywords: ['向日葵', '开花', '夏天'],
    createdAt: new Date(now - 1 * day).toISOString(),
    updatedAt: new Date(now - 1 * day).toISOString(),
    readCount: 14,
  },
  {
    id: 'entry-f6-2',
    worldId: 'friend-u6-world',
    userId: 'u6',
    title: '向日葵田的黄昏',
    content: `傍晚的时候起了风，整片向日葵田像波浪一样摇摆。\n\n金黄色的波浪，连着天边橙色的晚霞。\n坐在田埂上直到天完全黑了。\n\n一只萤火虫从我面前飞过，像是一颗小星星迷了路，掉进了这片向日葵田里。`,
    mode: 'normal',
    status: 'published',
    emotion: '宁静',
    emotionHue: 40,
    keywords: ['黄昏', '向日葵', '萤火虫'],
    createdAt: new Date(now - 3 * day).toISOString(),
    updatedAt: new Date(now - 3 * day).toISOString(),
    readCount: 10,
  },
  {
    id: 'entry-f6-3',
    worldId: 'friend-u6-world',
    userId: 'u6',
    title: '收种子',
    content: `今天收了向日葵种子。\n\n把它们装进玻璃瓶里，贴着标签写了"2026·夏"。\n每颗种子都可能是一朵新的向日葵。\n\n把一半留给自己，另一半准备分给朋友们。\n希望明年你们的窗前也能有一朵向日葵。`,
    mode: 'normal',
    status: 'published',
    emotion: '期待',
    emotionHue: 50,
    keywords: ['种子', '分享', '收获'],
    createdAt: new Date(now - 6 * day).toISOString(),
    updatedAt: new Date(now - 6 * day).toISOString(),
    readCount: 7,
  },

  {
    id: 'entry-amber8-2',
    worldId: 'amber-8',
    userId: 'mock-user',
    title: '暖炉旁',
    content: `从雪地里回来后泡了一杯热可可。
双手捧着杯子坐在暖炉前，看窗外又开始飘雪。

忽然想起一件事——
去年的冬天，窗外也是这样下着雪，我却在为一些现在根本想不起来的事情烦恼。

时间真是个温柔的东西。
它带走了所有不值得记住的，留下的都是让人微笑的回忆。`,
    mode: 'normal',
    status: 'published',
    emotion: '感恩',
    emotionHue: 30,
    keywords: ['暖炉', '热可可', '回忆'],
    createdAt: new Date(now - 90 * day).toISOString(),
    updatedAt: new Date(now - 90 * day).toISOString(),
    readCount: 8,
  },
];
