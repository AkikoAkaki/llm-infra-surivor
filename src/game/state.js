import { buildStarterDeck } from './cards.js';
import { generateWave } from './enemies.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createInitialState() {
  const drawPile = shuffle(buildStarterDeck());
  const wave = 1;

  return {
    // ── 资源状态 ──
    sla: 100,
    maxVram: 10,
    baseVram: 2,
    baseCompute: 5,
    compute: 5,
    maxEnergy: 3,
    energy: 3,
    temperature: 0,
    maxTemperature: 10,
    isOverheated: false,

    // ── 波次与回合 ──
    wave,
    turn: 1,
    phase: 'ACTION',   // 'ACTION' | 'REWARD' | 'GAMEOVER'

    // ── 卡牌系统 ──
    drawPile,
    hand: [],
    discardPile: [],

    // ── 遗物系统 ──
    relics: [],

    // ── 流量队列 ──
    requests: generateWave(wave),

    // ── 回合临时 Buff ──
    turnBuffs: {
      vramReduction: 0,
      cacheMultiplier: 2,    // Cache Hit 时算力倍率
      carryComputeNext: false,
      extraComputeCarried: 0,
    },

    // ── 日志 ──
    logs: [{ msg: '[System] 集群服务已启动。第 1 波请求即将到来。', color: 'success' }],

    // ── 奖励池（波次结算后的选牌） ──
    rewardChoices: [],

    // ── 统计 ──
    stats: {
      wavesCleared: 0,
      requestsHandled: 0,
      requestsDropped: 0,
      requestsTimedOut: 0,
    },
  };
}
