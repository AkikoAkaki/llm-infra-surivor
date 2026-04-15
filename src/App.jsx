import { useReducer, useEffect, useCallback } from 'react';
import { gameReducer } from './game/reducer.js';
import { createInitialState } from './game/state.js';
import StatusBar from './components/StatusBar.jsx';
import LogTerminal from './components/LogTerminal.jsx';
import TrafficQueue from './components/TrafficQueue.jsx';
import CardHand from './components/CardHand.jsx';
import WaveReward from './components/WaveReward.jsx';
import GameOver from './components/GameOver.jsx';

function App() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  // 游戏启动时抽初始手牌
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
    // 重新抽初始手牌由下一个 effect 触发
    setTimeout(() => dispatch({ type: 'DRAW_INITIAL_HAND' }), 0);
  }, []);

  return (
    <div className="game-shell">
      <StatusBar state={state} />

      <div className="main-area">
        <LogTerminal state={state} onEndTurn={handleEndTurn} />
        <TrafficQueue state={state} />
      </div>

      <CardHand state={state} onPlayCard={handlePlayCard} />

      {/* 遮罩层 */}
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
