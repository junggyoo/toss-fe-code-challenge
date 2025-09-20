## 제품 개요

웹 접근성 원칙을 준수하는 신청 폼 모달을 제공한다. 키보드 전용 사용자와 스크린리더 사용자를 포함한 모든 사용자가 모달을 열고, 내용을 읽고, 필수 필드를 작성·제출하거나 취소할 수 있어야 한다. 또한 선언적 API로 모달을 함수 호출만으로 열고 결과를 수신할 수 있어야 한다.

## 결정 사항(사용자 확인 반영)

- **필수 필드**: 이름/닉네임, 이메일, FE 경력 연차
- **선택 필드**: GitHub 링크
- **이메일 검증 강도**: 간단 패턴(현실적이며 과도한 거짓 음성/양성 최소화)
- **닫기 컨트롤**: 텍스트 버튼 우선(푸터의 "취소" 버튼), 헤더 X 버튼은 기본 비표시
- **오류 요약**: 상단 글로벌 오류 요약은 생략(필드 단위 오류만 표시/발표)
- **디자인 톤앤매너**: 이미지와 유사한 블루 톤
- **동시 호출 정책**: 모달 열림 중 재호출은 무시

## 기술 스택(현재 package.json 기준)

- **Runtime/UI**: React ^19, React DOM ^19
- **빌드/개발**: Vite ^7, @vitejs/plugin-react ^5, TypeScript ~5.8
- **스타일**: TailwindCSS ^4 + @tailwindcss/vite, tailwind-merge ^3, class-variance-authority ^0.7, clsx ^2, modern-normalize ^3
- **접근성/UI 프리미티브**: @radix-ui/react-dialog, @radix-ui/react-label, @radix-ui/react-slot, @radix-ui/react-visually-hidden
- **폼/검증**: react-hook-form ^7, zod ^4, @hookform/resolvers ^5
- **아이콘**: lucide-react
- **오버레이 유틸(보유)**: overlay-kit (기본 구현에선 사용하지 않음)
- **애니메이션(선택)**: tw-animate-css (Tailwind 트랜지션/키프레임으로 대체 가능)

> 원칙: 현재 패키지만 사용해 구현한다. 추가 라이브러리가 필요하면 사전 질의 후 합의하여 추가한다.

## 패키지 사용 계획

- **모달/포커스 트랩/포털**: Radix Dialog를 기본 사용(ESC/오버레이 닫기, 포커스 트랩, aria 연결). overlay-kit은 사용하지 않음.
- **폼 상태/검증**: react-hook-form + zod 스키마, @hookform/resolvers로 연결. 오류는 `role="alert"`/`aria-live="assertive"`로 발표.
- **스타일/테마**: Tailwind 유틸리티와 지정 블루 톤 토큰 사용. `tailwind-merge`, `clsx`, `cva`로 변형/상태 클래스 관리.
- **아이콘**: 필요 시 lucide-react(예: 입력 필드 보조), 기본 닫기 아이콘은 비표시.
- **모션**: Tailwind transition/transform 사용. `prefers-reduced-motion` 고려. tw-animate-css는 선택적.

## 목표

- 접근성 표준에 따른 모달 다이얼로그 동작 보장 (ARIA, 포커스 트랩, ESC/오버레이 닫기)
- 키보드만으로 폼 입력 및 제출 가능
- 검증 실패 시 즉시 인지 가능한 오류 전달 (시각·청각 보조 기술)
- 배경 스크롤 잠금, 내부 스크롤 처리 등 기본 UX 제공
- 선언적 API `openFormModal()` 제공: 제출 시 값 반환, 취소 시 `null`

## 비범위(Non-Goals)

- 서버 통신(실제 제출) 구현은 범위 밖이며, 프론트 단 검증 및 반환까지만 포함
- 복수 모달 동시 노출은 지원하지 않음 (중첩 모달 미지원)

## 주요 사용자 시나리오

- 사용자는 트리거 버튼을 눌러 모달을 연다 → 제목으로 포커스 이동 → 안내 문구 확인 → 키보드로 필수/선택 필드 입력 → 제출 → 성공 시 모달 닫힘과 함께 결과를 수신
- 검증 실패 시 오류가 시각적으로 표시되며 스크린리더에 즉시 공지 → 오류 필드로 포커스 이동 또는 명확한 내비게이션 제공
- 언제든 ESC 또는 오버레이 클릭이나 푸터 "취소"로 취소 가능 → 트리거로 포커스 복귀

## 기능 요구사항

### 모달 열림/닫힘

- ESC 키 입력 시 닫힘
- 오버레이(바깥 영역) 클릭 시 닫힘
- 푸터의 텍스트 버튼 "취소"로 닫힘(기본)
- 닫힐 때 마지막 포커스 트리거로 포커스 복귀

### 포커스 흐름 및 트랩

