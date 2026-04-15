export default function WaveReward({ state, onSelect, onSkip }) {
  return (
    <div className="overlay">
      <div className="reward-modal">
        <div className="reward-title">✓ Wave {state.wave - 1} 清除</div>
        <div className="reward-subtitle">选择一张卡牌加入你的牌库（或跳过）</div>

        <div className="reward-choices">
          {state.rewardChoices.map((card) => (
            <div
              key={card.instanceId}
              className={`reward-card ${card.type}`}
              onClick={() => onSelect(card.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: 8 }}>
                <span className="reward-card-name">{card.name}</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-energy)', fontWeight: 700 }}>
                  {card.cost}⚡
                </span>
              </div>
              <p className="reward-card-desc">{card.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 8 }}>
                <span className={`reward-card-type ${card.type}`}>{card.type}</span>
                {card.temp > 0 && (
                  <span style={{ fontSize: 9, color: 'var(--color-error)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    +{card.temp} Temp
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="reward-skip" onClick={onSkip}>跳过，不选牌</div>
      </div>
    </div>
  );
}
