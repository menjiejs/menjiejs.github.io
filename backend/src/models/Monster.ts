export interface Monster {
  id: string;
  name: string;
  rank: string;
  maxHealth: number;
  image?: string;
  description?: string;
  createdAt: Date;
}

export interface MonsterInstance {
  id: string;
  name: string;
  rank: string;
  maxHealth: number;
  currentHealth: number;
  image?: string;
  description?: string;
}

// 怪物配置映射
export const MONSTER_CONFIG: Record<string, Monster> = {
  slime_d: {
    id: 'slime_d',
    name: '史莱姆',
    rank: 'D',
    maxHealth: 30,
    image: '/monsters/slime.png',
    description: '最弱小的怪物，只能慢慢蠕动',
    createdAt: new Date()
  },
  goblin_c: {
    id: 'goblin_c',
    name: '哥布林',
    rank: 'C',
    maxHealth: 50,
    image: '/monsters/goblin.png',
    description: '狡猾的小怪物，经常偷袭',
    createdAt: new Date()
  },
  orc_b: {
    id: 'orc_b',
    name: '兽人',
    rank: 'B',
    maxHealth: 80,
    image: '/monsters/orc.png',
    description: '强壮的战士，手持木棒',
    createdAt: new Date()
  },
  shadow_a: {
    id: 'shadow_a',
    name: '暗影战士',
    rank: 'A',
    maxHealth: 120,
    image: '/monsters/shadow.png',
    description: '来自黑暗的战士，速度极快',
    createdAt: new Date()
  },
  lava_giant_s: {
    id: 'lava_giant_s',
    name: '熔岩巨人',
    rank: '青铜S',
    maxHealth: 150,
    image: '/monsters/lava-giant.png',
    description: '体内流淌着熔岩的巨人',
    createdAt: new Date()
  },
  thunder_dragon_s: {
    id: 'thunder_dragon_s',
    name: '雷霆龙',
    rank: '黄金S',
    maxHealth: 180,
    image: '/monsters/thunder-dragon.png',
    description: '掌控雷电的巨龙',
    createdAt: new Date()
  },
  holy_dragon_s: {
    id: 'holy_dragon_s',
    name: '神圣龙',
    rank: '钻石S',
    maxHealth: 220,
    image: '/monsters/holy-dragon.png',
    description: '神圣力量的守护者',
    createdAt: new Date()
  },
  chaos_overlord_s: {
    id: 'chaos_overlord_s',
    name: '混沌魔王',
    rank: '魔王S',
    maxHealth: 300,
    image: '/monsters/chaos-overlord.png',
    description: '混沌的统治者',
    createdAt: new Date()
  }
};

// 根据段位获取对应怪物
export const getMonsterByRank = (rank: string): Monster => {
  const rankOrder = ['D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', '青铜S', '黄金S', '钻石S', '魔王S'];
  const index = rankOrder.indexOf(rank);

  if (index === -1) {
    throw new Error(`Invalid rank: ${rank}`);
  }

  // 映射段位到怪物ID
  const monsterIds = [
    'slime_d',           // D
    'slime_d',           // D+
    'goblin_c',          // C
    'goblin_c',          // C+
    'orc_b',             // B
    'orc_b',             // B+
    'shadow_a',          // A
    'shadow_a',          // A+
    'lava_giant_s',      // 青铜S
    'thunder_dragon_s',  // 黄金S
    'holy_dragon_s',     // 钻石S
    'chaos_overlord_s'   // 魔王S
  ];

  return MONSTER_CONFIG[monsterIds[index]];
};