- 모달이 열릴 때 모달 제목 요소로 포커스 이동
- Tab으로 다음, Shift+Tab으로 이전 요소 이동
- 포커스는 모달 내부에서만 순환(포커스 트랩)
- 닫힐 때 원래 트리거(열기 버튼 등)로 포커스 복귀

### 폼 사용성/검증

- 키보드만으로 모든 입력/제출 가능 (Enter로 제출)
- 필수 필드 3종(이름/닉네임, 이메일, FE 경력 연차) 검증
- 검증 실패 시:
  - 해당 필드 하단에 오류 텍스트 표시
  - 오류 컨테이너를 `role="alert"` 또는 `aria-live="assertive"`로 즉시 발표
  - 오류가 있는 첫 필드로 포커스 이동
- 상단 글로벌 오류 요약은 사용하지 않음(문서 밀림/중복 발표 방지)

### UI/UX 동작

- 모달 열림 동안 문서(body) 스크롤 잠금
- 모달 콘텐츠가 길어지면 내부 스크롤 허용 (헤더/푸터 고정 가능)
- 오버레이 배경은 반투명 처리, 클릭 시 닫힘
- 반응형 레이아웃(모바일 우선), 작은 화면에서 전폭/전고에 가깝게 배치

### 접근성(ARIA/속성)

- 모달 루트는 `role="dialog"`, `aria-modal="true"`
- 제목 요소 ID를 `aria-labelledby`로 연결
- 설명 요소 ID를 `aria-describedby`로 연결(도움말/안내 텍스트)
- 각 오류 텍스트 컨테이너에 `role="alert"` 또는 `aria-live="assertive"` 적용
- 모션 민감 사용자 배려: `prefers-reduced-motion`에 따라 애니메이션 최소화/비활성화

### 선언적 호출(API)

- 시그니처: `openFormModal(options?) => Promise<FormValues | null>`
- 제출 완료 시 `FormValues` 반환, 취소/닫기 시 `null` 반환
- 중복 호출 방지: 열려있는 동안 추가 호출은 무시(큐잉/덮어쓰기 없음)

## 정보 구조(권장 DOM/ARIA 구조)

- 오버레이: 문서 최상단 포털에 렌더링, 배경 스크롤 잠금 처리
- 다이얼로그 래퍼: `role="dialog"` `aria-modal="true"` `aria-labelledby` `aria-describedby`
- 헤더: 제목(h2/h3)
- 본문: 안내문(`aria-describedby` 대상) + 폼 필드 집합
- 푸터: 취소(텍스트 버튼) / 제출 버튼
- 포커스 트랩 센티넬(숨김) 또는 JS로 순환 제어

```
[Overlay]
  [Dialog role=dialog aria-modal=true aria-labelledby=modalTitle aria-describedby=modalDesc]
    [Header]
      [Title id=modalTitle]
    [Body]
      [Description id=modalDesc]
      [Form]
        [NameInput aria-invalid=...] [FieldError role=alert]
        [EmailInput aria-invalid=...] [FieldError role=alert]
        [ExperienceSelect aria-invalid=...] [FieldError role=alert]
        [GithubUrlInput optional]
    [Footer]
      [CancelButton (text)] [SubmitButton]
```

## 폼 스펙

- 라벨/플레이스홀더(기본값):
  - 제목: "신청 폼"
  - 설명: "이메일과 FE 경력 연차 등 간단한 정보를 입력해주세요."
- 필드 정의:
  - 이름/닉네임(`name`) — 필수
    - 유형: text
    - 검증: 공백 제거 후 최소 1자
    - 오류 메시지: "이름 또는 닉네임을 입력해 주세요."
  - 이메일(`email`) — 필수
    - 유형: email
    - 검증: **간단 패턴** `^[^\s@]+@[^\s@]+\.[^\s@]+$`
    - 오류 메시지: "유효한 이메일 주소를 입력해 주세요."
  - FE 경력 연차(`experienceYears`) — 필수
    - 유형: select
    - 옵션(기본): `"1년 미만" | "1–3년" | "4–7년" | "8년 이상"`
    - 오류 메시지: "FE 경력 연차를 선택해 주세요."
  - GitHub 링크(`githubUrl`) — 선택
    - 유형: url(text)
    - 검증(간단): `^https?:\/\/.+`
    - 도움말: "예: https://github.com/username"

## 키보드 인터랙션 사양

- 열기 트리거: Enter/Space로 모달 열림
- 모달 내부:
  - Tab/Shift+Tab: 포커스 가능한 요소 사이 순환(트랩)
  - ESC: 모달 닫기
  - Enter: 제출 버튼 포커스 시 제출, 텍스트 입력 중 Enter는 폼 제출 의도 유지
- 오버레이 클릭: 닫기
- 푸터의 텍스트 버튼 "취소": 닫기

## 시각/모션/디자인 토큰

