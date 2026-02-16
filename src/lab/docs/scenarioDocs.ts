import type { ScenarioId } from "../../app/routes";

export type ScenarioDoc = {
  title: string;
  problem: string[];
  cause: string[];
  fix: string[];
  tips?: string[];
  checks?: string[]; 
};

export const scenarioDocs: Partial<Record<ScenarioId, ScenarioDoc>> = {
  "parent-child": {
    title: "Parent → Child rerender",
    problem: ["부모 state 변경이 자식까지 연쇄 리렌더됨", "작은 변경인데 UI 전반이 같이 흔들림"],
    cause: ["React는 기본적으로 부모가 리렌더되면 자식 함수도 다시 호출됨(전파)"],
    fix: ["리렌더 경계에 React.memo 적용", "props 참조 안정화(useMemo/useCallback)"],
    tips: ["먼저 ‘정말 비싼 컴포넌트’에만 memo를 치는 게 효율적"],
    checks: [
      "부모 버튼 클릭 → 자식 renderCount가 같이 증가하는지",
      "자식에 React.memo 적용 후 → 같은 입력에서 자식 renderCount가 줄어드는지",
    ],
  },

  memo: {
    title: "React.memo on/off",
    problem: ["props가 같아도 자식이 계속 렌더되는 것처럼 보임"],
    cause: ["memo 미적용 또는 props 참조가 매번 새로 만들어짐"],
    fix: ["React.memo로 경계", "props를 primitive/안정 참조로 전달"],
    checks: [
      "memo OFF → 동일 입력에도 Child renderCount가 계속 증가하는지",
      "memo ON → props가 안 바뀌면 Child renderCount가 고정되는지",
    ],
  },

  "memo-handler": {
    title: "memo broken by handler prop",
    problem: ["memo 걸었는데도 Child가 계속 리렌더됨"],
    cause: ["핸들러 함수가 매 렌더마다 새로 생성되어 props가 바뀜"],
    fix: ["useCallback으로 핸들러 참조 안정화", "의존성 최소화 / 이벤트 위임 고려"],
    checks: [
      "handler를 inline으로 넘길 때 → Child renderCount가 계속 증가하는지",
      "useCallback 적용 후 → 불필요 리렌더가 줄어드는지",
    ],
  },

  "context-split": {
    title: "Context: single vs split",
    problem: ["theme만 바꿔도 count만 쓰는 컴포넌트가 같이 리렌더됨"],
    cause: ["하나의 Context value 객체가 바뀌면 모든 consumer가 영향받음"],
    fix: ["Context를 목적별로 split", "consumer에 React.memo로 전파 리렌더 차단"],
    tips: ["Context는 ‘전역 구독’이라 생각하고, 바뀌는 빈도 높은 값은 분리"],
    checks: [
      "Single: toggle theme 연타 → CountOnly/HeavyList renderCount가 같이 증가하는지",
      "Split(+memo 경계): toggle theme 연타 → CountOnly/HeavyList가 고정되는지",
      "count +1 → CountOnly/HeavyList만 증가하고 theme consumer는 고정되는지",
    ],
  },

  "derived-state": {
    title: "Derived state vs computed",
    problem: ["입력 1번에 렌더가 2번 이상 발생 / 동기화 누락 버그"],
    cause: ["파생 데이터를 state로 들고 useEffect로 동기화(렌더→이펙트→setState 추가 렌더)"],
    fix: ["파생 데이터는 useMemo로 계산", "진짜 ‘사용자 입력/서버응답’만 state로 유지"],
    checks: [
      "Bad: query/minId 변경 시 renderCount가 더 빨리(두 번씩) 오르는지",
      "Good: 동일 조작에서 renderCount 증가가 상대적으로 적은지",
      "Metrics에서 Bad 쪽 actualDuration/commit이 더 뻥튀기되는지",
    ],
  },

  "key-remount": {
    title: "key change = remount (state reset)",
    problem: ["key 바꾸면 입력값/내부 state가 날아감"],
    cause: ["key 변경은 ‘리렌더’가 아니라 컴포넌트 identity 변경 → remount"],
    fix: ["불필요한 key 변경 제거", "정말 리셋이 목적일 때만 key로 remount 유도"],
    checks: [
      "rerender 모드: 값 입력 후 keySeed 변경 → 입력값 유지되는지",
      "remount 모드: keySeed 변경 → 입력값 초기화 + mountId 변경되는지",
    ],
  },

  "list-index-key": {
    title: "List: index key bug (state jumps)",
    problem: ["체크/입력 state가 다른 행으로 점프"],
    cause: ["index key는 삽입/정렬/삭제 시 identity가 뒤섞임"],
    fix: ["항상 안정적인 고유 id를 key로 사용"],
    checks: [
      "index-key: 체크 몇 개 켠 뒤 insert/shuffle/remove → 체크가 다른 행으로 튀는지",
      "id-key: 동일 조작 → 체크가 원래 id에 고정되는지",
    ],
  },

  "strict-mode": {
    title: "StrictMode: dev double-invoke",
    problem: ["dev에서 effect가 두 번 실행되는 것처럼 보임"],
    cause: ["StrictMode가 부작용 탐지 위해 effect/cleanup을 추가로 실행(dev only)"],
    fix: ["effect는 중복 실행되어도 안전(idempotent)하게", "구독/타이머/요청은 cleanup/abort 필수"],
    tips: ["prod 빌드에서는 동작이 달라질 수 있음(실험으로 구분)"],
    checks: [
      "StrictMode=true: show child true → 콘솔에 RUN/CLEANUP/RUN 패턴이 보이는지",
      "show child false → CLEANUP 1줄만 찍히는지",
      "StrictMode=false로 비교했을 때 로그 패턴이 단순해지는지",
    ],
  },

  "effect-deps": {
    title: "useEffect deps: missing vs loop vs fix",
    problem: ["deps 누락 → stale", "deps 잘못 → 루프/중복 실행"],
    cause: ["의존성 모델을 틀리게 잡으면 effect가 안 돌거나 너무 돈다"],
    fix: ["deps 정확히", "최신 요청만 반영(토큰/AbortController)", "가능하면 effect 대신 computed/useMemo로 제거"],
    checks: [
      "MissingDeps: query 변경해도 result가 갱신 안 되는지(버그 재현)",
      "Loop demo: enabled 켜면 n이 cap까지 빠르게 올라가는지",
      "Fixed: 빠르게 타이핑해도 마지막 query 결과만 반영되는지",
    ],
  },

  concurrent: {
    title: "Concurrent: startTransition & deferred",
    problem: ["타이핑이 끊김(입력과 heavy 렌더가 같은 우선순위)"],
    cause: ["입력 업데이트와 무거운 렌더가 동기적으로 붙어있음"],
    fix: ["startTransition으로 heavy 업데이트를 낮은 우선순위로", "useDeferredValue로 heavy가 지연된 값 사용"],
    tips: ["사용자 입력/스크롤 같은 상호작용은 high priority로 분리"],
    checks: [
      "size를 크게 올린 뒤 빠르게 입력",
      "Blocking: 입력이 끊기거나 밀리는 체감이 있는지",
      "Transition: pending=true가 뜨고 입력은 상대적으로 부드러운지",
      "Deferred: text와 deferredText가 잠깐 달라지고 heavy가 늦게 따라오는지",
    ],
  },
};
