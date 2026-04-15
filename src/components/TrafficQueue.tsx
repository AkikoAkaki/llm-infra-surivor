import { calcUsedVram } from '../game/reducer';
import type { GameState, RequestInstance } from '../game/types';

interface TrafficQueueProps {
  state: GameState;
}

export default function TrafficQueue({ state }: TrafficQueueProps) {
  const usedVram = calcUsedVram(state);
  const vramCrit = usedVram > state.maxVram;

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">流量队列</span>
        <div className="panel-meta">
          <div className="meta-item">
            <span className="label">队列</span>
            <span className="value">{state.requests.length}</span>
          </div>
          <div className="meta-item">
            <span className="label">VRAM</span>
            <span className="value" style={vramCrit ? { color: 'var(--danger)' } : undefined}>
              {usedVram}/{state.maxVram}
            </span>
          </div>
          <div className="meta-item">
            <span className="label">优先级</span>
            <span className="value" style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>存活久的优先</span>
          </div>
        </div>
      </div>

      <div className="panel-body">
        {state.requests.length === 0 ? (
          <div className="empty-queue">队列清空 — 等待下一波流量</div>
        ) : (
          state.requests.map((req, i) => {
            const prev = state.requests[i - 1];
            const inCacheChain = req.cacheHit && prev && prev.color === req.color;
            return (
              <RequestRow
                key={req.instanceId}
                req={req}
                vramReduction={state.turnBuffs.vramReduction}
                showCacheLink={inCacheChain}
                cacheMultiplier={state.turnBuffs.cacheMultiplier}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

interface RequestRowProps {
  req: RequestInstance;
  vramReduction: number;
  showCacheLink: boolean | RequestInstance;
  cacheMultiplier: number;
}

function RequestRow({ req, vramReduction, showCacheLink, cacheMultiplier }: RequestRowProps) {
  const actualVram = req.cacheHit ? 0 : Math.max(1, req.baseVram - vramReduction);
  const ageDanger = req.age >= req.timeout - 1;
  const ageWarn = !ageDanger && req.age >= Math.ceil(req.timeout / 2);

  const progressPct = ((req.maxTokens - req.tokens) / req.maxTokens) * 100;
  const remainingTurns = req.timeout - req.age;

  // SVG 环参数
  const size = 36;
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const timeoutPct = req.age / req.timeout;
  const dashOffset = circumference * timeoutPct;

  const ringCls = ageDanger ? 'danger' : ageWarn ? 'warn' : '';

  return (
    <div className="req-row">
      {showCacheLink && (
        <>
          <div
            className="cache-link"
            style={{ top: -12, height: 12 }}
          />
          <span className="cache-badge" style={{ top: 0 }}>
            ×{cacheMultiplier || 2}
          </span>
        </>
      )}
      <div className={`req-card ${ageDanger ? 'danger' : ''} ${req.cacheHit ? 'cache-hit' : ''}`}>
        {/* 倒计时环 */}
        <div className={`timeout-ring ${ringCls}`} title={`${remainingTurns} 回合后超时`}>
          <svg viewBox={`0 0 ${size} ${size}`}>
            <circle
              className="track"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth="3"
            />
            <circle
              className="fill"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="label">{remainingTurns}</div>
        </div>

        {/* 主体 */}
        <div className="req-body">
          <div className="req-title-row">
            <span className="req-id">{req.id}</span>
            <span className={`req-tag ${req.type === 'DDOS' ? 'ddos' : req.color}`}>{req.label}</span>
          </div>
          <div className="req-progress-row">
            <div className="req-progress-bar">
              <div
                className={`req-progress-fill ${req.cacheHit ? 'cache-hit' : ''}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="req-tokens">
              <strong>{req.tokens}</strong>/{req.maxTokens} tokens
            </span>
          </div>
        </div>

        {/* VRAM / Cache 信息 */}
        <div className={`req-vram-info ${req.cacheHit ? 'cache' : ''}`}>
          <span className="label">{req.cacheHit ? '缓存命中' : 'VRAM'}</span>
          <span className="value">
            {req.cacheHit ? `×${cacheMultiplier || 2} Compute` : actualVram}
          </span>
        </div>
      </div>
    </div>
  );
}
