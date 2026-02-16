import { useEffect, useMemo, useState } from "react";
import { useRenderCount } from "../../instrumentation/useRenderCount";
import { useWhyDidYouUpdate } from "../../instrumentation/useWhyDidYouUpdate";

type Item = { id: number; name: string };

function makeItems(n: number): Item[] {
  const arr: Item[] = [];
  for (let i = 0; i < n; i++) arr.push({ id: i, name: `item-${i}` });
  return arr;
}

function heavyHash(s: string) {
  let x = 0;
  for (let i = 0; i < 200; i++) {
    for (let j = 0; j < s.length; j++) x = (x * 33 + s.charCodeAt(j)) | 0;
  }
  return x;
}

function ListView({ items, label }: { items: Item[]; label: string }) {
  const rc = useRenderCount(label);
  useWhyDidYouUpdate(label, { len: items.length });

  // 렌더 비용을 조금 만들기
  const top = items.slice(0, 50).map((it) => (
    <div key={it.id} style={{ fontFamily: "monospace", fontSize: 12 }}>
      {it.id.toString().padStart(4, "0")} {it.name} h={heavyHash(it.name)}
    </div>
  ));

  return (
    <div style={{ border: "1px solid #ddd", padding: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ opacity: 0.8 }}>renderCount: {rc}</div>
      </div>
      <div style={{ fontSize: 12, opacity: 0.75 }}>items: {items.length}</div>
      <div style={{ maxHeight: 160, overflow: "auto", marginTop: 6 }}>{top}</div>
      {items.length > 50 && (
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
          ... {items.length - 50} more
        </div>
      )}
    </div>
  );
}

function Bad_DerivedState() {
  const rc = useRenderCount("Bad_DerivedState");

  const [items] = useState(() => makeItems(2000));
  const [query, setQuery] = useState("");
  const [minId, setMinId] = useState(0);

  // ❌ derived state를 따로 보관
  const [filtered, setFiltered] = useState<Item[]>(() => items);

  // ❌ useEffect로 state 동기화: 렌더 → effect → setState → 추가 렌더
  useEffect(() => {
    const q = query.trim().toLowerCase();
    const next = items.filter(
      (it) => it.id >= minId && (q === "" || it.name.includes(q))
    );
    setFiltered(next);
  }, [items, query, minId]);

  useWhyDidYouUpdate("Bad_DerivedState", { query, minId });

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h4>Bad: derived state (useEffect sync)</h4>
      <div style={{ opacity: 0.8 }}>renderCount: {rc}</div>

      <div style={{ display: "grid", gap: 6 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="query (e.g. 12)"
        />
        <label style={{ fontSize: 12, opacity: 0.8 }}>minId: {minId}</label>
        <input
          type="range"
          min={0}
          max={2000}
          step={10}
          value={minId}
          onChange={(e) => setMinId(Number(e.target.value))}
        />
      </div>

      <ListView label="Bad_ListView" items={filtered} />
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        특징: 입력 1번에 렌더가 2번(이상) 발생하기 쉬움 / 동기화 누락 버그 위험
      </div>
    </div>
  );
}

function Good_Computed() {
  const rc = useRenderCount("Good_Computed");

  const [items] = useState(() => makeItems(2000));
  const [query, setQuery] = useState("");
  const [minId, setMinId] = useState(0);

  // ✅ 파생 데이터는 계산형으로
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => it.id >= minId && (q === "" || it.name.includes(q)));
  }, [items, query, minId]);

  useWhyDidYouUpdate("Good_Computed", { query, minId });

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h4>Good: computed (useMemo)</h4>
      <div style={{ opacity: 0.8 }}>renderCount: {rc}</div>

      <div style={{ display: "grid", gap: 6 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="query (e.g. 12)"
        />
        <label style={{ fontSize: 12, opacity: 0.8 }}>minId: {minId}</label>
        <input
          type="range"
          min={0}
          max={2000}
          step={10}
          value={minId}
          onChange={(e) => setMinId(Number(e.target.value))}
        />
      </div>

      <ListView label="Good_ListView" items={filtered} />
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        특징: 입력 1번 = 렌더 1번에 수렴 / 흐름 단순 / 동기화 버그 없음
      </div>
    </div>
  );
}

export function ScenarioDerivedState() {
  const rc = useRenderCount("ScenarioDerivedState");

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>Derived state vs computed</h3>
      <div style={{ opacity: 0.8 }}>Scenario renderCount: {rc}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Bad_DerivedState />
        <Good_Computed />
      </div>
    </div>
  );
}
