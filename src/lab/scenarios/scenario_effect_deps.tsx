import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRenderCount } from "../../instrumentation/useRenderCount";

function FakeFetch(query: string, delayMs = 250): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`result for "${query}" @ ${new Date().toLocaleTimeString()}`), delayMs);
  });
}

/** 1) ❌ deps 누락: query 바꿔도 effect가 다시 안 돌음 */
function MissingDeps() {
  const rc = useRenderCount("MissingDeps");
  const [query, setQuery] = useState("apple");
  const [result, setResult] = useState("(no result)");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ❌ query를 쓰면서 deps [] (한 번만 실행)
    let cancelled = false;
    setLoading(true);
    FakeFetch(query).then((r) => {
      if (cancelled) return;
      setResult(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 👈 버그 포인트

  return (
    <div style={{ border: "1px solid #ddd", padding: 10, display: "grid", gap: 6 }}>
      <h4>❌ Missing deps (stale result)</h4>
      <div style={{ opacity: 0.8 }}>renderCount: {rc}</div>

      <input value={query} onChange={(e) => setQuery(e.target.value)} />

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        query 바꿔도 result가 갱신 안 되면 정상(=버그 재현 성공)
      </div>

      <div>loading: {String(loading)}</div>
      <div>result: {result}</div>
    </div>
  );
}

/** 2) ❌ deps 과다/잘못: effect 안에서 바꾸는 값을 deps에 넣으면 루프 */
function InfiniteLoop() {
  const rc = useRenderCount("InfiniteLoop");
  const [n, setN] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [cap, setCap] = useState(30); // ✅ 최대 증가 횟수 (안 죽게)

  useEffect(() => {
    if (!enabled) return;
    if (n >= cap) return;

    // ❌ "deps 잘못" 패턴을 유지하되, cap으로 폭주를 멈춤
    setN((v) => v + 1);
  }, [n, enabled, cap]);

  return (
    <div style={{ border: "1px solid #ddd", padding: 10, display: "grid", gap: 6 }}>
      <h4>❌ Wrong deps (loop demo, capped)</h4>
      <div style={{ opacity: 0.8 }}>renderCount: {rc}</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setEnabled((v) => !v)}>
          loop enabled: {String(enabled)} (toggle)
        </button>
        <button onClick={() => setN(0)}>reset n</button>
      </div>

      <label style={{ fontSize: 12, opacity: 0.8 }}>
        cap: {cap} (최대 여기까지만 증가)
      </label>
      <input
        type="range"
        min={5}
        max={200}
        step={5}
        value={cap}
        onChange={(e) => setCap(Number(e.target.value))}
      />

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        enabled=true면 n이 cap까지 빠르게 올라감. “무한 루프”를 안전하게 재현한 버전.
      </div>

      <div>n: {n}</div>
    </div>
  );
}


/** 3) ✅ 올바른 패턴: deps 정확 + abort(최신 요청만 반영) */
function FixedDeps() {
  const rc = useRenderCount("FixedDeps");
  const [query, setQuery] = useState("apple");
  const [result, setResult] = useState("(no result)");
  const [loading, setLoading] = useState(false);

  // 최신 요청만 반영하기 위한 토큰
  const reqIdRef = useRef(0);

  const runFetch = useCallback(async (q: string) => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    const r = await FakeFetch(q, 300);
    // ✅ 최신 요청만 반영
    if (reqId !== reqIdRef.current) return;
    setResult(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    runFetch(query);
  }, [query, runFetch]);

  return (
    <div style={{ border: "1px solid #ddd", padding: 10, display: "grid", gap: 6 }}>
      <h4>✅ Fix: correct deps + latest-only</h4>
      <div style={{ opacity: 0.8 }}>renderCount: {rc}</div>

      <input value={query} onChange={(e) => setQuery(e.target.value)} />

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        query 변경할 때마다 fetch 실행 + 빠르게 타이핑해도 마지막 값만 result에 반영
      </div>

      <div>loading: {String(loading)}</div>
      <div>result: {result}</div>
    </div>
  );
}

/** 4) ✅ 참고: useMemo로 derived state를 만들고 effect를 없애는 패턴 */
function NoEffectComputed() {
  const rc = useRenderCount("NoEffectComputed");
  const [q, setQ] = useState("12");
  const items = useMemo(() => {
    // 큰 배열 만들기
    const arr = new Array(2000).fill(0).map((_, i) => `item-${i}`);
    return arr;
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim();
    return items.filter((x) => x.includes(t));
  }, [items, q]);

  return (
    <div style={{ border: "1px solid #ddd", padding: 10, display: "grid", gap: 6 }}>
      <h4>✅ Better: remove effect (computed)</h4>
      <div style={{ opacity: 0.8 }}>renderCount: {rc}</div>

      <input value={q} onChange={(e) => setQ(e.target.value)} />

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        파생 데이터는 effect로 동기화하지 말고 useMemo로 계산하는 게 안정적
      </div>

      <div>filtered len: {filtered.length}</div>
    </div>
  );
}

export function ScenarioEffectDeps() {
  const rc = useRenderCount("ScenarioEffectDeps");

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>useEffect deps: missing vs loop vs fix</h3>
      <div style={{ opacity: 0.8 }}>Scenario renderCount: {rc}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <MissingDeps />
        <InfiniteLoop />
        <FixedDeps />
        <NoEffectComputed />
      </div>
    </div>
  );
}
