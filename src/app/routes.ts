export type ScenarioId =
  | "memo"
  | "parent-child"
  | "memo-handler"
  | "context-split"
  | "derived-state"
  | "key-remount"
  | "list-index-key"
  | "strict-mode"
  | "effect-deps"
  | "concurrent";

export const scenarios = [
  { id: "parent-child" as const, title: "Parent → Child rerender" },
  { id: "memo" as const, title: "React.memo on/off" },
  { id: "memo-handler" as const, title: "memo broken by handler prop" },
  { id: "context-split" as const, title: "Context: single vs split" },
  { id: "derived-state" as const, title: "Derived state vs computed" },
  { id: "key-remount" as const, title: "key change = remount (state reset)" },
  { id: "list-index-key" as const, title: "List: index key bug (state jumps)" },
  { id: "strict-mode" as const, title: "StrictMode: dev double-invoke" },
  { id: "effect-deps" as const, title: "useEffect deps: missing vs loop vs fix" },
  { id: "concurrent" as const, title: "Concurrent: startTransition & deferred" },
];
