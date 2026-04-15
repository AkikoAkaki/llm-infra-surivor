import { calcUsedVram } from '../game/reducer';
import type { GameState } from '../game/types';

interface StatusBarProps {
  state: GameState;
}

export default function StatusBar({ state }: StatusBarProps) {
  const usedVram = calcUsedVram(state);
  const vramPct = Math.min((usedVram / state.maxVram) * 100, 100);
  const tempPct = Math.min((state.temperature / state.maxTemperature) * 100, 100);
  const vramCrit = usedVram > state.maxVram;
  const slaCrit = state.sla < 40;

  return (
    <header className={`status-bar ${state.isOverheated ? 'overheated' : ''}`}>
      {/* SLA */}
      <div className="stat-card">
        <div className="stat-label">SLA</div>
        <div className={`stat-value ${slaCrit ? 'critical' : ''}`}>
          {state.sla}<span className="unit">%</span>
        </div>
      </div>

      {/* VRAM */}
      <div className="stat-card">
        <div className="stat-label">
          VRAM
          <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>
            {usedVram}/{state.maxVram}
          </span>
        </div>
        <div className="bar-track" style={{ marginTop: 10 }}>
          <div
            className={`bar-fill vram ${vramCrit ? 'critical' : ''}`}
            style={{ width: `${vramPct}%` }}
          />
        </div>
      </div>

      {/* 热量 */}
      <div className="stat-card">
        <div className="stat-label">
          热量
          {state.isOverheated ? (
            <span className="overheat-tag">过热</span>
          ) : (
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>
              {state.temperature}/{state.maxTemperature}
            </span>
          )}
        </div>
        <div className="bar-track" style={{ marginTop: 10 }}>
          <div
            className="bar-fill temp"
            style={{ width: `${tempPct}%` }}
          />
        </div>
      </div>

      {/* Compute / Energy 合并 */}
      <div className="stat-card" style={{ display: 'flex', flexDirection: 'row', gap: 'var(--s-5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="stat-label">Compute</div>
          <div className="stat-value">
            {state.compute}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="stat-label">Energy</div>
          <div className="stat-value">
            {state.energy}<span className="unit">/{state.maxEnergy}</span>
          </div>
        </div>
      </div>

      {/* Wave + Deck 右侧 */}
      <div className="deck-badges">
        <div className="deck-badge">
          <div className="deck-badge-value">{state.wave}</div>
          <div className="deck-badge-label">Wave</div>
        </div>
        <div className="deck-badge">
          <div className="deck-badge-value">{state.turn}</div>
          <div className="deck-badge-label">Turn</div>
        </div>
        <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)', margin: '0 4px' }} />
        <div className="deck-badge">
          <div className="deck-badge-value">{state.drawPile.length}</div>
          <div className="deck-badge-label">抽</div>
        </div>
        <div className="deck-badge">
          <div className="deck-badge-value">{state.discardPile.length}</div>
          <div className="deck-badge-label">弃</div>
        </div>
      </div>
    </header>
  );
}
