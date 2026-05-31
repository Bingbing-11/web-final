/**
 * 共鸣池 Mock 数据 —— 星系集群
 *
 * 核心逻辑：每个用户看到的共鸣池，中央永远是自己的故事，
 * 周围是陌生人的相似故事 —— 让用户感受到「世界上有人和我一样」
 *
 * 中央节点 = 当前用户的日记（省略版）
 * 卫星节点 = 其他共鸣用户（部分匿名用户名 + 大概故事）
 */

export interface ClusterNode {
  id: string;
  authorName: string;
  displayName: string; // 中央：省略版文字；卫星：匿名用户名
  content: string; // 完整故事
  abbreviated: string; // 圆圈内显示的缩略文字
  worldName?: string;
  createdAt?: string;
  emotion: string;
  emotionHue: number;
  resonanceCount?: number; // 收到的共鸣数（仅卫星节点）
  likedByMe?: boolean; // 当前用户是否已共鸣（仅卫星节点）
}

export interface ResonanceCluster {
  id: string;
  emotion: string;
  emotionHue: number;
  keywords: string[];
  centerNode: ClusterNode; // 永远是当前用户自己的故事
  satellites: ClusterNode[]; // 陌生人的相似故事
}

const now = Date.now();
const hour = 3600_000;
const day = 86400_000;

