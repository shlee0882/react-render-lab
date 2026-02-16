import React, { createContext, useContext, useMemo, useState } from "react";
import { useRenderCount } from "../../instrumentation/useRenderCount";
import { useWhyDidYouUpdate } from "../../instrumentation/useWhyDidYouUpdate";
import { HeavyList } from "../ui/HeavyList";

/** -----------------------------
 *  Single Context (bad pattern)
 *  ----------------------------- */
type AppCtxValue = {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  theme: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
};

const AppContext = createContext<AppCtxValue | null>(null);

function useAppContext() {
  const v = useContext(AppContext);
  if (!v) throw new Error("AppContext not provided");
  return v;
}

function Single_CountOnlyConsumer({ size }: { size: number }) {
  const rc = useRenderCount("Single_CountOnlyConsumer");
  const { count } = useAppContext();

  useWhyDidYouUpdate("Single_CountOnlyConsumer", { count, size });

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ padding: 8, border: "1px solid #ddd" }}>
        <div>renderCount: {rc}</div>
        <div>count: {count}</div>
      </div>
      <HeavyList label="Single_HeavyList" size={size} salt={count} recomputeEveryRender />
    </div>
  );
}


function Single_ThemeOnlyConsumer() {
  const rc = useRenderCount("Single_ThemeOnlyConsumer");
  const { theme } = useAppContext();

  useWhyDidYouUpdate("Single_ThemeOnlyConsumer", { theme });

  return (
    <div style={{ padding: 8, border: "1px solid #ddd" }}>
      <div>renderCount: {rc}</div>
      <div>theme: {theme}</div>
    </div>
  );
}

function SingleProviderBlock() {
  const rc = useRenderCount("SingleProviderBlock");

  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [size, setSize] = useState(500);

  const value: AppCtxValue = { count, setCount, theme, setTheme };

  return (
    <div style={{ display: "grid", gap: 8, padding: 10, border: "1px solid #bbb" }}>
      <h4>Single Context</h4>
      <div style={{ opacity: 0.8 }}>Provider renderCount: {rc}</div>

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontSize: 12, opacity: 0.8 }}>
          HeavyList size: {size}
        </label>
        <input
          type="range"
          min={200}
          max={1000}
          step={50}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setCount((v) => v + 1)}>count +1</button>
        <button onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
          toggle theme
        </button>
      </div>

      <AppContext.Provider value={value}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Single_CountOnlyConsumer size={size} />
          <Single_ThemeOnlyConsumer />
        </div>
      </AppContext.Provider>

      <div style={{ fontSize: 12, opacity: 0.7 }}>
        기대: theme만 바꿔도 CountOnlyConsumer + HeavyList까지 같이 리렌더/커밋 비용 발생
      </div>
    </div>
  );
}


/** -----------------------------
 *  Split Context (good pattern)
 *  ----------------------------- */
type CountCtxValue = {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
};
type ThemeCtxValue = {
  theme: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
};

const CountContext = createContext<CountCtxValue | null>(null);
const ThemeContext = createContext<ThemeCtxValue | null>(null);

function useCountContext() {
  const v = useContext(CountContext);
  if (!v) throw new Error("CountContext not provided");
  return v;
}
function useThemeContext() {
  const v = useContext(ThemeContext);
  if (!v) throw new Error("ThemeContext not provided");
  return v;
}

const Split_CountOnlyConsumer = React.memo(function Split_CountOnlyConsumer({
  size,
}: {
  size: number;
}) {
  const rc = useRenderCount("Split_CountOnlyConsumer");
  const { count } = useCountContext();

  useWhyDidYouUpdate("Split_CountOnlyConsumer", { count, size });

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ padding: 8, border: "1px solid #ddd" }}>
        <div>renderCount: {rc}</div>
        <div>count: {count}</div>
      </div>

      <HeavyList label="Split_HeavyList" size={size} salt={count} />
    </div>
  );
});


const Split_ThemeOnlyConsumer = React.memo(function Split_ThemeOnlyConsumer() {
  const rc = useRenderCount("Split_ThemeOnlyConsumer");
  const { theme } = useThemeContext();

  useWhyDidYouUpdate("Split_ThemeOnlyConsumer", { theme });

  return (
    <div style={{ padding: 8, border: "1px solid #ddd" }}>
      <div>renderCount: {rc}</div>
      <div>theme: {theme}</div>
    </div>
  );
});


function SplitProviderBlock() {
  const rc = useRenderCount("SplitProviderBlock");

  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [size, setSize] = useState(500);

  const countValue = useMemo(() => ({ count, setCount }), [count]);
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <div style={{ display: "grid", gap: 8, padding: 10, border: "1px solid #bbb" }}>
      <h4>Split Context</h4>
      <div style={{ opacity: 0.8 }}>Provider renderCount: {rc}</div>

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontSize: 12, opacity: 0.8 }}>
          HeavyList size: {size}
        </label>
        <input
          type="range"
          min={200}
          max={1000}
          step={50}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setCount((v) => v + 1)}>count +1</button>
        <button onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
          toggle theme
        </button>
      </div>

      <CountContext.Provider value={countValue}>
        <ThemeContext.Provider value={themeValue}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Split_CountOnlyConsumer size={size} />
            <Split_ThemeOnlyConsumer />
          </div>
        </ThemeContext.Provider>
      </CountContext.Provider>

      <div style={{ fontSize: 12, opacity: 0.7 }}>
        기대: theme만 바꿀 때 CountOnlyConsumer + HeavyList는 거의 안 움직이고, 커밋 비용이 줄어듦
      </div>
    </div>
  );
}


/** -----------------------------
 *  Scenario root
 *  ----------------------------- */
export function ScenarioContextSplit() {
  const rc = useRenderCount("ScenarioContextSplit");

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>Context: single vs split</h3>
      <div style={{ opacity: 0.8 }}>Scenario renderCount: {rc}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <SingleProviderBlock />
        <SplitProviderBlock />
      </div>
    </div>
  );
}
