import { useEffect, useState, useRef } from 'react';

const TOAST_LIFETIME_MS = 3400;
const MAX_VISIBLE = 3;

export default function ToastLog({ logs }) {
  const [visible, setVisible] = useState([]);
  const seenRef = useRef(new Set());

  useEffect(() => {
    // 只展示新出现的日志（避免首次渲染把历史 log 全部 toast 出来）
    const fresh = logs.filter((l) => {
      const id = l.id ?? `${l.msg}-${l.color}`;
      if (seenRef.current.has(id)) return false;
      seenRef.current.add(id);
      return true;
    });
    if (fresh.length === 0) return;

    // 只关心玩家可能需要注意的条目（过滤纯 dim 分隔线等）
    const meaningful = fresh.filter((l) => l.color !== 'dim');
    if (meaningful.length === 0) return;

    setVisible((prev) => [...prev, ...meaningful].slice(-MAX_VISIBLE));

    // 定时移除
    const timers = meaningful.map((l) =>
      setTimeout(() => {
        setVisible((prev) => prev.filter((x) => x !== l));
      }, TOAST_LIFETIME_MS)
    );
    return () => timers.forEach(clearTimeout);
  }, [logs]);

  // 首次挂载时跳过已有日志（只展示交互后新增的）
  useEffect(() => {
    for (const l of logs) {
      const id = l.id ?? `${l.msg}-${l.color}`;
      seenRef.current.add(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="toast-stack" aria-live="polite">
      {visible.map((l, i) => (
        <div key={(l.id ?? i) + '-' + i} className={`toast ${l.color || 'default'}`}>
          {l.msg}
        </div>
      ))}
    </div>
  );
}
