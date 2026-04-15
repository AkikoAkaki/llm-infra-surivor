// 游戏核心 Reducer — 所有状态转换的纯函数集合
// 遵循 (state, action) => newState 模式，无副作用

import { generateWave } from './enemies.js';
import { REWARD_POOL, getCardById } from './cards.js';

// ── 工具函数 ────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function addLog(logs, msg, color = 'default') {
  return [...logs, { msg, color, id: Date.now() + Math.random() }];
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// 相邻相同 color 的请求标记为 Cache Hit
function recalcCacheHits(requests) {
  return requests.map((req, i) => ({
    ...req,
    cacheHit: i > 0 && req.color === requests[i - 1].color,
  }));
}

// 从牌库抽指定数量的牌（自动洗牌补充）
function drawCards(state, count) {
  let draw = [...state.drawPile];
  let discard = [...state.discardPile];
  let hand = [...state.hand];
  let logs = state.logs;

  for (let i = 0; i < count; i++) {
    if (draw.length === 0) {
      if (discard.length === 0) break;
      draw = shuffle(discard);
      discard = [];
      logs = addLog(logs, '[Deck] 弃牌堆已洗入抽牌堆。', 'info');
    }
    hand.push(draw.pop());
  }

  return { ...state, drawPile: draw, discardPile: discard, hand, logs };
}

// ── 主 Reducer ──────────────────────────────────────────────────────────
export function gameReducer(state, action) {
  switch (action.type) {

    // ── 初始抽牌 ──
    case 'DRAW_INITIAL_HAND': {
      return drawCards(state, 5);
    }

    // ── 打出卡牌 ──
    case 'PLAY_CARD': {
      const { instanceId } = action;
      const cardIndex = state.hand.findIndex((c) => c.instanceId === instanceId);
      if (cardIndex === -1) return state;
      const card = state.hand[cardIndex];

      // 校验
      if (state.isOverheated && card.type === 'Infra') {
        return { ...state, logs: addLog(state.logs, '系统过热，无法部署 Infra 级操作！', 'error') };
      }
      if (state.energy < card.cost) {
        return { ...state, logs: addLog(state.logs, `Energy 不足（需要 ${card.cost}，剩余 ${state.energy}）。`, 'warn') };
      }

      // 消耗 Energy，移出手牌，加入弃牌堆
      const newHand = state.hand.filter((_, i) => i !== cardIndex);
      const newDiscard = [...state.discardPile, card];
      let s = { ...state, energy: state.energy - card.cost, hand: newHand, discardPile: newDiscard };

      // 执行卡效
      s = applyCardEffect(s, card);
      s = { ...s, requests: recalcCacheHits(s.requests) };
      return s;
    }

    // ── 结束回合 ──
    case 'END_TURN': {
      return resolveTurn(state);
    }

    // ── 选择奖励 ──
    case 'SELECT_REWARD': {
      const { cardId } = action;
      const card = getCardById(cardId);
      if (!card) return state;
      const newCard = { ...card, instanceId: `${card.id}_reward_${Date.now()}` };
      const newDiscard = [...state.discardPile, newCard];
      let logs = addLog(state.logs, `[奖励] 已将 "${card.name}" 加入牌库。`, 'success');

      // 进入新波次
      const newWave = state.wave + 1;
      const newRequests = recalcCacheHits(generateWave(newWave));
      logs = addLog(logs, `[Wave ${newWave}] 新一波流量洪峰到来！`, 'warn');

      const nextState = drawCards(
        {
          ...state,
          discardPile: newDiscard,
          wave: newWave,
          requests: newRequests,
          rewardChoices: [],
          phase: 'ACTION',
          energy: state.maxEnergy,
          compute: state.isOverheated ? Math.floor(state.baseCompute / 2) : state.baseCompute,
          turnBuffs: getDefaultTurnBuffs(),
          logs,
        },
        5
      );
      return nextState;
    }

    // ── 跳过奖励 ──
    case 'SKIP_REWARD': {
      const newWave = state.wave + 1;
      const newRequests = recalcCacheHits(generateWave(newWave));
      let logs = addLog(state.logs, `[Wave ${newWave}] 新一波流量洪峰到来！`, 'warn');

      const nextState = drawCards(
        {
          ...state,
          wave: newWave,
          requests: newRequests,
          rewardChoices: [],
          phase: 'ACTION',
          energy: state.maxEnergy,
          compute: state.isOverheated ? Math.floor(state.baseCompute / 2) : state.baseCompute,
          turnBuffs: getDefaultTurnBuffs(),
          logs,
        },
        5
      );
      return nextState;
    }

    // ── 重新开始 ──
    case 'RESTART': {
      return action.initialState;
    }

    default:
      return state;
  }
}