export const mockResonanceClusters: ResonanceCluster[] = [
  {
    id: 'cluster-happy',
    emotion: '开心',
    emotionHue: 45,
    keywords: ['阳光', '温暖', '晴天'],
    centerNode: {
      id: 'c1-center',
      authorName: '我',
      displayName: '我',
      content: '今天的阳光特别温暖，走在公园的小路上，看见花瓣随风飘落，心情也跟着明亮起来。坐在长椅上发了一会儿呆，感觉整个世界都在对我微笑。',
      abbreviated: '阳光温暖…',
      worldName: '梦境花园',
      createdAt: new Date(now - 2 * hour).toISOString(),
      emotion: '开心',
      emotionHue: 45,
    },
    satellites: [
      {
        id: 'c1-s1',
        authorName: '陈思雨',
        displayName: '陈**',
        content: '周末和好友去爬山，山顶的风吹散了所有烦恼，阳光洒在脸上暖洋洋的，觉得生活真好。',
        abbreviated: '陈**',
        emotion: '开心',
        emotionHue: 50,
        resonanceCount: 3,
        likedByMe: false,
      },
      {
        id: 'c1-s2',
        authorName: '旅者星辰',
        displayName: '旅者**',
        content: '久违的晴天，把被子晒了，整个房间都是阳光的味道，好幸福。',
        abbreviated: '旅者**',
        emotion: '开心',
        emotionHue: 40,
        resonanceCount: 7,
        likedByMe: true,
      },
      {
        id: 'c1-s3',
        authorName: '阿瑶',
        displayName: '阿*',
        content: '放学路上发现一家新开的甜品店，草莓蛋糕好好吃！明天还要来！',
        abbreviated: '阿*',
        emotion: '开心',
        emotionHue: 48,
        resonanceCount: 1,
        likedByMe: false,
      },
    ],
  },
  {
    id: 'cluster-miss',
    emotion: '思念',
    emotionHue: 280,
    keywords: ['想念', '回忆', '那些年'],
    centerNode: {
      id: 'c2-center',
      authorName: '我',
      displayName: '我',
      content: '又梦到了那个夏天，我们坐在天台上看星星，你说的话我还记得，可是你已经不在了。醒来的时候枕头湿了一片，才发现有些想念是不会随着时间消退的。',
      abbreviated: '梦到那个夏天…',
      worldName: '深海图书馆',
      createdAt: new Date(now - 1 * day).toISOString(),
      emotion: '思念',
      emotionHue: 280,
    },
    satellites: [
      {
        id: 'c2-s1',
        authorName: '小鹿',
        displayName: '小*',
        content: '翻到了去年的合照，那时候我们还天天在一起，好想回到那个时候。',
        abbreviated: '小*',
        emotion: '思念',
        emotionHue: 275,
        resonanceCount: 12,
        likedByMe: false,
      },
      {
        id: 'c2-s2',
        authorName: '匿名旅人',
        displayName: '匿名**',
        content: '每当听到那首歌，就会想起你，你已经不在我身边了。',
        abbreviated: '匿名**',
        emotion: '思念',
        emotionHue: 285,
        resonanceCount: 5,
        likedByMe: false,
      },
      {
        id: 'c2-s3',
        authorName: 'Momo',
        displayName: 'M***',
        content: '搬家时发现了你写的信，字迹都模糊了，可是内容我还记得。',
        abbreviated: 'M***',
        emotion: '思念',
        emotionHue: 270,
        resonanceCount: 2,
        likedByMe: true,
      },
      {
        id: 'c2-s4',
        authorName: '苏琳',
        displayName: '**琳',
        content: '一个人走在曾经一起走过的街道，好想回到那个时候，可惜再也回不去了。',
        abbreviated: '**琳',
        emotion: '思念',
        emotionHue: 282,
        resonanceCount: 8,
        likedByMe: false,
      },
      {
        id: 'c2-s5',
        authorName: '旅者清风',
        displayName: '旅者**',
        content: '看到和你长得像的人，心跳漏了一拍，然后发现不是你。',
        abbreviated: '旅者**',
        emotion: '思念',
        emotionHue: 278,
        resonanceCount: 4,
        likedByMe: false,
      },
    ],
  },
  {
    id: 'cluster-calm',
    emotion: '平静',
    emotionHue: 180,
    keywords: ['安静', '独处', '时光'],
    centerNode: {
      id: 'c3-center',
      authorName: '我',
      displayName: '我',
      content: '坐在窗边，听着雨声打在玻璃上，泡了一杯热茶，什么都不想，就这样静静待着。窗外的世界很安静，我的心也很安静。',
      abbreviated: '听雨声…',
      worldName: '极光信箱',
      createdAt: new Date(now - 6 * hour).toISOString(),
      emotion: '平静',
      emotionHue: 180,
    },
    satellites: [
      {
        id: 'c3-s1',
        authorName: '小叶',
        displayName: '小*',
        content: '清晨五点醒来，窗外天刚蒙蒙亮，整个世界都很安静，只有鸟叫声。',
        abbreviated: '小*',
        emotion: '平静',
        emotionHue: 175,
        resonanceCount: 6,
        likedByMe: false,
      },
      {
        id: 'c3-s2',
        authorName: '阿然',
        displayName: '阿*',
        content: '在图书馆坐了一下午，看完了那本搁置很久的书，好满足。',
        abbreviated: '阿*',
        emotion: '平静',
        emotionHue: 185,
        resonanceCount: 9,
        likedByMe: true,
      },
      {
        id: 'c3-s3',
        authorName: '许轩',
        displayName: '**轩',
        content: '海边散步，听浪声一遍一遍地涌来又退去，什么烦恼都被带走了。',
        abbreviated: '**轩',
        emotion: '平静',
        emotionHue: 178,
        resonanceCount: 3,
        likedByMe: false,
      },
    ],
  },
  {
    id: 'cluster-sad',
    emotion: '伤感',
    emotionHue: 220,
    keywords: ['失落', '独处', '夜晚'],
    centerNode: {
      id: 'c4-center',
      authorName: '我',
      displayName: '我',
      content: '今天收到了拒信，虽然早有预感，但打开的那一刻还是忍不住红了眼眶。努力了那么久，原来还是不够好。窗外的雨好像在替我哭。',
      abbreviated: '收到拒信…',
      createdAt: new Date(now - 3 * day).toISOString(),
      emotion: '伤感',
      emotionHue: 220,
    },
    satellites: [
      {
        id: 'c4-s1',
        authorName: '匿名旅人',
        displayName: '匿名**',
        content: '努力了那么久的事情，最后还是没有结果，好失望。',
        abbreviated: '匿名**',
        emotion: '伤感',
        emotionHue: 215,
        resonanceCount: 15,
        likedByMe: false,
      },
      {
        id: 'c4-s2',
        authorName: '小柯',
        displayName: '小*',
        content: '考试又没过，感觉自己好没用，不知道该怎么办。',
        abbreviated: '小*',
        emotion: '伤感',
        emotionHue: 225,
        resonanceCount: 10,
        likedByMe: true,
      },
      {
        id: 'c4-s3',
        authorName: 'Luna',
        displayName: 'L***',
        content: '看着他离开的背影，知道自己留不住，但还是好难过。',
        abbreviated: 'L***',
        emotion: '伤感',
        emotionHue: 218,
        resonanceCount: 6,
        likedByMe: false,
      },
      {
        id: 'c4-s4',
        authorName: '季月',
        displayName: '**月',
        content: '一个人在房间里哭，不想被任何人看到，但是好孤独。',
        abbreviated: '**月',
        emotion: '伤感',
        emotionHue: 222,
        resonanceCount: 8,
        likedByMe: false,
      },
      {
        id: 'c4-s5',
        authorName: '旅者暮光',
        displayName: '旅者**',
        content: '深夜两点还在辗转反侧，想着明天该怎么办，看不到出路。',
        abbreviated: '旅者**',
        emotion: '伤感',
        emotionHue: 220,
        resonanceCount: 4,
        likedByMe: false,
      },
      {
        id: 'c4-s6',
        authorName: '阿橙',
        displayName: '阿*',
        content: '生病了却没有人可以依靠，觉得自己好可怜。',
        abbreviated: '阿*',
        emotion: '伤感',
        emotionHue: 216,
        resonanceCount: 11,
        likedByMe: false,
      },
    ],
  },
  {
    id: 'cluster-gratitude',
    emotion: '感恩',
    emotionHue: 150,
    keywords: ['谢谢', '善意', '温暖'],
    centerNode: {
      id: 'c5-center',
      authorName: '我',
      displayName: '我',
      content: '谢谢那个在我最困难的时候伸出手的人，你可能不知道，那一句关心救了我。这个世界还是有温暖的，只是有时候需要走很远的路才能遇见。',
      abbreviated: '谢谢伸出手的你…',
      worldName: '猫咪咖啡馆',
      createdAt: new Date(now - 12 * hour).toISOString(),
      emotion: '感恩',
      emotionHue: 150,
    },
    satellites: [
      {
        id: 'c5-s1',
        authorName: '小禾',
        displayName: '小*',
        content: '妈妈每天早起给我做早餐，我却常常忘了说谢谢，好愧疚。',
        abbreviated: '小*',
        emotion: '感恩',
        emotionHue: 145,
        resonanceCount: 7,
        likedByMe: false,
      },
      {
        id: 'c5-s2',
        authorName: '匿名旅人',
        displayName: '匿名**',
        content: '朋友的留言让我感动了很久，原来有人在乎我，我不是一个人。',
        abbreviated: '匿名**',
        emotion: '感恩',
        emotionHue: 155,
        resonanceCount: 5,
        likedByMe: true,
      },
      {
        id: 'c5-s3',
        authorName: '阿初',
        displayName: '阿*',
        content: '今天收到了一封手写的感谢信，好珍贵，要好好收藏。',
        abbreviated: '阿*',
        emotion: '感恩',
        emotionHue: 148,
        resonanceCount: 2,
        likedByMe: false,
      },
      {
        id: 'c5-s4',
        authorName: '沈晨',
        displayName: '**晨',
        content: '被陌生人的善意温暖到了，这个世界还是有光的。',
        abbreviated: '**晨',
        emotion: '感恩',
        emotionHue: 152,
        resonanceCount: 9,
        likedByMe: false,
      },
    ],
  },
];
