import { calcUsedVram } from '../game/reducer.js';

export default function StatusBar({ state }) {
  const usedVram = calcUsedVram(state);
  const vramPct = Math.min((usedVram / state.maxVram) * 100, 100);
  const tempPct = Math.min((state.temperature / state.maxTemperature) * 100, 100);
  const vramCrit = usedVram > state.maxVram;
  const tempCrit = state.temperature >= state.maxTemperature;

  return (
    <header className="status-bar">
      {/* SLA */}
      <div className="stat-block">
        <span className="stat-label">SLA</span>
        <span className={`stat-value sla ${state.sla < 40 ? 'critical' : ''}`}>
          {state.sla}
        </span>
      </div>

      {/* VRAM */}
      <div className="bar-group">
        <div className="bar-header">
          <span className="bar-label">VRAM</span>
          <span className="bar-value" style={{ color: vramCrit ? 'var(--color-error)' : undefined }}>
            {usedVram} / {state.maxVram}
          </span>
        </div>
        <div className="bar-track">
          <div
            className={`bar-fill vram ${vramCrit ? 'critical' : ''}`}
            style={{ width: `${vramPct}%` }}
          />
        </div>
      </div>

      {/* Temperature */}
      <div className="bar-group">
        <div className="bar-header">
          <span className="bar-label">
            TEMP
            {state.isOverheated && <span className="overheat-badge" style={{ marginLeft: 6 }}>过热</span>}
          </span>
          <span className="bar-value">{state.temperature} / {state.maxTemperature}</span>
        </div>
        <div className="bar-track">
          <div
            className={`bar-fill temp ${tempCrit ? 'overheat' : ''}`}
            style={{ width: `${tempPct}%` }}
          />
        </div>
      </div>

      {/* Compute */}
      <div className="stat-block" style={{ textAlign: 'right' }}>
        <span className="stat-label">Compute</span>
        <span className="stat-value compute">{state.compute}</span>
      </div>

      {/* Energy */}
      <div className="stat-block" style={{ textAlign: 'right' }}>
        <span className="stat-label">Energy</span>
        <span className="stat-value energy">{state.energy} / {state.maxEnergy}</span>
      </div>
    </header>
  );
}
