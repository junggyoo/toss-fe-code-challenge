## ATDD 기반 단계별 구현 계획 (plan.md)

### 0. 전제

- 기준 문서: `spec.md`
- 테스트 우선(ATDD): 승인 테스트(E2E) 작성 → 최소 구현 → 리팩터

### 1. 승인 테스트 정렬

- E2E(`e2e/modal-form.spec.ts`) 시나리오를 `spec.md` 수용 기준과 1:1 매핑
- 실패하는 테스트를 빨갛게 유지한 채로 구현 시작

### 2. 모달 셸 구현

- Radix Dialog 셸 생성: `role=dialog`, `aria-modal`, `aria-labelledby`, `aria-describedby`
- 포털/오버레이/콘텐츠/타이틀/설명/푸터(취소/제출)
- 열림 시 타이틀로 포커스 이동, 닫힘 시 트리거 복귀
- 오버레이 클릭/ESC 닫기, 배경 스크롤 잠금
- `prefers-reduced-motion` 고려한 전이 클래스 작성

### 3. 선언적 API

- `openFormModal(options?): Promise<FormValues|null>` 구현
- 단일 인스턴스 가드(열려 있으면 무시)
- resolve: 제출 시 `FormValues`, 취소/닫기 시 `null`

### 4. 폼/검증

- react-hook-form + zod 스키마
- 필수: `name`, `email`, `experienceYears` / 선택: `githubUrl`
- 이메일 간단 패턴, githubUrl 간단 URL 패턴
- 에러 메시지 DOM+`role=alert` 발표, 첫 오류 포커스

### 5. 접근성/키보드 UX

- Tab/Shift+Tab 포커스 트랩(Radix + 내부 포커스 순서 점검)
- 레이블 연결, `aria-invalid`, `aria-describedby`(오류 텍스트)

### 6. 스타일/블루 톤 적용

- Tailwind 토큰 반영: 버튼, 오버레이, 카드, 폰트/간격

### 7. 테스트 보완

- E2E: axe 위반 0 확인, 긴 콘텐츠 내부 스크롤, 스크롤 잠금 확인
- 유닛/통합: zod 스키마, 포커스 복귀 유틸 등 빠른 검증 포인트 보강

### 8. 리팩터/정리

- 불변 규칙 준수, 함수/컴포넌트 분리, 네이밍 정리
- 문서 갱신(README 사용 가이드)

### 스크립트

- `npm run e2e` / `npm run test`

### 산출물

- 구현 소스 + 통과하는 테스트 + 간단 데모 페이지 업데이트
