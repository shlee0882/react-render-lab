import { create } from "zustand";
import type { ScenarioId } from "../app/routes";

type RenderEvent = {
  name: string;
  count: number;
  at: number;
  scenarioId: ScenarioId;
};

type ProfilerEvent = {
  id: string;
  phase: "mount" | "update";
  actualDuration: number;
  baseDuration: number;
  commitTime: number;
  scenarioId: ScenarioId;
};

export type PropChange = {
  key: string;
  from: unknown;
  to: unknown;
  kind: "value" | "function" | "object";
};

type WhyUpdateEvent = {
  name: string;
  at: number;
  scenarioId: ScenarioId;
  changes: PropChange[];
};

type LabState = {
  scenarioId: ScenarioId;
  setScenarioId: (id: ScenarioId) => void;

  renders: RenderEvent[];
  pushRender: (e: RenderEvent) => void;

  commits: ProfilerEvent[];
  pushCommit: (e: ProfilerEvent) => void;
  pushCommitsBatch: (events: ProfilerEvent[]) => void;

  // ✅ 변경: 배열 -> Record (최신 1개 덮어쓰기)
  whyUpdates: Record<string, WhyUpdateEvent>;
  upsertWhyUpdate: (e: WhyUpdateEvent) => void;

  resetMetrics: () => void;
};

export const useLabStore = create<LabState>((set) => ({
  scenarioId: "parent-child",
  setScenarioId: (id) => set({ scenarioId: id }),

  renders: [],
  pushRender: (e) => set((s) => ({ renders: [...s.renders, e] })),

  commits: [],
  pushCommit: (e) => set((s) => ({ commits: [...s.commits, e] })),
  pushCommitsBatch: (events) =>
    set((s) => {
      const next = [...s.commits, ...events];
      const capped = next.length > 500 ? next.slice(next.length - 500) : next;
      return { commits: capped };
    }),
  whyUpdates: {},
  upsertWhyUpdate: (e) =>
    set((s) => ({
      whyUpdates: {
        ...s.whyUpdates,
        [`${e.scenarioId}::${e.name}`]: e,
      },
    })),

  resetMetrics: () => set({ renders: [], commits: [], whyUpdates: {} }),
}));
