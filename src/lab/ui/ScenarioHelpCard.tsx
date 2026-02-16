import { useMemo } from "react";
import { useLabStore } from "../../instrumentation/store";
import { scenarioDocs } from "../docs/scenarioDocs";

function Bullets({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}

export function ScenarioHelpCard() {
  const scenarioId = useLabStore((s) => s.scenarioId);
  const doc = useMemo(() => scenarioDocs[scenarioId], [scenarioId]);

  if (!doc) return null;

  return (
    <div
      style={{
        border: "1px solid #bbb",
        padding: 12,
        borderRadius: 8,
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 700 }}>{doc.title}</div>

      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 600 }}>문제</div>
        <Bullets items={doc.problem} />
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 600 }}>원인</div>
        <Bullets items={doc.cause} />
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 600 }}>해결</div>
        <Bullets items={doc.fix} />
      </div>

      {doc.tips?.length ? (
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 600 }}>실무 팁</div>
          <Bullets items={doc.tips} />
        </div>
      ) : null}

      {doc.checks?.length ? (
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 600 }}>실험 포인트</div>
          <Bullets items={doc.checks} />
        </div>
      ) : null}

    </div>
  );
}
