import { useState } from "react";
import { useRenderCount } from "../../instrumentation/useRenderCount";

function Child({ value }: { value: number }) {
  const rc = useRenderCount("Child");
  return (
    <div style={{ padding: 8, border: "1px solid #ddd" }}>
      <div>Child renderCount: {rc}</div>
      <div>value: {value}</div>
    </div>
  );
}

export function ScenarioParentChild() {
  const rc = useRenderCount("Parent");
  const [n, setN] = useState(0);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h3>Parent → Child rerender</h3>
      <div>Parent renderCount: {rc}</div>
      <button onClick={() => setN((v) => v + 1)}>Parent state +1</button>
      <Child value={n} />
    </div>
  );
}
