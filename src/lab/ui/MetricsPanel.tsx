import { useMemo } from "react";
import { useLabStore } from "../../instrumentation/store";
import { formatValue } from "../../shared/format";

export function MetricsPanel() {
  const scenarioId = useLabStore((s) => s.scenarioId);
  const renders = useLabStore((s) => s.renders);
  const commits = useLabStore((s) => s.commits);
  const whyUpdates = useLabStore((s) => s.whyUpdates); // ✅ Record

  const stats = useMemo(() => {
    const r = renders.filter((x) => x.scenarioId === scenarioId);
    const c = commits.filter((x) => x.scenarioId === scenarioId);

    const byComp = new Map<string, number>();
    for (const e of r) byComp.set(e.name, e.count);

    const totalCommits = c.length;
    const totalActual = c.reduce((acc, x) => acc + x.actualDuration, 0);

    // ✅ Record -> list
    const wList = Object.values(whyUpdates).filter((x) => x.scenarioId === scenarioId);
    wList.sort((a, b) => b.at - a.at);

    return { byComp: [...byComp.entries()], totalCommits, totalActual, wList };
  }, [renders, commits, whyUpdates, scenarioId]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <h3>Metrics</h3>
      <div>Scenario: {scenarioId}</div>

      <div style={{ padding: 10, border: "1px solid #ddd" }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Render counts</div>
        {stats.byComp.length === 0 ? (
          <div style={{ opacity: 0.6 }}>No data yet</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {stats.byComp.map(([name, count]) => (
              <li key={name}>
                {name}: {count}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ padding: 10, border: "1px solid #ddd" }}>
        <div>Commits: {stats.totalCommits}</div>
        <div>Total actualDuration(ms): {stats.totalActual.toFixed(2)}</div>
      </div>

      <div style={{ padding: 10, border: "1px solid #ddd" }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Why did it update?</div>

        {stats.wList.length === 0 ? (
          <div style={{ opacity: 0.6 }}>No prop changes recorded</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {stats.wList.map((ev) => (
              <div
                key={`${ev.scenarioId}::${ev.name}`}
                style={{ border: "1px solid #eee", padding: 8, borderRadius: 6 }}
              >
                <div style={{ fontWeight: 600 }}>{ev.name}</div>
                <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                  {ev.changes.map((ch) => (
                    <li key={ch.key}>
                      <span style={{ fontWeight: 600 }}>{ch.key}</span>{" "}
                      <span style={{ opacity: 0.75 }}>({ch.kind})</span>
                      <div style={{ opacity: 0.85 }}>
                        {formatValue(ch.from)} → {formatValue(ch.to)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
