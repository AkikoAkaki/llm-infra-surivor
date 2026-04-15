import { calcUsedVram } from '../game/reducer.js';

export default function TrafficQueue({ state }) {
  const usedVram = calcUsedVram(state);

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Traffic Queue</span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span className="panel-meta">
            VRAM <span style={{ color: usedVram > state.maxVram ? 'var(--color-error)' : undefined }}>
              {usedVram}/{state.maxVram}
            </span>
          </span>
          <span className="panel-meta">
            队列 <span>{state.requests.length}</span>
          </span>
        </div>
      </div>

      <div className="panel-body">
        {state.requests.length === 0 ? (
          <div className="empty-queue">队列清空 — 等待下一波...</div>
        ) : (
          state.requests.map((req) => (
            <RequestCard
              key={req.instanceId}
              req={req}
              vramReduction={state.turnBuffs.vramReduction}
            />
          ))
        )}
      </div>

      <div style={{ padding: '6px 12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          * 算力优先分配给存活最久的请求
        </span>
      </div>
    </div>
  );
}

function RequestCard({ req, vramReduction }) {
  const progress = ((req.maxTokens - req.tokens) / req.maxTokens) * 100;
  const actualVram = req.cacheHit ? 0 : Math.max(1, req.baseVram - vramReduction);
  const ageDanger = req.age >= req.timeout - 1;

  return (
    <div className={`req-card ${req.color} ${req.cacheHit ? 'cache-hit' : ''}`}>
      <div className="req-header">
        <span className="req-id">
          {req.id}
          <span className="req-type-badge" style={{ marginLeft: 6 }}>{req.label}</span>
          {req.mustOneShot && (
            <span className="req-type-badge" style={{ marginLeft: 4, color: 'var(--color-error)', borderColor: 'rgba(248,113,113,0.3)' }}>
              必须一击
            </span>
          )}
        </span>
        {req.cacheHit ? (
          <span className="req-vram cache">⚡ 缓存命中</span>
        ) : (
          <span className="req-vram">{actualVram} VRAM</span>
        )}
      </div>

      <div className="req-meta">
        <span className="req-tokens">{req.tokens} tokens</span>
        <span className={`req-age ${ageDanger ? 'danger' : ''}`}>
          ⏳ {req.age}/{req.timeout}
        </span>
      </div>

      <div className="req-progress">
        <div
          className={`req-progress-fill ${req.cacheHit ? 'cache-hit' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
