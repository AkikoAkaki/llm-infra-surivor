// ── 卡牌系统类型 ────────────────────────────────────────────────────────────

export type CardType = 'Infra' | 'Optimize' | 'Ops';
export type CardRarity = 'common' | 'uncommon' | 'rare';

/** 卡牌 action 的联合类型 */
export type CardAction =
  | { type: 'ADD_MAX_VRAM'; amount: number; heat: number }
  | { type: 'UPGRADE_CLUSTER'; vram: number; compute: number; heat: number }
  | { type: 'COOL_DOWN'; amount: number }
  | { type: 'ADD_MAX_ENERGY'; amount: number }
  | { type: 'QUANTIZE_BASE'; baseVram: number; computePenalty: number }
  | { type: 'BUFF_VRAM_REDUCTION'; amount: number }
  | { type: 'BUFF_COMPUTE'; amount: number; heat: number }
  | { type: 'REORDER_QUEUE' }
  | { type: 'BUFF_CACHE_MULTIPLIER'; multiplier: number; heat: number }
  | { type: 'PREFIX_CACHE_BOOST' }
  | { type: 'DROP_TOP_REQUEST'; slaPenalty: number }
  | { type: 'CIRCUIT_BREAKER' }
  | { type: 'ROLLBACK'; resetHeat: boolean; zeroCom: boolean }
  | { type: 'AUTOSCALE'; compute: number; heat: number };

/** 卡牌模板（数据库中的原型） */
export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  temp: number;
  rarity: CardRarity;
  desc: string;
  action: CardAction;
}

/** 运行时卡牌实例（带 instanceId） */
export interface CardInstance extends CardDef {
  instanceId: string;
}

// ── 请求/敌人类型 ────────────────────────────────────────────────────────────

export type RequestTypeName =
  | 'SHORT_QUERY'
  | 'LONG_CONTEXT'
  | 'JAILBREAK'
  | 'GIANT_INFERENCE'
  | 'DDOS';

export type RequestColor = 'blue' | 'purple' | 'red' | 'orange';

/** 请求类型模板 */
export interface RequestTypeDef {
  type: RequestTypeName;
  label: string;
  color: RequestColor;
  tokens: number;
  baseVram: number;
  timeout: number;
  weight: number;
}

/** 运行时请求实例 */
export interface RequestInstance extends RequestTypeDef {
  instanceId: string;
  id: string;
  tokens: number;
  maxTokens: number;
  age: number;
  cacheHit: boolean;
}

// ── 游戏状态类型 ─────────────────────────────────────────────────────────────

export type GamePhase = 'ACTION' | 'REWARD' | 'GAMEOVER';

export type LogColor =
  | 'default'
  | 'success'
  | 'info'
  | 'warn'
  | 'error'
  | 'dim';

export interface LogEntry {
  msg: string;
  color: LogColor;
  id?: number;
}

export interface TurnBuffs {
  vramReduction: number;
  cacheMultiplier: number;
}

export interface GameStats {
  wavesCleared: number;
  requestsHandled: number;
  requestsDropped: number;
  requestsTimedOut: number;
}

export interface GameState {
  // 资源状态
  sla: number;
  maxVram: number;
  baseVram: number;
  baseCompute: number;
  compute: number;
  maxEnergy: number;
  energy: number;
  temperature: number;
  maxTemperature: number;
  isOverheated: boolean;

  // 波次与回合
  wave: number;
  turn: number;
  phase: GamePhase;

  // 卡牌系统
  drawPile: CardInstance[];
  hand: CardInstance[];
  discardPile: CardInstance[];

  // 遗物系统（预留）
  relics: unknown[];

  // 流量队列
  requests: RequestInstance[];

  // 回合临时 Buff
  turnBuffs: TurnBuffs;

  // 日志
  logs: LogEntry[];

  // 奖励池
  rewardChoices: CardInstance[];

  // 统计
  stats: GameStats;
}

// ── Dispatch Action 类型 ──────────────────────────────────────────────────────

export type GameAction =
  | { type: 'DRAW_INITIAL_HAND' }
  | { type: 'PLAY_CARD'; instanceId: string }
  | { type: 'END_TURN' }
  | { type: 'SELECT_REWARD'; cardId: string }
  | { type: 'SKIP_REWARD' }
  | { type: 'RESTART'; initialState: GameState };