- 기본 전이: 페이드/스케일 등 200–250ms
- `prefers-reduced-motion: reduce`: 애니메이션 제거 또는 0–50ms 단축
- 색상 토큰(예시, Tailwind 참조):
  - `--color-primary-500: #3B82F6` (blue-500)
  - `--color-primary-600: #2563EB` (blue-600)
  - `--color-primary-700: #1D4ED8` (blue-700)
  - 버튼 기본: 배경 `primary-600`, hover `primary-700`, 텍스트 `#FFFFFF`
  - 취소 버튼: 중립 톤(예: `#E5E7EB`), 텍스트 `#111827`
  - 오버레이: `rgba(17, 24, 39, 0.5)`
  - 카드(모달) 배경: `#FFFFFF`, 라운드 코너(예: 16px)

## 에러 표시/발표 규칙

- 오류 텍스트는 즉시 보이는 위치(필드 하단)와 함께 스크린리더에 발표
- 다중 오류일 때도 상단 요약은 사용하지 않음
- 각 오류 필드에 `aria-invalid="true"`와 `aria-describedby`로 오류 텍스트와 연결
- 첫 오류 필드로 포커스 이동

## 선언적 API 사양

### 타입(예시)

```ts
type ExperienceYears = "1년 미만" | "1–3년" | "4–7년" | "8년 이상";

type FormValues = {
	name: string;
	email: string;
	experienceYears: ExperienceYears;
	githubUrl?: string;
};

type OpenFormModalOptions = {
	title?: string; // 기본값: "신청 폼"
	description?: string; // 기본값: 간단 안내 문구
	initialValues?: Partial<FormValues>;
	validateEmailPattern?: RegExp; // 기본 간단 패턴 대체 가능
	experienceOptions?: ExperienceYears[]; // 옵션 커스터마이즈
};

declare function openFormModal(
	options?: OpenFormModalOptions
): Promise<FormValues | null>;
```

### 동작 규칙

- 모달이 이미 열려 있으면 두 번째 호출은 **무시**
- 제출 성공: `resolve(FormValues)` 후 모달 닫힘
- 취소/닫기: `resolve(null)` 후 트리거로 포커스 복귀
- 예외 상황은 throw하지 않고 사용자 상호작용 결과로만 resolve(reject 사용하지 않음)

### 사용 예

```ts
const result = await openFormModal({
	title: "신청 폼",
	description: "이메일과 FE 경력 연차 등 간단한 정보를 입력해주세요.",
});

if (result) {
	// 제출 성공 처리
} else {
	// 취소/닫기 처리
}
```

## 비기능 요구사항

- 접근성: WCAG 2.2 AA 가이드라인을 목표로 구현
- 반응형: 모바일(≤640px) 우선, 데스크톱 레이아웃 최적화
- 국제화: 텍스트는 교체 가능하도록 분리(하드코딩 최소화)
- 성능: 포털 마운트/언마운트 시 스타일 누수 없이 정리, 스크롤 잠금 해제 보장

## 분석/로깅(선택)

- 열림/닫힘 이벤트, 제출/취소 이벤트를 훅 포인트로 노출(내부 구현에서 콘솔 로깅 정도)

## 수용 기준(Acceptance Criteria)

- ESC 또는 오버레이 클릭, 푸터의 "취소" 클릭 시 항상 모달이 닫힌다.
- 열림 시 제목 요소에 포커스가 이동한다.
- 닫힘 시 원래 트리거로 포커스가 복귀한다.
- Tab/Shift+Tab으로 모달 내부에서만 포커스가 순환한다.
- 키보드만으로 폼 입력 및 제출이 가능하다.
- 필수 3개(이름/닉네임, 이메일, FE 경력 연차) 검증이 동작한다.
- 이메일 간단 패턴 검증 실패 시 제출되지 않고 오류 메시지가 즉시 시각·음성으로 공지된다.
- 선택 필드(GitHub 링크)는 미입력 시 제출 가능하며, 입력 시 간단 URL 패턴을 검증한다.
- 오류가 존재하면 첫 오류 필드로 포커스가 이동한다.
- 모달이 열려 있는 동안 배경 스크롤이 잠긴다.
- 콘텐츠가 길 때 모달 내부에서 스크롤이 가능하다.
- `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`가 올바르게 연결된다.
- `prefers-reduced-motion`이 설정된 환경에서 애니메이션이 제거/최소화된다.
- `openFormModal()` 호출로 모달을 열 수 있으며, 제출 시 값, 취소 시 `null`이 반환된다.
- 모달 열림 중 재호출은 무시된다.

## 완료 정의(Definition of Done)

- 스크린리더(VoiceOver, NVDA 중 최소 1개)로 기본 플로우 검증
- 키보드 전용 내비게이션으로 모든 플로우 수행 검증
- 라이트하우스/axe로 주요 접근성 위반 없음
- 다양한 뷰포트(모바일/데스크톱)에서 레이아웃 문제 없음
- 스크롤 잠금/해제가 누수 없이 동작(연속 열고 닫기 시 확인)
- 상호작용 테스트로 핵심 동작(열림/닫힘/포커스/검증/반환) 검증

## 오픈 질문

- 현재 없음(사용자 결정 1–6 반영 완료)
