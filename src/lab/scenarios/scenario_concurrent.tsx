import {
    startTransition,
    useDeferredValue,
    useMemo,
    useState,
    useTransition,
  } from "react";
  import { useRenderCount } from "../../instrumentation/useRenderCount";
  
  function heavyCompute(seed: number) {
    // CPU 태우기(너무 높이면 브라우저 터짐)
    let x = seed;
    for (let i = 0; i < 900; i++) {
      x = (x * 1664525 + 1013904223) % 4294967296;
    }
    return x;
  }
  
  function HeavyResults({
    label,
    query,
    size,
  }: {
    label: string;
    query: string;
    size: number;
  }) {
    const rc = useRenderCount(label);
  
    const rows = useMemo(() => {
      const q = query.trim();
      const out: string[] = [];
      for (let i = 0; i < size; i++) {
        // 쿼리 변경 시 CPU+문자열 연산 비용 발생
        const v = heavyCompute(i + q.length);
        if (q === "" || String(v).includes(q) || String(i).includes(q)) {
          out.push(`${i.toString().padStart(4, "0")}  v=${v}`);
        }
      }
      return out;
    }, [query, size]);
  
    return (
      <div style={{ border: "1px solid #ddd", padding: 10, display: "grid", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 600 }}>{label}</div>
          <div style={{ opacity: 0.8 }}>renderCount: {rc}</div>
        </div>
  
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          query="{query}" / matched: {rows.length} / size: {size}
        </div>
  
        <div style={{ maxHeight: 220, overflow: "auto", fontFamily: "monospace", fontSize: 12 }}>
          {rows.slice(0, 400).map((s, idx) => (
            <div key={idx}>{s}</div>
          ))}
          {rows.length > 400 && (
            <div style={{ opacity: 0.7, marginTop: 6 }}>
              ... {rows.length - 400} more
            </div>
          )}
        </div>
      </div>
    );
  }
  
  /** 1) Blocking: 입력 = 즉시 무거운 리스트 업데이트 (버벅임 유발) */
  function Blocking() {
    const rc = useRenderCount("Concurrent_Blocking");
    const [text, setText] = useState("");
    const [size, setSize] = useState(2000);
  
    return (
      <div style={{ border: "1px solid #bbb", padding: 10, display: "grid", gap: 8 }}>
        <h4>❌ Blocking (no transition)</h4>
        <div style={{ opacity: 0.8 }}>renderCount: {rc}</div>
  
        <label style={{ fontSize: 12, opacity: 0.8 }}>size: {size}</label>
        <input
          type="range"
          min={800}
          max={12000}
          step={200}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
  
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="type fast: 1, 12, 123..."
          style={{ padding: 8, border: "1px solid #ccc" }}
        />
  
        <HeavyResults label="Blocking_HeavyResults" query={text} size={size} />
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          입력과 heavy 렌더가 같은 우선순위라 타이핑이 버벅일 수 있음
        </div>
      </div>
    );
  }
  
  /** 2) startTransition: input은 즉시, heavy list는 transition으로 낮은 우선순위 */
  function WithTransition() {
    const rc = useRenderCount("Concurrent_Transition");
    const [text, setText] = useState("");
    const [query, setQuery] = useState("");
    const [size, setSize] = useState(2000);
  
    const [isPending, startTrans] = useTransition();
  
    return (
      <div style={{ border: "1px solid #bbb", padding: 10, display: "grid", gap: 8 }}>
        <h4>✅ startTransition (input high-priority)</h4>
        <div style={{ opacity: 0.8 }}>
          renderCount: {rc} / pending: <b>{String(isPending)}</b>
        </div>
  
        <label style={{ fontSize: 12, opacity: 0.8 }}>size: {size}</label>
        <input
          type="range"
          min={800}
          max={12000}
          step={200}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
  
        <input
          value={text}
          onChange={(e) => {
            const next = e.target.value;
            setText(next); // ✅ 즉시 반영 (타이핑 부드러움)
            startTrans(() => {
              setQuery(next); // ✅ heavy 업데이트는 transition
            });
          }}
          placeholder="type fast: 1, 12, 123..."
          style={{ padding: 8, border: "1px solid #ccc" }}
        />
  
        <HeavyResults label="Transition_HeavyResults" query={query} size={size} />
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          pending=true 동안 heavy 업데이트가 뒤로 밀릴 수 있음(타이핑 우선)
        </div>
      </div>
    );
  }
  
  /** 3) useDeferredValue: value 자체를 “지연된 버전”으로 만들어 heavy에 사용 */
  function WithDeferredValue() {
    const rc = useRenderCount("Concurrent_Deferred");
    const [text, setText] = useState("");
    const [size, setSize] = useState(2000);
  
    const deferredText = useDeferredValue(text);
  
    return (
      <div style={{ border: "1px solid #bbb", padding: 10, display: "grid", gap: 8 }}>
        <h4>✅ useDeferredValue (heavy reads deferred value)</h4>
        <div style={{ opacity: 0.8 }}>
          renderCount: {rc} / deferred lag: <b>{String(deferredText !== text)}</b>
        </div>
  
        <label style={{ fontSize: 12, opacity: 0.8 }}>size: {size}</label>
        <input
          type="range"
          min={800}
          max={12000}
          step={200}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
  
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="type fast: 1, 12, 123..."
          style={{ padding: 8, border: "1px solid #ccc" }}
        />
  
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          input(text): "{text}" / deferred: "{deferredText}"
        </div>
  
        <HeavyResults label="Deferred_HeavyResults" query={deferredText} size={size} />
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          heavy가 deferredText를 읽어서 input은 즉시, heavy는 늦게 따라옴
        </div>
      </div>
    );
  }
  
  export function ScenarioConcurrent() {
    const rc = useRenderCount("ScenarioConcurrent");
  
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <h3>Concurrent: startTransition & deferred</h3>
        <div style={{ opacity: 0.8 }}>Scenario renderCount: {rc}</div>
  
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Blocking />
          <WithTransition />
          <WithDeferredValue />
        </div>
  
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          테스트 팁: size를 8000~12000으로 올리고 숫자 빠르게 입력해봐.
          Blocking은 입력이 끊기고, Transition/Deferred는 상대적으로 부드러워야 정상.
        </div>
      </div>
    );
  }
  