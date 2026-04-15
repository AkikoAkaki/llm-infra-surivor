// 敌人（请求）类型数据库
// 每个类型决定了对应请求的基础属性和特殊行为标签

export const REQUEST_TYPES = {
  SHORT_QUERY: {
    type: 'SHORT_QUERY',
    label: '短查询',
    color: 'blue',
    tokens: 2,
    baseVram: 1,
    timeout: 3,
    weight: 40, // 生成权重（越高越常见）
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
    timeout: 2, // 只有 2 回合 Timeout
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
    // 特殊规则：必须在单回合内一次性击杀，否则不扣令牌
    mustOneShot: true,
  },
  DDOS: {
    type: 'DDOS',
    label: 'DDoS 攻击',
    color: 'red',
    tokens: 2,
    baseVram: 1,
    timeout: 3,
    weight: 10,
    // 特殊规则：该类型在波次生成时计数为 2x
    ddos: true,
  },
};

// 按 wave 数返回可出现的敌人类型列表（带权重）
export function getAvailableTypes(wave) {
  const types = [REQUEST_TYPES.SHORT_QUERY, REQUEST_TYPES.LONG_CONTEXT];
  if (wave >= 2) types.push(REQUEST_TYPES.JAILBREAK);
  if (wave >= 3) types.push(REQUEST_TYPES.DDOS);
  if (wave >= 4) types.push(REQUEST_TYPES.GIANT_INFERENCE);
  return types;
}

// 加权随机选择一个请求类型
export function pickRandomType(wave) {
  const pool = getAvailableTypes(wave);
  const totalWeight = pool.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * totalWeight;
  for (const t of pool) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return pool[0];
}

// 生成一波请求列表
let _reqCounter = 0;
export function generateWave(wave) {
  const baseCount = 3 + Math.floor(wave * 1.2);
  const requests = [];

  for (let i = 0; i < baseCount; i++) {
    const typeInfo = pickRandomType(wave);
    const scaledTokens = typeInfo.tokens + Math.floor(wave / 3);

    const req = {
      instanceId: `req_${++_reqCounter}`,
      id: `R-${_reqCounter}`,
      ...typeInfo,
      tokens: scaledTokens,
      maxTokens: scaledTokens,
      age: 0,
      cacheHit: false,
    };

    requests.push(req);

    // DDoS 双倍生成
    if (typeInfo.ddos) {
      requests.push({
        ...req,
        instanceId: `req_${++_reqCounter}`,
        id: `R-${_reqCounter}`,
        tokens: scaledTokens,
        maxTokens: scaledTokens,
        age: 0,
        cacheHit: false,
      });
    }
  }

  return requests;
}
