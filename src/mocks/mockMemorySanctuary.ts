import type { World } from '../types/world';

/**
 * 记忆圣殿 Mock 数据 —— 封存的水晶球（琥珀）
 * 每条记录对应一个已封存的世界，展示在记忆圣殿中
 */

const now = Date.now();
const day = 86400_000;

export interface MemoryAmber {
  id: string;            // 唯一标识
  worldId: string;       // 关联的世界 ID
  name: string;          // 琥珀名称
  description: string;   // 简短描述
  icon: string;          // Material Icon 名称
  imageUrl: string;      // 背景图（琥珀内景）
  isSealed: boolean;     // 是否已封存
  sealedAt: string;      // 封存时间
  exhibition: string;    // 展厅名称
}

/**
 * 琥珀橡子背景图（来自 aida-public）
 */
const AMBER_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBoo01F1A4vpS3Jac2dU39RBFQ24bnzKhu13adyiBZUyFsvypKiWC0bSNxbmyVQ_InFf0SeKIhV6lamCH9wKgfZ_j1HU2eL4M9b4SlGu6AQ4b_kk0tHzfxLRNGZ_0ieiln7ys5s5oETBq8NrWCPfimwvZVJNzeZJHw6f4JzVJOIai_emH2pL2i5VeAUje5EICeWnG7DG_6XNlYKI9f_c8xRbTIOdcmqpnUqLm63F5TwFYpr2Nls0ea0von2JyQpTNa5idH0_rGyju4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBb_UjZMxumZES4jciMXgp1o3qHve85lo4MRJoPlgWiM4EfPXYuW3EI3QbBC_OD7jNITYSVSfORdJ-4sp1URSu2kJLAcQOqf-CqoiyHIGsiRTaVxvmRuZ5g8a7wx8CRn7ktj1V5EGUyQ0simjaEmxOH9EAscEUQTDkhWPdT0QNQoeTqKwlUBiKygAI1iZpobYxd2swYnsHnHOcaGHrNMLZvixDcNk_wG1pbmFov88B4kYqa3jtGGey8jvCbixAicDDq40WGMQE_8U0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDZaTXONuHGHINk-pYICN6ItadmcuCAuaI6Z9h6_7Qj2hAt-RMz4amfmhaq-z1l1MonASGJ2FuXT1wQuEVBa8e728fPQulGs_F3rZFNoSlwGqSTujoDcuWbAqvl-Z9CDeZEvVpoAinQbvsMPqzYCcrsArNof4AYJCXsmK4DYTJ5B_u0aF6ORVje9jYRywr_lPZ17uaEBV9l7zS2gqpgq1DTNYIpcvcJgMPZq2Okpq1LNfw4R9qDsyBTTkSFnLz6OFbR9bej5CxRDkY',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBIDAa9ed12tIcq7_jpijxWVYVWlaSXfvg8XpyoEHmLLR68P1TB8eiDeMQcNrF2AVWvNCCOUSBOjhaBTN9wLX1IykyncUfUKNzDxQsEVt1B7I3BhFjz2H2WghLsmJ9OGYxBY6pS4aZ6oekkjGx-v5lgRU1JQ89nj2w-Z_Vv6mFw6iW5mSIajWZelqBQFJiIgyEHPNfjm6ZKy_p2bN8wp-sS-Kmhead6fKK2U7sjfrr9zAM9CEOyRNeBaXI2CA5FRqKu1Oeqgwktesc',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDDh3TGjQb8tHqWB9V_4utbeqPmBoN3sjF5SfIdltDbtEEkxtH9WL32BwCFeGeW5if0jP0zZ4Kqbx7XxLxYiI4jBBqXgRrq8s6TqSZB1mfoR0njNSBh-yqAU-CXR-sGNfLLW8A2n6SqEdBW8_s4nFoVy5OGuxJ5vThU3EvVLMx55oV6Nr62IEVqE54B62R9MhpUHLfpTHCqhLf4RjW2KkU6meNqG99FqOxqJ7vBBNLhdV3LpKJjQ6S9i4hWzPKeSUzWXRq2sQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ5CMYIhqDRbGhHFQlPD3MwGljAD3v5d7QdmlKJMJyLjg8k4BMSY-hw4FdVGHwOYHHjy3FuXX58v0KvGr1zDqP8bydrybsPpRyxo9QbV5GvB0v4JFYPd4aTG_kmgmkFV0UV5dCJVl4F5_e57U4EowdWNJgIRF3cIhBEENBHCXxQ79Z70NFL6X9_v_3_g1PAU5LNYkKjC07e5NIE9sOa3X9YD2nKCh_kGZ3zq6sprBzVBCIyQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA1zVmG6DmNdAW7CzVPR5hBRN48qbkYyy7ES5tABR9MxNhI8-YfPLYLjwCg3A8I3Y2bQqNQf3kSSFrbEu75VUPGKt1vHX5dVChmgE9akrGjwTQTR6d7AveSoUX9rCQtYmhCj5bCCFN_vRBMi_sy18FS_MkF8YxBRL6iHxl_3MVZxS5v7tX4hBxIGjNMKjjJL49k76Gi3XaW-8fYGuJ7VFQSbWXSQ8EgpJNX9oJhBxKj9so',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCs2BAQ5v3M0YX8Fq4HR5KNEqkPFBcIAtDdmIBLxYnPr8fQAHFxEdB3IWVfLNcq7g9WqLQS8LkQ0MqQYRPKBRKFb12q8EN_rzYggmn96X76qy9vVqP0bqTtMVCBknmH4c6GL5CDn1yq1vUjR4mPxl8Z3hY9T8mnRMQJk4z-dOUvLJoDkV5tQ1G_ydnRWGUpyDGFgpMq2VHBIdHK6RQysTFgsO50ShZ5cWgZrrfNG3w',
];

