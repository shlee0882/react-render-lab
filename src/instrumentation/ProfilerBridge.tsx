import { Profiler, type ReactNode, useEffect, useRef } from "react";
import { useLabStore } from "./store";
import type { ScenarioId } from "../app/routes";

type Phase = "mount" | "update";

type Pending = {
  id: string;
  phase: Phase;
  actualDuration: number;
  baseDuration: number;
  commitTime: number;
  scenarioId: ScenarioId;
};

export function ProfilerBridge({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const scenarioId = useLabStore((s) => s.scenarioId);
  const pushCommitsBatch = useLabStore((s) => s.pushCommitsBatch);

  const queueRef = useRef<Pending[]>([]);
  const scheduledRef = useRef(false);

  // flush 함수: 다음 tick에 한 번만 실행
  const scheduleFlush = () => {
    if (scheduledRef.current) return;
    scheduledRef.current = true;

    setTimeout(() => {
      scheduledRef.current = false;
      const batch = queueRef.current;
      queueRef.current = [];
      if (batch.length > 0) pushCommitsBatch(batch);
    }, 0);
  };

  // 시나리오 바뀌면 큐 비우기(옵션)
  useEffect(() => {
    queueRef.current = [];
    scheduledRef.current = false;
  }, [scenarioId]);

  return (
    <Profiler
      id={id}
      onRender={(
        profilerId,
        phase,
        actualDuration,
        baseDuration,
        _startTime,
        commitTime
      ) => {
        queueRef.current.push({
          id: profilerId,
          phase: phase as Phase,
          actualDuration,
          baseDuration,
          commitTime,
          scenarioId: scenarioId as ScenarioId,
        });

        // ✅ 여기서 store setState를 직접 호출하지 말고 flush 예약만
        scheduleFlush();
      }}
    >
      {children}
    </Profiler>
  );
}
