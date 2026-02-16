import { useState } from "react";
import { useRenderCount } from "../../instrumentation/useRenderCount";
import React from "react";

function ExpensiveChild({ label, value }: { label: string; value: number }) {
  const rc = useRenderCount(label);

  // 렌더 자체 비용(체감 크게 하려면 여기 루프 크게)
  let sum = 0;
  for (let i = 0; i < 6_000_000; i++) sum += i % 10;

  const computed = sum + value;

  return (
    <div style={{ padding: 8, border: "1px solid #ddd" }}>
      <div>{label} renderCount: {rc}</div>
      <div>computed: {computed}</div>
    </div>
  );
}
const MemoChild = React.memo(ExpensiveChild);


export function ScenarioMemo() {
  const rc = useRenderCount("MemoParent");
  const [n, setN] = useState(0);
  const [toggle, setToggle] = useState(true);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h3>React.memo on/off</h3>
      <div>Parent renderCount: {rc}</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button onClick={() => { setN(v=>v+1); }}>value +1</button>
      <button onClick={() => { setToggle(v=>!v); }}>rerender parent only</button>

      </div>
      <div style={{ fontSize: 12, opacity: 0.75 }}>
        비교 규칙:
        <br />- toggle(부모만 리렌더): Without는 증가 / With는 고정이어야 정상
        <br />- value+1(props 변경): 둘 다 증가하는 게 정상(비교 대상 아님)
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <h4>Without memo</h4>
          <ExpensiveChild label="WithoutMemoChild" value={n} />
        </div>

        <div>
          <h4>With memo</h4>
          <MemoChild label="WithMemoChild" value={n} />
        </div>
      </div>




      <div>toggle state: {String(toggle)}</div>
    </div>
  );
}