// ── 回合结算逻辑 ────────────────────────────────────────────────────────
function resolveTurn(state) {
  let s = { ...state };
  let logs = s.logs;
  logs = addLog(logs, `─── 结算 Wave ${s.wave} · 回合 ${s.turn} ───`, 'dim');

  // 1. OOM 检查
  const usedVram = calcUsedVram(s);
  if (usedVram > s.maxVram) {
    logs = addLog(logs, `CRITICAL: OOM！内存溢出（${usedVram}/${s.maxVram} VRAM），所有请求崩溃！`, 'error');
    s = { ...s, sla: s.sla - 10, requests: [], logs };
  } else {
    // 2. 算力分配
    const { requests: afterCompute, computeLeft, logs: cLogs } = distributeCompute(s, logs);
    logs = cLogs;
    s = { ...s, requests: afterCompute, logs };

    // 3. 统计被处理的请求数
    const handled = s.requests.filter((r) => r.tokens <= 0).length;
    s = {
      ...s,
      requests: afterCompute.filter((r) => r.tokens > 0),
      stats: { ...s.stats, requestsHandled: s.stats.requestsHandled + handled },
    };

    // 携带剩余算力到下回合（autoscale）
    if (s.turnBuffs.carryComputeNext) {
      s = { ...s, turnBuffs: { ...s.turnBuffs, extraComputeCarried: computeLeft } };
    }
  }

  // 4. Timeout + Age 更新
  const aged = [];
  let slaLoss = 0;
  let timedOut = 0;
  for (const req of s.requests) {
    const newAge = req.age + 1;
    if (newAge >= req.timeout) {
      logs = addLog(logs, `请求 ${req.id} [${req.label}] 超时 (Timeout)！SLA -2。`, 'error');
      slaLoss += 2;
      timedOut++;
    } else {
      aged.push({ ...req, age: newAge });
    }
  }
  s = {
    ...s,
    requests: aged,
    sla: clamp(s.sla - slaLoss, 0, 100),
    logs,
    stats: { ...s.stats, requestsTimedOut: s.stats.requestsTimedOut + timedOut },
  };

  // 5. 温度结算
  let temp = s.temperature;
  if (temp >= s.maxTemperature) {
    s = { ...s, isOverheated: true };
    logs = addLog(s.logs, 'WARNING: 系统过热！下回合算力减半，且禁用 Infra 卡。', 'error');
  } else {
    s = { ...s, isOverheated: false };
  }
  temp = clamp(temp - 2, 0, 100); // 自然冷却
  s = { ...s, temperature: temp, logs };

  // 6. 回合 Buff 重置
  const carried = s.turnBuffs.carryComputeNext ? s.turnBuffs.extraComputeCarried : 0;
  s = { ...s, turnBuffs: getDefaultTurnBuffs() };

  // 7. 资源重置
  const nextCompute = (s.isOverheated ? Math.floor(s.baseCompute / 2) : s.baseCompute) + carried;
  s = {
    ...s,
    turn: s.turn + 1,
    energy: s.maxEnergy,
    compute: nextCompute,
  };

  // 8. 手牌 → 弃牌堆
  s = { ...s, discardPile: [...s.discardPile, ...s.hand], hand: [] };

  // 9. 检查是否通过波次
  if (s.requests.length === 0) {
    logs = addLog(s.logs, `✓ Wave ${s.wave} 抵御成功！选择增援卡牌。`, 'success');
    const rewardChoices = pickRewards(3);
    s = { ...s, logs, phase: 'REWARD', rewardChoices, stats: { ...s.stats, wavesCleared: s.stats.wavesCleared + 1 } };
    return s;
  }

  // 10. 抽新手牌
  s = { ...s, logs };
  s = drawCards(s, 5);
  s = { ...s, requests: recalcCacheHits(s.requests) };

  // 11. 游戏结束检查
  if (s.sla <= 0) {
    return { ...s, phase: 'GAMEOVER' };
  }

  return s;
}

