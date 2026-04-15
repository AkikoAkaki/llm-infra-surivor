export default function CardHand({ state, onPlayCard }) {
  return (
    <div className="hand-area">
      <div style={{ padding: '8px 12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="panel-title">Hand</span>
        <span className="panel-meta">Energy <span>{state.energy}</span> / <span>{state.maxEnergy}</span></span>
      </div>
      <div className="hand-inner">
        {state.hand.length === 0 ? (
          <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', margin: 'auto' }}>
            手牌为空 — 等待下回合抽牌
          </span>
        ) : (
          state.hand.map((card) => (
            <Card
              key={card.instanceId}
              card={card}
              isOverheated={state.isOverheated}
              energy={state.energy}
              onPlay={() => onPlayCard(card.instanceId)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Card({ card, isOverheated, energy, onPlay }) {
  const canAfford = energy >= card.cost;
  const isRestricted = isOverheated && card.type === 'Infra';
  const playable = canAfford && !isRestricted;

  return (
    <div
      className={`card ${card.type} ${!playable ? 'disabled' : ''}`}
      onClick={playable ? onPlay : undefined}
      title={isRestricted ? '过热时无法部署 Infra 卡' : !canAfford ? `需要 ${card.cost} Energy` : '点击打出'}
    >
      <div className="card-top">
        <span className="card-name">{card.name}</span>
        <span className="card-cost">{card.cost}⚡</span>
      </div>

      <p className="card-desc">{card.desc}</p>

      <div className="card-footer">
        <span className={`card-type ${card.type}`}>{card.type}</span>
        {card.temp > 0 && <span className="card-temp">+{card.temp} Temp</span>}
      </div>
    </div>
  );
}
