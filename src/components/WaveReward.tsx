import type { GameState } from '../game/types';

interface WaveRewardProps {
  state: GameState;
  onSelect: (cardId: string) => void;
  onSkip: () => void;
}

export default function WaveReward({ state, onSelect, onSkip }: WaveRewardProps) {
  return (
    <div className="overlay">
      <div className="modal reward-modal">
        <div className="reward-header">
          <div className="reward-eyebrow">
            ✓ Wave {state.wave - 1} 清除
          </div>
          <div className="reward-title">选择一张强化卡</div>
          <div className="reward-subtitle">加入你的牌库；或跳过保持精简。</div>
        </div>

        <div className="reward-choices">
          {state.rewardChoices.map((card) => (
            <div
              key={card.instanceId}
              className="reward-card"
              onClick={() => onSelect(card.id)}
            >
              <div className="reward-card-top">
                <span className="reward-card-name">{card.name}</span>
                <span className="card-cost">{card.cost}</span>
              </div>
              <p className="reward-card-desc">{card.desc}</p>
              <div className="reward-card-footer">
                <span className={`card-type ${card.type}`}>{card.type}</span>
                {card.temp > 0 && <span className="card-temp">+{card.temp} 热</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="reward-skip" onClick={onSkip}>跳过，不选牌</div>
      </div>
    </div>
  );
}
