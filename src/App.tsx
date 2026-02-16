import { ScenarioList } from "./lab/ui/ScenarioList";
import { MetricsPanel } from "./lab/ui/MetricsPanel";
import { ScenarioRenderer } from "./lab/scenarios";
import { useLabStore } from "./instrumentation/store";
import { ProfilerBridge } from "./instrumentation/ProfilerBridge";

export default function App() {
  const scenarioId = useLabStore((s) => s.scenarioId);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr 320px",
        alignItems: "start",
        minHeight: "100vh",
        gap: 12,
        padding: 12,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Apple SD Gothic Neo", "Noto Sans KR"',
      }}
    >
      <div style={{ minWidth: 0, overflow: "hidden" }}>
        <ScenarioList />
      </div>

      <div style={{ padding: 12, border: "1px solid #ddd" }}>
        <ProfilerBridge id={`scenario:${scenarioId}`}>
          <ScenarioRenderer id={scenarioId} />
        </ProfilerBridge>
      </div>

      <div style={{ minWidth: 0 }}>
        <MetricsPanel />
      </div>
    </div>
  );
}
