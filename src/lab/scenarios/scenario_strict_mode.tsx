import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { useRenderCount } from "../../instrumentation/useRenderCount";

function Demo({ label }: { label: string }) {
  const rc = useRenderCount(label);

  const mountId = useMemo(() => Math.random().toString(16).slice(2, 10), []);
  const effectRuns = useRef(0);

  useEffect(() => {
    effectRuns.current += 1;
    // eslint-disable-next-line no-console
    console.log(`[EFFECT RUN] ${label} mountId=${mountId} runs=${effectRuns.current}`);

    return () => {
      // eslint-disable-next-line no-console
      console.log(`[EFFECT CLEANUP] ${label} mountId=${mountId}`);
    };
    // mountId는 useMemo([])로 고정이라 deps 넣어도 됨
  }, [label, mountId]);

  return (
    <div style={{ padding: 10, border: "1px solid #ddd", display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ opacity: 0.8 }}>renderCount: {rc}</div>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        mountId: <b>{mountId}</b>
      </div>
      <div style={{ fontSize: 12, opacity: 0.75 }}>
        effectRuns(ref): <b>{effectRuns.current}</b> (콘솔 로그가 더 정확)
      </div>

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        체크: StrictMode(on)일 때 dev에서 effect/cleanup이 추가로 찍히는지 확인
      </div>
    </div>
  );
}

export function ScenarioStrictMode() {
  const rc = useRenderCount("ScenarioStrictMode");
  const [strict, setStrict] = useState(true);
  const [show, setShow] = useState(true);

  const content = (
    <div style={{ display: "grid", gap: 8 }}>
      {show ? <Demo label="StrictDemoChild" /> : <div>(child hidden)</div>}
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <h3>StrictMode: dev double-invoke</h3>
      <div style={{ opacity: 0.8 }}>Scenario renderCount: {rc}</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setStrict((v) => !v)}>
          StrictMode: {String(strict)} (toggle)
        </button>
        <button onClick={() => setShow((v) => !v)}>
          show child: {String(show)} (toggle)
        </button>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        설명:
        <br />- 개발 모드 + StrictMode에서는 React가 일부 생명주기/effect를 “의도적으로”
        한 번 더 실행해 부작용을 잡아냄.
        <br />- production build에서는 이 동작이 없어짐.
        <br />- 확인은 화면보다 <b>콘솔 로그</b>가 확실함.
      </div>

      <div style={{ border: "1px solid #bbb", padding: 10 }}>
        {strict ? <StrictMode>{content}</StrictMode> : content}
      </div>
    </div>
  );
}
