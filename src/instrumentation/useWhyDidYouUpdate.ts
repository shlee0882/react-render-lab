import { useEffect, useRef } from "react";
import { useLabStore, type PropChange } from "./store";
import { guessKind } from "../shared/format";

export function useWhyDidYouUpdate<T extends Record<string, unknown>>(
  name: string,
  props: T
) {
  const scenarioId = useLabStore((s) => s.scenarioId);
  const upsertWhyUpdate = useLabStore((s) => s.upsertWhyUpdate);

  const prevRef = useRef<T | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    if (!prev) {
      prevRef.current = props;
      return;
    }

    const keys = new Set([...Object.keys(prev), ...Object.keys(props)]);
    const changes: PropChange[] = [];

    keys.forEach((key) => {
      const from = prev[key];
      const to = props[key];
      if (!Object.is(from, to)) {
        changes.push({ key, from, to, kind: guessKind(to) });
      }
    });

    if (changes.length > 0) {
      upsertWhyUpdate({ name, at: Date.now(), scenarioId, changes });
    }

    prevRef.current = props;
  }, [name, props, scenarioId, upsertWhyUpdate]);
}
