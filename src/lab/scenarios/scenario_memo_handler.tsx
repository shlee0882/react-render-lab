import React, { useCallback, useState } from "react";
import { useRenderCount } from "../../instrumentation/useRenderCount";
import { useWhyDidYouUpdate } from "../../instrumentation/useWhyDidYouUpdate";

type ChildProps = {
  value: number;
  onAction: () => void;
};

function Child({ value, onAction }: ChildProps) {
  const rc = useRenderCount("HandlerChild");

  // ✅ 추가: 왜 렌더됐는지 기록
  useWhyDidYouUpdate("HandlerChild", { value, onAction });

  return (
    <div style={{ padding: 8, border: "1px solid #ddd", display: "grid", gap: 6 }}>
      <div>Child renderCount: {rc}</div>
      <div>value: {value}</div>
      <button onClick={onAction}>child action</button>
    </div>
  );
}

const MemoChild = React.memo(Child);

export function ScenarioMemoHandler() {
  const rc = useRenderCount("HandlerParent");

  // value는 안 바꾸고, parent만 리렌더되는 토글
  const [toggle, setToggle] = useState(false);
  const [value] = useState(1);

  // ❌ 매 렌더마다 새 함수가 만들어짐 → memo 깨짐
  const unstableHandler = () => {
    // 일부러 내용 없음
  };

  // ✅ 참조가 안정적 → memo 유지됨
  const stableHandler = useCallback(() => {
    // 일부러 내용 없음
  }, []);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <h3>memo broken by handler prop</h3>
      <div>Parent renderCount: {rc}</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setToggle((v) => !v)}>
          rerender parent only (toggle)
        </button>
        <div style={{ opacity: 0.7 }}>toggle: {String(toggle)}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <h4>memo + unstable handler (should re-render)</h4>
          <MemoChild value={value} onAction={unstableHandler} />
        </div>

        <div>
          <h4>memo + stable handler (should NOT re-render)</h4>
          <MemoChild value={value} onAction={stableHandler} />
        </div>
      </div>
    </div>
  );
}
