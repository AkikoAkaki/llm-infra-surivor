// 卡牌数据库 - 所有卡牌的定义
// type: 'Infra' | 'Optimize' | 'Ops'
// action: 对 state 的 reducer 操作类型

export const ALL_CARDS = [
  // ── Infra 类 ──────────────────────────────────────────────────────────
  {
    id: 'infra_a100',
    name: 'A100 节点',
    type: 'Infra',
    cost: 3,
    temp: 2,
    rarity: 'common',
    desc: '永久 +4 Max VRAM。产生 2 温度。',
    action: { type: 'ADD_MAX_VRAM', amount: 4, heat: 2 },
  },
  {
    id: 'infra_h100',
    name: 'H100 节点',
    type: 'Infra',
    cost: 4,
    temp: 3,
    rarity: 'rare',
    desc: '永久 +8 Max VRAM，+2 Base Compute。产生 3 温度。',
    action: { type: 'UPGRADE_CLUSTER', vram: 8, compute: 2, heat: 3 },
  },
  {
    id: 'infra_cooling',
    name: '液冷模块',
    type: 'Infra',
    cost: 1,
    temp: 0,
    rarity: 'common',
    desc: '温度立即降低 4。',
    action: { type: 'COOL_DOWN', amount: 4 },
  },
  {
    id: 'infra_psu',
    name: '高效电源',
    type: 'Infra',
    cost: 2,
    temp: 0,
    rarity: 'uncommon',
    desc: '永久 +1 Max Energy。',
    action: { type: 'ADD_MAX_ENERGY', amount: 1 },
  },

  // ── Optimize 类 ────────────────────────────────────────────────────────
  {
    id: 'opt_int8',
    name: 'INT8 量化',
    type: 'Optimize',
    cost: 2,
    temp: 0,
    rarity: 'uncommon',
    desc: '基础模型 VRAM 永久降为 1。本回合算力 -1。',
    action: { type: 'QUANTIZE_BASE', baseVram: 1, computePenalty: 1 },
  },
  {
    id: 'opt_paged',
    name: 'Paged Attention',
    type: 'Optimize',
    cost: 1,
    temp: 0,
    rarity: 'common',
    desc: '本回合所有请求 VRAM 占用 -1（最低 1）。',
    action: { type: 'BUFF_VRAM_REDUCTION', amount: 1 },
  },
  {
    id: 'opt_batch',
    name: 'Continuous Batch',
    type: 'Optimize',
    cost: 2,
    temp: 3,
    rarity: 'common',
    desc: '本回合算力 +5。产生 3 温度。',
    action: { type: 'BUFF_COMPUTE', amount: 5, heat: 3 },
  },
  {
    id: 'opt_rerank',
    name: '流量重排',
    type: 'Optimize',
    cost: 0,
    temp: 0,
    rarity: 'common',
    desc: '将队列按类型排序，最大化相邻 Cache Hit。',
    action: { type: 'REORDER_QUEUE' },
  },
  {
    id: 'opt_speculative',
    name: 'Speculative Decoding',
    type: 'Optimize',
    cost: 2,
    temp: 1,
    rarity: 'rare',
    desc: '本回合 Cache Hit 的 Compute 倍率从 x2 提升到 x3。产生 1 温度。',
    action: { type: 'BUFF_CACHE_MULTIPLIER', multiplier: 3, heat: 1 },
  },
  {
    id: 'opt_prefix',
    name: 'Prefix Caching',
    type: 'Optimize',
    cost: 1,
    temp: 0,
    rarity: 'uncommon',
    desc: '立即对当前队列重新计算 Cache Hit，并为每个 Hit 额外回复 1 Compute。',
    action: { type: 'PREFIX_CACHE_BOOST' },
  },

  // ── Ops 类 ────────────────────────────────────────────────────────────
  {
    id: 'ops_ratelimit',
    name: '限流丢弃',
    type: 'Ops',
    cost: 0,
    temp: 0,
    rarity: 'common',
    desc: '移除队列顶部的请求。SLA -1。',
    action: { type: 'DROP_TOP_REQUEST', slaPenalty: 1 },
  },
  {
    id: 'ops_circuit',
    name: '熔断器',
    type: 'Ops',
    cost: 1,
    temp: 0,
    rarity: 'uncommon',
    desc: '移除队列中所有"恶意越狱"类型请求。SLA -1 每个。',
    action: { type: 'CIRCUIT_BREAKER' },
  },
  {
    id: 'ops_rollback',
    name: '回滚部署',
    type: 'Ops',
    cost: 2,
    temp: 0,
    rarity: 'rare',
    desc: '温度立即归零。本回合 Compute 为 0。',
    action: { type: 'ROLLBACK', resetHeat: true, zeroCom: true },
  },
  {
    id: 'ops_autoscale',
    name: '弹性扩容',
    type: 'Ops',
    cost: 3,
    temp: 4,
    rarity: 'rare',
    desc: '本回合算力 +10。产生 4 温度。本回合结束后算力值不归零（保留至下回合）。',
    action: { type: 'AUTOSCALE', compute: 10, heat: 4 },
  },
];

// 初始卡组（10 张普通卡的精简组合）
export const STARTER_DECK_IDS = [
  'infra_cooling',
  'infra_cooling',
  'opt_paged',
  'opt_paged',
  'opt_batch',
  'opt_rerank',
  'ops_ratelimit',
  'ops_ratelimit',
  'infra_a100',
  'opt_int8',
];

export function getCardById(id) {
  return ALL_CARDS.find((c) => c.id === id);
}

export function buildStarterDeck() {
  return STARTER_DECK_IDS.map((id, i) => ({
    ...getCardById(id),
    instanceId: `${id}_starter_${i}`,
  }));
}

// 用于波次奖励时随机选牌池（排除初始低级卡）
export const REWARD_POOL = ALL_CARDS.filter(
  (c) => !['infra_cooling', 'ops_ratelimit', 'opt_paged'].includes(c.id)
);
