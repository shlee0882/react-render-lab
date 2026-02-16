import { scenarios, type ScenarioId } from "../../app/routes";
import { useLabStore } from "../../instrumentation/store";

export function ScenarioList() {
  const scenarioId = useLabStore((s) => s.scenarioId);
  const setScenarioId = useLabStore((s) => s.setScenarioId);
  const resetMetrics = useLabStore((s) => s.resetMetrics);

  const buttonStyle: React.CSSProperties = {
    textAlign: "left",
    padding: 10,
    border: "1px solid #ddd",
    cursor: "pointer",
    width: "100%",
    minWidth: 140,
    minHeight: 40,
    boxSizing: "border-box",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    outline: "none",
  };

  return (
    <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr", minWidth: 0, width: "100%", maxWidth: "100%", overflow: "hidden", margin: 0, padding: 0 }}>
      <h3 style={{ margin: "0 0 8px 0", padding: 0, fontSize: "1rem", fontWeight: 600 }}>Scenarios</h3>
      {scenarios.map((s) => (
        <button
          key={s.id}
          onClick={() => {
            resetMetrics();
            setScenarioId(s.id as ScenarioId);
          }}
          style={{
            ...buttonStyle,
            background: s.id === scenarioId ? "#f5f5f5" : "white",
          }}
        >
          {s.title}
        </button>
      ))}
      <button onClick={resetMetrics} style={buttonStyle}>
        Reset metrics
      </button>
    </div>
  );
}
