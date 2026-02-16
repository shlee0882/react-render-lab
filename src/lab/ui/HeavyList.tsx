import { memo, useMemo } from "react";
import { useRenderCount } from "../../instrumentation/useRenderCount";
import { useWhyDidYouUpdate } from "../../instrumentation/useWhyDidYouUpdate";

function heavyCompute(seed: number) {
  // 너무 과하면 브라우저 죽음. 적당히 CPU 태우는 용도.
  let x = seed;
  for (let i = 0; i < 200; i++) {
    x = (x * 1664525 + 1013904223) % 4294967296;
  }
  return x;
}

type HeavyListProps = {
  label: string;
  size: number;      // 200 ~ 1000
  salt: number;      // 바뀌면(=리렌더되면) 계산 다시 느낌이 생김
  recomputeEveryRender?: boolean;
};

function HeavyListBase({ label, size, salt, recomputeEveryRender }: HeavyListProps) {
  const rc = useRenderCount(label);
  useWhyDidYouUpdate(label, { size, salt });

  // 리스트 데이터 생성(리렌더될 때만 다시 만들어짐)
  const rows = recomputeEveryRender
    ? (() => {
        const arr = new Array(size);
        for (let i = 0; i < size; i++) arr[i] = heavyCompute(i + salt);
        return arr;
      })()
    : useMemo(() => {
        const arr = new Array(size);
        for (let i = 0; i < size; i++) arr[i] = heavyCompute(i + salt);
        return arr;
      }, [size, salt]);



  return (
    <div style={{ padding: 8, border: "1px solid #ddd" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ opacity: 0.8 }}>renderCount: {rc}</div>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
        size: {size}, salt: {salt}
      </div>

      {/* 실제 DOM도 좀 만들기 (너무 크면 느려지니 최소 표시) */}
      <div style={{ marginTop: 6, maxHeight: 120, overflow: "auto" }}>
        {rows.slice(0, Math.min(rows.length, 200)).map((v, idx) => (
          <div key={idx} style={{ fontFamily: "monospace", fontSize: 12 }}>
            {idx.toString().padStart(4, "0")} : {v}
          </div>
        ))}
        {rows.length > 200 && (
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            ... {rows.length - 200} more rows not rendered (to avoid DOM 폭발)
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ memo로 감싸서 "props가 안 바뀌면" 진짜로 막히게 해둠
export const HeavyList = HeavyListBase;
