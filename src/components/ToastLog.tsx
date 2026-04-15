import { useEffect, useRef } from 'react';
import type { LogEntry } from '../game/types';

interface ToastLogProps {
  logs: LogEntry[];
}

export default function ToastLog({ logs }: ToastLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="panel system-log-panel">
      <div className="panel-header" style={{ paddingBottom: '8px' }}>
        <span className="panel-title">System Log</span>
        <div className="panel-meta">
          <div className="meta-item">
            <span className="label">Live</span>
            <span className="value" style={{ color: 'var(--success)' }}>●</span>
          </div>
        </div>
      </div>
      <div className="panel-body log-console">
        {logs.map((l, i) => (
          <div key={(l.id ?? i) + '-' + i} className={`log-entry ${l.color || 'default'}`}>
            <span className="log-prefix">&gt;</span>
            <span className="log-msg">{l.msg}</span>
          </div>
        ))}
        <div ref={endRef} style={{ height: 1, flexShrink: 0 }} />
      </div>
    </div>
  );
}