// ── 算力分配 ────────────────────────────────────────────────────────────
function distributeCompute(state, logs) {
  let availableCompute = state.compute;
  const requests = [...state.requests];

  // 按 age 降序排列（越老越优先）
  const targets = [...requests].sort((a, b) => b.age - a.age);

  for (const target of targets) {
    if (availableCompute <= 0) break;

    const req = requests.find((r) => r.instanceId === target.instanceId);
    if (!req) continue;

    const multiplier = req.cacheHit ? (state.turnBuffs.cacheMultiplier || 2) : 1;

    // 巨型推理：需要一次性击杀
    if (req.mustOneShot) {
      const computeNeeded = Math.ceil(req.tokens / multiplier);
      if (availableCompute >= computeNeeded) {
        logs = addLog(logs, `✓ 巨型推理 ${req.id} 已完成处理。`, 'success');
        availableCompute -= computeNeeded;
        req.tokens = 0;
      } else {
        logs = addLog(logs, `巨型推理 ${req.id} 算力不足，无法完成（需 ${computeNeeded}，剩 ${availableCompute}）。`, 'warn');
      }
      continue;
    }

    const maxDamage = availableCompute * multiplier;
    if (maxDamage >= req.tokens) {
      const cost = Math.ceil(req.tokens / multiplier);
      availableCompute -= cost;
      req.tokens = 0;
    } else {
      req.tokens -= maxDamage;
      availableCompute = 0;
    }
  }

  return { requests, computeLeft: availableCompute, logs };
}

