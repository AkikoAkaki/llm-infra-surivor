// 卡牌数据库
// type: 'Infra' | 'Optimize' | 'Ops'
// 描述文案遵循：时效在前（"本回合 / 永久"），效果在后，简洁直白

import type { CardDef, CardInstance } from './types';

export const ALL_CARDS: CardDef[] = [
  // ── Infra ──────────────────────────────────────────────
  {
    id: 'infra_a100',
    name: 'A100 节点',
    type: 'Infra',
    cost: 3,
    temp: 2,
    rarity: 'common',
    desc: '永久 +4 Max VRAM。产生 2 热量。',
    action: { type: 'ADD_MAX_VRAM', amount: 4, heat: 2 },
  },
  {
    id: 'infra_h100',
    name: 'H100 节点',
    type: 'Infra',
    cost: 4,
    temp: 3,
    rarity: 'rare',
    desc: '永久 +8 Max VRAM 与 +2 基础 Compute。产生 3 热量。',
    action: { type: 'UPGRADE_CLUSTER', vram: 8, compute: 2, heat: 3 },
  },
  {
    id: 'infra_cooling',
    name: '液冷模块',
    type: 'Infra',
    cost: 1,
    temp: 0,
    rarity: 'common',
    desc: '立即降低 4 热量。',
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

  // ── Optimize ───────────────────────────────────────────
  {
    id: 'opt_int8',
    name: 'INT8 量化',
    type: 'Optimize',
    cost: 2,
    temp: 0,
    rarity: 'uncommon',
    desc: '永久将模型基础 VRAM 占用降至 1。本回合 -1 Compute。',
    action: { type: 'QUANTIZE_BASE', baseVram: 1, computePenalty: 1 },
  },
  {
    id: 'opt_paged',
    name: 'Paged Attention',
    type: 'Optimize',
    cost: 1,
    temp: 0,
    rarity: 'common',
    desc: '本回合所有请求的 VRAM 占用 -1（最低 1）。',
    action: { type: 'BUFF_VRAM_REDUCTION', amount: 1 },
  },
  {
    id: 'opt_batch',
    name: 'Continuous Batch',
    type: 'Optimize',
    cost: 2,
    temp: 3,
    rarity: 'common',
    desc: '本回合 +5 Compute。产生 3 热量。',
    action: { type: 'BUFF_COMPUTE', amount: 5, heat: 3 },
  },
  {
    id: 'opt_rerank',
    name: '流量重排',
    type: 'Optimize',
    cost: 0,
    temp: 0,
    rarity: 'common',
    desc: '将队列按类型排序，最大化相邻缓存命中。',
    action: { type: 'REORDER_QUEUE' },
  },
  {
    id: 'opt_speculative',
    name: 'Speculative Decoding',
    type: 'Optimize',
    cost: 2,
    temp: 1,
    rarity: 'rare',
    desc: '本回合缓存命中的请求获得 3 倍 Compute（原为 2 倍）。产生 1 热量。',
    action: { type: 'BUFF_CACHE_MULTIPLIER', multiplier: 3, heat: 1 },
  },
  {
    id: 'opt_prefix',
    name: 'Prefix Caching',
    type: 'Optimize',
    cost: 1,
    temp: 0,
    rarity: 'uncommon',
    desc: '重排缓存链；每条命中的请求额外 +1 Compute。',
    action: { type: 'PREFIX_CACHE_BOOST' },
  },

  // ── Ops ────────────────────────────────────────────────
  {
    id: 'ops_ratelimit',
    name: '限流丢弃',
    type: 'Ops',
    cost: 0,
    temp: 0,
    rarity: 'common',
    desc: '移除队列首位请求。SLA -1。',
    action: { type: 'DROP_TOP_REQUEST', slaPenalty: 1 },
  },
  {
    id: 'ops_circuit',
    name: '熔断器',
    type: 'Ops',
    cost: 1,
    temp: 0,
    rarity: 'uncommon',
    desc: '清除队列中所有恶意越狱请求。每个 -1 SLA。',
    action: { type: 'CIRCUIT_BREAKER' },
  },
  {
    id: 'ops_rollback',
    name: '回滚部署',
    type: 'Ops',
    cost: 2,
    temp: 0,
    rarity: 'rare',
    desc: '立即将热量归零。本回合 Compute 归零。',
    action: { type: 'ROLLBACK', resetHeat: true, zeroCom: true },
  },
  {
    id: 'ops_autoscale',
    name: '弹性扩容',
    type: 'Ops',
    cost: 3,
    temp: 4,
    rarity: 'rare',
    desc: '本回合 +10 Compute。产生 4 热量。',
    action: { type: 'AUTOSCALE', compute: 10, heat: 4 },
  },
];

// 初始卡组
export const STARTER_DECK_IDS: string[] = [
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

export function getCardById(id: string): CardDef | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}

export function buildStarterDeck(): CardInstance[] {
  return STARTER_DECK_IDS.map((id, i) => ({
    ...getCardById(id)!,
    instanceId: `${id}_starter_${i}`,
  }));
}

// 波次奖励池（排除初始低级卡）
export const REWARD_POOL: CardDef[] = ALL_CARDS.filter(
  (c) => !['infra_cooling', 'ops_ratelimit', 'opt_paged'].includes(c.id)
);