/**
 * 琥珀 · 记忆圣殿 mock 数据
 */
export const mockAmbers: MemoryAmber[] = [
  {
    id: 'amber-1',
    worldId: 'mock-sealed',
    name: '旧时光收藏柜',
    description: '那些被装进抽屉的旧时光，每一件都是时间的证物。',
    icon: 'inventory_2',
    imageUrl: AMBER_IMAGES[0],
    isSealed: true,
    sealedAt: new Date(now - 3 * day).toISOString(),
    exhibition: '第一展厅',
  },
  {
    id: 'amber-2',
    worldId: 'amber-2',
    name: 'Sunset Beach',
    description: '那天的余晖将海面染成了流动的金。',
    icon: 'beach_access',
    imageUrl: AMBER_IMAGES[1],
    isSealed: true,
    sealedAt: new Date(now - 7 * day).toISOString(),
    exhibition: '第一展厅',
  },
  {
    id: 'amber-3',
    worldId: 'amber-3',
    name: 'Midnight Rain',
    description: '雨声在无人的街道回荡，那是寂静的低语。',
    icon: 'rainy',
    imageUrl: AMBER_IMAGES[2],
    isSealed: true,
    sealedAt: new Date(now - 14 * day).toISOString(),
    exhibition: '第一展厅',
  },
  {
    id: 'amber-4',
    worldId: 'amber-4',
    name: 'Old Library',
    description: '陈旧的纸张里，藏着时间的重量。',
    icon: 'menu_book',
    imageUrl: AMBER_IMAGES[3],
    isSealed: true,
    sealedAt: new Date(now - 21 * day).toISOString(),
    exhibition: '第二展厅',
  },
  {
    id: 'amber-5',
    worldId: 'amber-5',
    name: 'Forest Mist',
    description: '晨雾弥漫在松林间，万物皆在呼吸。',
    icon: 'nature',
    imageUrl: AMBER_IMAGES[4],
    isSealed: true,
    sealedAt: new Date(now - 30 * day).toISOString(),
    exhibition: '第二展厅',
  },
  {
    id: 'amber-6',
    worldId: 'amber-6',
    name: 'Starry Night',
    description: '星光坠落在山谷里，每一点都是远方的回信。',
    icon: 'nights_stay',
    imageUrl: AMBER_IMAGES[5],
    isSealed: true,
    sealedAt: new Date(now - 45 * day).toISOString(),
    exhibition: '第二展厅',
  },
  {
    id: 'amber-7',
    worldId: 'amber-7',
    name: 'Cherry Blossom',
    description: '樱花落下的速度是每秒五厘米，心事也是。',
    icon: 'cherry_blossom',
    imageUrl: AMBER_IMAGES[6],
    isSealed: true,
    sealedAt: new Date(now - 60 * day).toISOString(),
    exhibition: '第三展厅',
  },
  {
    id: 'amber-8',
    worldId: 'amber-8',
    name: 'Winter Solitude',
    description: '雪地上没有脚印，世界安静得像一首未完成的诗。',
    icon: 'ac_unit',
    imageUrl: AMBER_IMAGES[7],
    isSealed: true,
    sealedAt: new Date(now - 90 * day).toISOString(),
    exhibition: '第三展厅',
  },
];
