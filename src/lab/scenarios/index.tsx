import { ScenarioParentChild } from "./scenario_parent_child";
import { ScenarioMemo } from "./scenario_memo";
import { ScenarioMemoHandler } from "./scenario_memo_handler";
import { ScenarioContextSplit } from "./scenario_context_split";
import { ScenarioDerivedState } from "./scenario_derived_state";
import { ScenarioKeyRemount } from "./scenario_key_remount";
import { ScenarioListIndexKey } from "./scenario_list_index_key";
import { ScenarioStrictMode } from "./scenario_strict_mode";
import { ScenarioEffectDeps } from "./scenario_effect_deps";
import { ScenarioConcurrent } from "./scenario_concurrent";
import { ScenarioHelpCard } from "../ui/ScenarioHelpCard";

export function ScenarioRenderer({ id }: { id: string }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ScenarioHelpCard />
      {(() => {
        switch (id) {
          case "context-split":
            return <ScenarioContextSplit />;
          case "memo-handler":
            return <ScenarioMemoHandler />;
          case "memo":
            return <ScenarioMemo />;
          case "derived-state":
            return <ScenarioDerivedState />;
          case "key-remount":
            return <ScenarioKeyRemount />;  
          case "list-index-key":
            return <ScenarioListIndexKey />;
          case "strict-mode":
            return <ScenarioStrictMode />;
          case "effect-deps":
            return <ScenarioEffectDeps />;
          case "concurrent":
            return <ScenarioConcurrent />;
          case "parent-child":
          default:
            return <ScenarioParentChild />;
        }
      })()}
    </div>
  );


}
