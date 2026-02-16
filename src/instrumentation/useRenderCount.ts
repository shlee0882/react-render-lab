import { useEffect, useRef } from "react";
import { useLabStore } from "./store";

export function useRenderCount(name: string) {
  const scenarioId = useLabStore((s) => s.scenarioId);
  const pushRender = useLabStore((s) => s.pushRender);

  const countRef = useRef(0);
  countRef.current += 1;

  const count = countRef.current;

  // ✅ 커밋 이후에만 store 업데이트
  useEffect(() => {
    pushRender({
      name,
      count,
      at: Date.now(),
      scenarioId,
    });
  }, [pushRender, scenarioId, name, count]);

  return count;
}
