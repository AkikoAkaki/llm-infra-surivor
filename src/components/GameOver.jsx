export default function GameOver({ state, onRestart }) {
  const { stats, wave } = state;

  return (
    <div className="overlay">
      <div className="gameover-modal">
        <div>
          <div className="gameover-title">服务崩溃</div>
          <div className="gameover-subtitle">SLA 降至 0，所有请求无法响应</div>
        </div>

        <div className="gameover-stats">
          <div className="gameover-stat-row">
            <span className="label">抵达波次</span>
            <span className="value">Wave {wave}</span>
          </div>
          <div className="gameover-stat-row">
            <span className="label">成功清除波次</span>
            <span className="value">{stats.wavesCleared}</span>
          </div>
          <div className="gameover-stat-row">
            <span className="label">请求处理成功</span>
            <span className="value">{stats.requestsHandled}</span>
          </div>
          <div className="gameover-stat-row">
            <span className="label">请求超时</span>
            <span className="value" style={{ color: stats.requestsTimedOut > 0 ? 'var(--color-error)' : undefined }}>
              {stats.requestsTimedOut}
            </span>
          </div>
          <div className="gameover-stat-row">
            <span className="label">主动丢弃请求</span>
            <span className="value">{stats.requestsDropped}</span>
          </div>
        </div>

        <button className="btn-restart" onClick={onRestart}>
          重新启动集群
        </button>
      </div>
    </div>
  );
}
