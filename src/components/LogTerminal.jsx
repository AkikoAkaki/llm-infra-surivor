import { useEffect, useRef } from 'react';

export default function LogTerminal({ state, onEndTurn }) {
  const logRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state.logs]);

  const totalCards = state.drawPile.length + state.hand.length + state.discardPile.length;

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Terminal</span>
        <span className="panel-meta">
          Wave <span>{state.wave}</span> · Turn <span>{state.turn}</span>
        </span>
      </div>

      <div className="panel-body" ref={logRef}>
        {state.logs.map((entry) => (
          <div key={entry.id} className={`log-entry ${entry.color}`}>
            {entry.msg}
          </div>
        ))}
      </div>

      <div className="deck-counters">
        <span className="deck-count">抽 <span>{state.drawPile.length}</span></span>
        <span className="deck-count">手 <span>{state.hand.length}</span></span>
        <span className="deck-count">弃 <span>{state.discardPile.length}</span></span>
        <span className="deck-count" style={{ marginLeft: 'auto' }}>共 <span>{totalCards}</span> 张</span>
      </div>

      <button className="btn-end-turn" onClick={onEndTurn}>
        执行算力 (End Turn)
      </button>
    </div>
  );
}