// ── 卡牌效果应用 ─────────────────────────────────────────────────────────
function applyCardEffect(state, card) {
  const a = card.action;
  let s = { ...state };
  let logs = s.logs;

  switch (a.type) {
    case 'ADD_MAX_VRAM':
      s = { ...s, maxVram: s.maxVram + a.amount, temperature: s.temperature + a.heat };
      logs = addLog(logs, `A100 节点部署：+${a.amount} Max VRAM，+${a.heat} 温度。`, 'success');
      break;

    case 'UPGRADE_CLUSTER':
      s = { ...s, maxVram: s.maxVram + a.vram, baseCompute: s.baseCompute + a.compute, compute: s.compute + a.compute, temperature: s.temperature + a.heat };
      logs = addLog(logs, `H100 集群升级：+${a.vram} VRAM，+${a.compute} Compute，+${a.heat} 温度。`, 'success');
      break;

    case 'COOL_DOWN':
      s = { ...s, temperature: clamp(s.temperature - a.amount, 0, 100) };
      logs = addLog(logs, `液冷模块启动：温度 -${a.amount}。`, 'info');
      break;

    case 'ADD_MAX_ENERGY':
      s = { ...s, maxEnergy: s.maxEnergy + a.amount, energy: s.energy + a.amount };
      logs = addLog(logs, `高效电源：+${a.amount} Max Energy。`, 'success');
      break;

    case 'QUANTIZE_BASE':
      s = { ...s, baseVram: a.baseVram, compute: clamp(s.compute - a.computePenalty, 0, 999) };
      logs = addLog(logs, `INT8 量化：基础 VRAM → ${a.baseVram}，本回合算力 -${a.computePenalty}。`, 'info');
      break;

    case 'BUFF_VRAM_REDUCTION':
      s = { ...s, turnBuffs: { ...s.turnBuffs, vramReduction: s.turnBuffs.vramReduction + a.amount } };
      logs = addLog(logs, `Paged Attention：本回合请求 VRAM -${a.amount}。`, 'info');
      break;

    case 'BUFF_COMPUTE':
      s = { ...s, compute: s.compute + a.amount, temperature: s.temperature + a.heat };
      logs = addLog(logs, `Continuous Batch：+${a.amount} 算力，+${a.heat} 温度。`, 'info');
      break;

    case 'REORDER_QUEUE': {
      const sorted = recalcCacheHits([...s.requests].sort((a, b) => a.color.localeCompare(b.color)));
      s = { ...s, requests: sorted };
      logs = addLog(logs, '流量重排完成，缓存命中率已优化。', 'info');
      break;
    }

    case 'BUFF_CACHE_MULTIPLIER':
      s = { ...s, turnBuffs: { ...s.turnBuffs, cacheMultiplier: a.multiplier }, temperature: s.temperature + a.heat };
      logs = addLog(logs, `Speculative Decoding：Cache Hit 倍率提升至 x${a.multiplier}。`, 'info');
      break;

    case 'PREFIX_CACHE_BOOST': {
      const recalced = recalcCacheHits(s.requests);
      const hits = recalced.filter((r) => r.cacheHit).length;
      s = { ...s, requests: recalced, compute: s.compute + hits };
      logs = addLog(logs, `Prefix Caching：命中 ${hits} 个请求，回复 ${hits} 算力。`, 'success');
      break;
    }

    case 'DROP_TOP_REQUEST':
      if (s.requests.length > 0) {
        const dropped = s.requests[0];
        s = { ...s, requests: s.requests.slice(1), sla: clamp(s.sla - a.slaPenalty, 0, 100), stats: { ...s.stats, requestsDropped: s.stats.requestsDropped + 1 } };
        logs = addLog(logs, `限流丢弃：移除请求 ${dropped.id}，SLA -${a.slaPenalty}。`, 'warn');
      } else {
        logs = addLog(logs, '队列已空，无请求可丢弃。', 'dim');
      }
      break;

    case 'CIRCUIT_BREAKER': {
      const before = s.requests.length;
      const filtered = s.requests.filter((r) => r.type !== 'JAILBREAK');
      const removed = before - filtered.length;
      s = { ...s, requests: filtered, sla: clamp(s.sla - removed, 0, 100), stats: { ...s.stats, requestsDropped: s.stats.requestsDropped + removed } };
      logs = addLog(logs, `熔断器触发：清除 ${removed} 个恶意越狱请求，SLA -${removed}。`, 'warn');
      break;
    }

    case 'ROLLBACK':
      s = { ...s, temperature: 0, compute: 0 };
      logs = addLog(logs, '回滚部署：温度清零，本回合算力归零。', 'warn');
      break;

    case 'AUTOSCALE':
      s = { ...s, compute: s.compute + a.compute, temperature: s.temperature + a.heat, turnBuffs: { ...s.turnBuffs, carryComputeNext: true } };
      logs = addLog(logs, `弹性扩容：+${a.compute} 算力，+${a.heat} 温度。剩余算力将延续至下回合。`, 'info');
      break;

    default:
      break;
  }

  return { ...s, logs };
}

// ── 工具 ─────────────────────────────────────────────────────────────────
function getDefaultTurnBuffs() {
  return {
    vramReduction: 0,
    cacheMultiplier: 2,
    carryComputeNext: false,
    extraComputeCarried: 0,
  };
}

export function calcUsedVram(state) {
  let used = state.baseVram;
  for (const req of state.requests) {
    if (req.cacheHit) continue;
    used += Math.max(1, req.baseVram - state.turnBuffs.vramReduction);
  }
  return used;
}

function pickRewards(count) {
  const pool = [...REWARD_POOL];
  const chosen = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    chosen.push({ ...pool[idx], instanceId: `${pool[idx].id}_rwd_${Date.now()}_${i}` });
    pool.splice(idx, 1);
  }
  return chosen;
}
