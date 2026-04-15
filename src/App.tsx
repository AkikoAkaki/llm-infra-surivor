import { useReducer, useEffect, useCallback } from 'react';
import { gameReducer } from './game/reducer.ts';
import { createInitialState } from './game/state.ts';
import StatusBar from './components/StatusBar.tsx';
import TrafficQueue from './components/TrafficQueue.tsx';
import CardHand from './components/CardHand.tsx';
import ToastLog from './components/ToastLog.tsx';
import WaveReward from './components/WaveReward.tsx';
import GameOver from './components/GameOver.tsx';
import type { GameState } from './game/types.ts';

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined as unknown as GameState, createInitialState);

  useEffect(() => {
    dispatch({ type: 'DRAW_INITIAL_HAND' });
  }, []);

  const handlePlayCard = useCallback((instanceId: string) => {
    dispatch({ type: 'PLAY_CARD', instanceId });
  }, []);

  const handleEndTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
  }, []);

  const handleSelectReward = useCallback((cardId: string) => {
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
    const onKey = (e: KeyboardEvent) => {
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

      <div className="content-split">
        <div className="left-column">
          <ToastLog logs={state.logs} />
        </div>

        <div className="right-column">
          <TrafficQueue state={state} />
          <CardHand state={state} onPlayCard={handlePlayCard} />
        </div>
      </div>

      {state.phase === 'ACTION' && (
        <button className="end-turn-float" onClick={handleEndTurn}>
          结束回合
          <span className="kbd">Space</span>
        </button>
      )}

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
