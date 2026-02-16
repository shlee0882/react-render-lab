# React Render Lab

React 렌더링 동작을 재현하고 수치로 측정하는 실험 프로젝트

- 렌더 전파(Parent → Child)
- React.memo 경계
- Context 리렌더 구조 (Single vs Split)
- useEffect 의존성 문제
- key와 컴포넌트 identity
- StrictMode의 개발 모드 이중 실행
- Concurrent Rendering (startTransition / useDeferredValue)
- React Profiler 기반 렌더 비용 측정

---

## 🎯 프로젝트 목적

React 렌더링을 이해하고 증명하는 프로젝트 

각 시나리오는 다음 구조로 구성되어 있습니다:

1. 실제로 발생하는 문제를 재현
2. 왜 발생하는지 설명
3. 해결 방법 제시
4. 렌더 횟수 및 커밋 시간으로 수치 비교

---

## 🧪 시나리오 목록

### 1. Parent → Child 리렌더 전파
부모 state 변경이 자식까지 전파되는 기본 동작을 재현함.

### 2. React.memo On / Off
props가 동일할 때 memo가 리렌더를 차단하는지 확인함.

### 3. Handler로 인해 깨지는 memo
inline 함수가 memo를 무력화하는 이유를 재현함.

### 4. Context: Single vs Split
하나의 Context가 전체 Consumer를 리렌더시키는 문제를 재현하고  
Context 분리를 통해 전파 범위를 줄이는 방법을 확인함.

### 5. Derived State vs Computed
useEffect로 파생 상태를 동기화할 때 발생하는 이중 렌더 문제를 재현함.

### 6. Key = Identity
key 변경이 리렌더가 아니라 '리마운트'임을 확인함.

### 7. Index Key 버그
배열 index를 key로 사용할 때 state가 다른 행으로 이동하는 문제를 재현함.

### 8. StrictMode (개발 모드 이중 실행)
개발 환경에서 effect가 두 번 실행되는 이유를 설명함.

### 9. useEffect 의존성 문제
- 의존성 누락 (stale 문제)
- 잘못된 의존성 (루프)
- 올바른 패턴

### 10. Concurrent Rendering
다음 세 가지를 비교함:

- Blocking 업데이트
- startTransition
- useDeferredValue

React가 사용자 입력과 무거운 렌더를 어떻게 우선순위로 처리하는지 확인함.

---

## 📊 측정 방법

이 프로젝트는 렌더 계측 레이어를 포함합니다:

- `useRenderCount()`로 렌더 횟수 추적
- React Profiler API로 커밋 시간 측정
- Metrics 패널에서 통계 집계

다음 항목을 직접 확인할 수 있습니다:

- 컴포넌트별 렌더 횟수 차이
- 총 커밋 시간
- 성능 스파이크 구간

---

## 🚀 기술 스택

- React 18
- TypeScript
- Vite
- Zustand (계측 스토어)
- React Profiler API

---

## 🏗 실행 방법

```bash
npm install
npm run dev
```

