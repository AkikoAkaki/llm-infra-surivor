export default function CardHand({ state, onPlayCard }) {
  const pips = Array.from({ length: state.maxEnergy }, (_, i) => i < state.energy);
  return (
    <div className="hand-area">
      <div className="hand-header">
        <span className="hand-title">手牌 · {state.hand.length}</span>
        <div className="hand-energy">
          <span style={{ marginRight: 4 }}>Energy</span>
          {pips.map((active, i) => (
            <span key={i} className={`hand-energy-pip ${active ? '' : 'spent'}`} />
          ))}
          <span className="tnum" style={{ marginLeft: 6 }}>
            {state.energy}/{state.maxEnergy}
          </span>
        </div>
      </div>
      <div className="hand-inner">
        {state.hand.length === 0 ? (
          <div className="empty-hand">手牌为空，等待下回合抽牌</div>
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

  const title = isRestricted
    ? '过热时无法部署 Infra 卡'
    : !canAfford
    ? `需要 ${card.cost} Energy`
    : '点击打出';

  return (
    <div
      className={`card ${card.type} ${!playable ? 'disabled' : ''}`}
      onClick={playable ? onPlay : undefined}
      title={title}
    >
      {isRestricted && <span className="card-lock" title="过热锁定">🔒</span>}

      <div className="card-top">
        <span className="card-name">{card.name}</span>
        <span className="card-cost">{card.cost}</span>
      </div>

      <p className="card-desc">{card.desc}</p>

      <div className="card-footer">
        <span className={`card-type ${card.type}`}>{card.type}</span>
        {card.temp > 0 && <span className="card-temp">+{card.temp} 热</span>}
      </div>
    </div>
  );
}
