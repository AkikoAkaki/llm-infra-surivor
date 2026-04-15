// 请求类型定义 — 每种类型对应一类敌人/流量

export const REQUEST_TYPES = {
  SHORT_QUERY: {
    type: 'SHORT_QUERY',
    label: '短查询',
    color: 'blue',
    tokens: 2,
    baseVram: 1,
    timeout: 3,
    weight: 40,
  },
  LONG_CONTEXT: {
    type: 'LONG_CONTEXT',
    label: '长上下文',
    color: 'purple',
    tokens: 6,
    baseVram: 3,
    timeout: 3,
    weight: 25,
  },
  JAILBREAK: {
    type: 'JAILBREAK',
    label: '恶意越狱',
    color: 'red',
    tokens: 3,
    baseVram: 1,
    timeout: 2,
    weight: 15,
  },
  GIANT_INFERENCE: {
    type: 'GIANT_INFERENCE',
    label: '巨型推理',
    color: 'orange',
    tokens: 10,
    baseVram: 4,
    timeout: 4,
    weight: 10,
  },
  DDOS: {
    type: 'DDOS',
    label: 'DDoS 攻击',
    color: 'red',
    tokens: 4,        // 单个就很重（原先靠翻倍生成，现在合并为一个更重的请求）
    baseVram: 2,
    timeout: 2,
    weight: 10,
  },
};

// 按 wave 数返回可出现的敌人类型列表
export function getAvailableTypes(wave) {
  const types = [REQUEST_TYPES.SHORT_QUERY, REQUEST_TYPES.LONG_CONTEXT];
  if (wave >= 2) types.push(REQUEST_TYPES.JAILBREAK);
  if (wave >= 3) types.push(REQUEST_TYPES.DDOS);
  if (wave >= 4) types.push(REQUEST_TYPES.GIANT_INFERENCE);
  return types;
}

// 加权随机
export function pickRandomType(wave) {
  const pool = getAvailableTypes(wave);
  const total = pool.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of pool) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return pool[0];
}

// 生成一波请求
let _reqCounter = 0;
export function generateWave(wave) {
  const baseCount = 3 + Math.floor(wave * 1.2);
  const requests = [];

  for (let i = 0; i < baseCount; i++) {
    const typeInfo = pickRandomType(wave);
    const scaledTokens = typeInfo.tokens + Math.floor(wave / 3);

    requests.push({
      instanceId: `req_${++_reqCounter}`,
      id: `R-${_reqCounter}`,
      ...typeInfo,
      tokens: scaledTokens,
      maxTokens: scaledTokens,
      age: 0,
      cacheHit: false,
    });
  }

  return requests;
}
