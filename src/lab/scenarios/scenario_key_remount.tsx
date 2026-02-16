import { useEffect, useMemo, useState } from "react";
import { useRenderCount } from "../../instrumentation/useRenderCount";

function MountTracker({ label }: { label: string }) {
  const rc = useRenderCount(label);

  const mountId = useMemo(() => {
    // 컴포넌트가 "처음 생성"될 때만 만들어짐 (remount면 새로 생성)
    return Math.random().toString(16).slice(2, 10);
  }, []);

  const [text, setText] = useState("");

  useEffect(() => {
    // mount/unmount 확인용
    // eslint-disable-next-line no-console
    console.log(`[MOUNT] ${label} mountId=${mountId}`);
    return () => {
      // eslint-disable-next-line no-console
      console.log(`[UNMOUNT] ${label} mountId=${mountId}`);
    };
  }, [label, mountId]);

  return (
    <div style={{ padding: 10, border: "1px solid #ddd", display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ opacity: 0.8 }}>renderCount: {rc}</div>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        mountId(재생성되면 바뀜): <b>{mountId}</b>
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="여기에 입력해봐 (key 바꾸면 날아가야 정상)"
        style={{ padding: 8, border: "1px solid #ccc" }}
      />

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        internal state(text): <b>{text || "(empty)"}</b>
      </div>
    </div>
  );
}

export function ScenarioKeyRemount() {
  const rc = useRenderCount("ScenarioKeyRemount");

  const [mode, setMode] = useState<"rerender" | "remount">("rerender");
  const [keySeed, setKeySeed] = useState(0);

  // 1) rerender 모드: key 고정 → state 유지
  const stableKey = "stable";

  // 2) remount 모드: key 변경 → 컴포넌트가 언마운트 후 새로 마운트(state 리셋)
  const changingKey = `seed:${keySeed}`;

  const keyToUse = mode === "rerender" ? stableKey : changingKey;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <h3>key change = remount (state reset)</h3>
      <div style={{ opacity: 0.8 }}>Scenario renderCount: {rc}</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setMode((m) => (m === "rerender" ? "remount" : "rerender"))}>
          mode: {mode} (click to toggle)
        </button>

        <button onClick={() => setKeySeed((v) => v + 1)}>
          bump keySeed (+1)
        </button>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        현재 key: <b>{keyToUse}</b>
        <br />
        - rerender 모드: key 고정 → 입력값(text) 유지되어야 정상
        <br />
        - remount 모드: key 변경 → 입력값(text) 초기화되는 게 정상
      </div>

      <MountTracker key={keyToUse} label="ChildWithKey" />
    </div>
  );
}
