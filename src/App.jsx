import { useReducer, useEffect, useCallback } from 'react';
import { gameReducer } from './game/reducer.js';
import { createInitialState } from './game/state.js';
import StatusBar from './components/StatusBar.jsx';
import TrafficQueue from './components/TrafficQueue.jsx';
import CardHand from './components/CardHand.jsx';
import ToastLog from './components/ToastLog.jsx';
import WaveReward from './components/WaveReward.jsx';
import GameOver from './components/GameOver.jsx';

function App() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  useEffect(() => {
    dispatch({ type: 'DRAW_INITIAL_HAND' });
  }, []);

  const handlePlayCard = useCallback((instanceId) => {
    dispatch({ type: 'PLAY_CARD', instanceId });
  }, []);

  const handleEndTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
  }, []);

  const handleSelectReward = useCallback((cardId) => {
    dispatch({ type: 'SELECT_REWARD', cardId });
  }, []);

  const handleSkipReward = useCallback(() => {
    dispatch({ type: 'SKIP_REWARD' });
  }, []);

  const handleRestart = useCallback(() => {
    dispatch({ type: 'RESTART', initialState: createInitialState() });
    setTimeout(() => dispatch({ type: 'DRAW_INITIAL_HAND' }), 0);
  }, []);

  // 空格键 / 回车 结束回合
  useEffect(() => {
    const onKey = (e) => {
      if (state.phase !== 'ACTION') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleEndTurn();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.phase, handleEndTurn]);

  return (
    <div className="game-shell">
      <StatusBar state={state} />

      <div className="main-area">
        <TrafficQueue state={state} />
      </div>

      <CardHand state={state} onPlayCard={handlePlayCard} />

      {state.phase === 'ACTION' && (
        <button className="end-turn-float" onClick={handleEndTurn}>
          结束回合
          <span className="kbd">Space</span>
        </button>
      )}

      <ToastLog logs={state.logs} />

      {state.phase === 'REWARD' && (
        <WaveReward
          state={state}
          onSelect={handleSelectReward}
          onSkip={handleSkipReward}
        />
      )}
      {state.phase === 'GAMEOVER' && (
        <GameOver state={state} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
