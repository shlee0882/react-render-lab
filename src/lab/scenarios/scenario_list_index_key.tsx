import { useMemo, useState } from "react";
import { useRenderCount } from "../../instrumentation/useRenderCount";

type Row = { id: string; label: string };

function makeRows(): Row[] {
  return [
    { id: "a1", label: "Alpha" },
    { id: "b2", label: "Bravo" },
    { id: "c3", label: "Charlie" },
    { id: "d4", label: "Delta" },
    { id: "e5", label: "Echo" },
  ];
}

function RowItem({ row }: { row: Row }) {
  const rc = useRenderCount(`RowItem(${row.id})`);
  const [checked, setChecked] = useState(false);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr 140px",
        gap: 8,
        alignItems: "center",
        padding: "6px 8px",
        borderBottom: "1px solid #eee",
      }}
    >
      <div style={{ fontFamily: "monospace" }}>
        id: <b>{row.id}</b>
      </div>
      <div>
        label: <b>{row.label}</b>
      </div>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        checked: {String(checked)} / rc:{rc}
      </label>
    </div>
  );
}

export function ScenarioListIndexKey() {
  const rc = useRenderCount("ScenarioListIndexKey");
  const [rows, setRows] = useState<Row[]>(() => makeRows());
  const [mode, setMode] = useState<"index-key" | "id-key">("index-key");

  const hint = useMemo(() => {
    if (mode === "index-key") {
      return "❌ index key: 중간 삽입/정렬/필터 시 state가 다른 행으로 점프할 수 있음";
    }
    return "✅ stable id key: 행 identity가 유지되어 state가 제자리에 남음";
  }, [mode]);

  const insertAtTop = () => {
    const n = Math.random().toString(16).slice(2, 6);
    setRows((prev) => [{ id: `x${n}`, label: `NEW-${n}` }, ...prev]);
  };

  const shuffle = () => {
    setRows((prev) => {
      const a = [...prev];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    });
  };

  const removeSecond = () => {
    setRows((prev) => prev.filter((_, idx) => idx !== 1));
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <h3>List: index key bug (state jumps)</h3>
      <div style={{ opacity: 0.8 }}>Scenario renderCount: {rc}</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 36, alignItems: "center" }}>
        <button
          onClick={() =>
            setMode((m) => (m === "index-key" ? "id-key" : "index-key"))
          }
        >
          mode: {mode} (toggle)
        </button>

        <button onClick={insertAtTop}>insert at top</button>
        <button onClick={removeSecond}>remove 2nd row</button>
        <button onClick={shuffle}>shuffle</button>
        <button onClick={() => setRows(makeRows())}>reset rows</button>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75 }}>{hint}</div>


      <div style={{ border: "1px solid #ddd" }}>
        <div
          style={{
            padding: "8px 8px",
            borderBottom: "1px solid #ddd",
            fontWeight: 600,
            // 헤더 높이도 고정(선택)
            minHeight: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Rows ({rows.length})</span>
        </div>

        <div
          style={{
            height: 360,              // 원하는 고정 높이(px)로 조절
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarGutter: "stable" as any, // ✅ 스크롤바 생겨도 레이아웃 흔들림 최소화(지원 브라우저에서)
          }}
        >
          {rows.map((row, index) => {
            const key = mode === "index-key" ? String(index) : row.id;
            return <RowItem key={key} row={row} />;
          })}
        </div>
      </div>


      <div style={{ fontSize: 12, opacity: 0.75 }}>
        실험 방법: 체크박스 몇 개 켠 다음 → insert/shuffle/remove 해보면
        <br />
        index-key 모드에서는 체크 상태가 “다른 행으로 이동”하는 걸 볼 수 있음.
      </div>
    </div>
  );
}
