# 프로젝트 설명

## 꿈돌이의 첫 비행

지구 대전으로 떠나는 우주선 인터랙티브 웹 프로토타입입니다. 이 문서는 프로젝트의 구성, 실행 방법, 주요 구현 포인트를 간단히 정리합니다.

---

## 1. 프로젝트 개요

1993 대전엑스포 마스코트 꿈돌이의 세계관을 바탕으로, 사용자가 우주선을 타고 지구 대전으로 떠나는 여정을 스크롤로 경험하는 인터랙티브 스토리 웹 프로토타입입니다.

- 탑승 준비 게이트 (닉네임 입력 + 손 인식 등록, 실패 시 마우스 모드로 자동 전환)
- 4개 섹션 스크롤 스토리:
  - 첫 만남 (마우스로 꿈돌이 시선을 조종)
  - 우주창 닦기 (손 인식 또는 마우스로 뿌연 창문을 닦아 우주를 확인)
  - 목적지 뽑기 (캡슐을 뽑으면 항상 지구/대전으로 수렴)
  - 이스터에그 / 확정 (워프 터널 끝에 나타나는 지구)
- 우주창 닦기 완료 후 "여행 시작" 로딩 연출(엔진 점화 중… 등) → 목적지 뽑기 섹션으로 자동 스크롤
- 한 줄 컨셉: "어디를 뽑아도, 별빛은 한 곳을 가리켰다. 지구. 그리고 대전."

## 2. 기술 스택

| 항목 | 내용 |
| --- | --- |
| 프레임워크 | React 18 + Vite 5 + TypeScript |
| 스타일 | Tailwind CSS 3 |
| 애니메이션 | Framer Motion 11 (뽑기 결과, 도착 섹션 reveal) |
| 영상 인터랙션 | `video.currentTime` 마우스 스크럽 (자체 구현, 라이브러리 없음) |
| 창문 닦기 | Canvas 2D API (`destination-out` + radial gradient로 부드러운 glow 브러시) |
| 손 인식 | MediaPipe Hands — **npm install 없이** CDN(`cdn.jsdelivr.net/npm/@mediapipe/hands`)에서 런타임 스크립트 로드. 카메라 거부/미지원/시간초과 시 자동으로 마우스 모드 폴백 |
| 폰트 | Jua (Google Fonts CDN) |

## 3. 구현 상태

완료:
- Vite + React + TS + Tailwind 프로젝트 스캐폴딩
- 탑승 준비 게이트 — 닉네임 입력 + 손 인식 등록 UI (`BoardingGate.tsx`, `useHandTracking.ts`)
- 4개 섹션 스크롤 구조 구현 (`App.tsx`), 섹션 전환에 `scroll-snap-type: y proximity` 적용
- 마우스 x좌표 기반 꿈돌이 영상 scrub 인터랙션 (`KumdoriMouseScrubHero.tsx`), 영상이 잘리지 않도록 `object-contain` + letterbox 배경 처리
- 우주창 닦기 — 손 인식 또는 마우스로 조작, 진행률 게이지·모드 표시·완료 문구·다음 버튼 포함 (`WindowWipeInteraction.tsx`)
- 여행 시작 로딩 오버레이 — 닦기 완료 후 상태 문구 순환 → 뽑기 섹션 자동 스크롤 (`TravelLoadingOverlay.tsx`)
- 목적지 뽑기 — 셔플 애니메이션 후 항상 지구/대전으로 수렴 (`DestinationGacha.tsx`), 카피를 손 인식/닦기 경험과 연결되게 수정
- 도착 확정 섹션 (`ArrivalReveal.tsx`)
- `public/media/`에 영상 1개 + 배경 이미지 5개 정리 (한글/공백 파일명 → kebab-case)
- 모든 미디어 경로를 `import.meta.env.BASE_URL` 기준으로 통일 (`lib/media.ts`) — GitHub Pages 배포용 `base: '/spaceship/'`에도, 로컬 개발(`/`)에도 안전
- `npm install` / `npm run dev` / `npm run build` 확인 완료
- 브라우저에서 탑승 게이트 → 히어로 스크럽 → 닦기(진행률 100%) → 로딩 → 뽑기(지구/대전 수렴) 전체 흐름 수동 검증 완료

추가로 확장할 수 있는 작업:
- 실제 카메라가 있는 환경에서 MediaPipe 손 인식 정확도/지연 튜닝 (개발 중에는 카메라가 없는 환경이라 폴백 경로 위주로 검증함)
- 사운드 효과
- `prefers-reduced-motion` 접근성 대응
- 공식 꿈돌이 라이선스 에셋으로 교체 (현재 영상/이미지는 임시 생성 에셋)
- 모바일 실기기 터치 스크럽 미세 튜닝 (코드상 `touchmove` 핸들러는 있으나 실기기 검증 전)

## 4. 실행 방법

Node.js 18 이상 필요 (개발은 Node 24에서 진행).

```bash
git clone https://github.com/i0kyung/spaceship.git
cd spaceship
npm install
npm run dev
```

접속 주소: http://localhost:5173/

빌드 확인:

```bash
npm run build
npm run preview
```

## 5. 코드 구조

```text
src/
  App.tsx                          탑승 게이트 + 4개 섹션 + 로딩 오버레이 조립, useHandTracking 인스턴스 보유
  components/
    BoardingGate.tsx                탑승 준비: 닉네임 입력 + 손 인식 등록 UI
    TravelLoadingOverlay.tsx        닦기 완료 후 짧은 로딩 전환 연출
    KumdoriMouseScrubHero.tsx      섹션 1: 마우스 x좌표 → video.currentTime 스크럽
    WindowWipeInteraction.tsx      섹션 2: Canvas destination-out 닦기 효과 (손 인식 좌표 또는 마우스)
    DestinationGacha.tsx           섹션 3: 뽑기 셔플 애니메이션 + 지구로 수렴
    ArrivalReveal.tsx              섹션 4: 워프 터널 + 지구 도착 문구
    Starfield.tsx                  배경 반짝이는 별 (CSS 애니메이션)
  hooks/
    useHandTracking.ts             MediaPipe Hands CDN 로드 + getUserMedia + 검지 좌표 추출, 실패 시 error 상태
  data/
    storyTexts.ts                  섹션별 문구
    destinations.ts                뽑기 후보 목록 (isRealDestination: true인 항목만 최종 결과)
  lib/
    media.ts                       public/media 경로를 BASE_URL 기준으로 만드는 헬퍼
  index.css
  main.tsx
tailwind.config.js

public/
  media/
    kumdori-look.mp4               꿈돌이 좌우 시선 영상 (자체 배경 포함, 1280x720, 4.01초)
    spaceship-window-clear.png     맑은 우주창 (섹션1 폴백 배경 / 섹션2 닦은 후 배경)
    spaceship-window-foggy.png     뿌연 우주창 (섹션2 닦기 전 오버레이)
    spaceship-gacha-bg.png         가챠 캡슐 기계 배경 (섹션3)
    warp-tunnel-earth-bg.png       워프 터널 + 지구 (섹션4)
    kumdori-reference-sheet.png    꿈돌이 3D 레퍼런스 시트 (파비콘, 향후 대체 에셋 참고용)
```

자주 수정할 곳:

- 문구 수정: `src/data/storyTexts.ts`
- 목적지 후보 수정: `src/data/destinations.ts`
- 캐릭터/영상 교체: `public/media/kumdori-look.mp4`
- 히어로 영상 스크럽 동작 튜닝: `src/components/KumdoriMouseScrubHero.tsx` 상단의 `RETURN_TO_CENTER`, `LERP_FACTOR` 상수
- 색감/모션 수정: `tailwind.config.js`, `src/index.css`

## 6. 참고 사항

1. **공식 꿈돌이 라이선스**: 현재 영상/이미지는 공식 마스코트 에셋이 아닌 임시 생성 에셋입니다. 공식 에셋으로 교체 시 라이선스 승인 여부를 확인하고, 승인 전에는 저장소를 private으로 유지하는 것을 권장합니다.
2. **영상 경로**: `public/media/kumdori-look.mp4` 경로를 기준으로 사용합니다. 한글/공백 파일명은 웹 경로 문제를 일으키므로 사용하지 마세요.
3. **영상 제어 방식**: `autoplay` 금지, `video.currentTime`으로만 제어합니다. `video.seeking`이 `true`인 동안 `currentTime`을 다시 덮어쓰면 seek이 영원히 끝나지 않아 프레임이 렌더링되지 않습니다 (개발 중 실제로 겪은 버그 — `KumdoriMouseScrubHero.tsx`의 `tick()` 함수에서 `!video.seeking` 체크로 해결).
4. **TypeScript**: 빌드 오류가 나면 `tsconfig.app.json`과 import 경로를 먼저 확인하세요.
5. **미디어 경로와 `base`**: `vite.config.ts`의 `base: '/spaceship/'`(GitHub Pages 배포용) 때문에 컴포넌트에서 `/media/xxx`처럼 절대경로를 하드코딩하면 로컬 개발 서버에서도 404가 납니다. 반드시 `src/lib/media.ts`의 `mediaUrl()`을 통해서 경로를 만드세요.
6. **손 인식(MediaPipe Hands)**: `npm install` 없이 `useHandTracking.ts`가 런타임에 CDN에서 스크립트를 불러옵니다. 카메라가 없거나 오프라인인 개발 환경에서는 항상 `error` 상태로 폴백되는 게 정상 동작입니다 — 실제 카메라가 있는 환경에서 재검증이 필요합니다.
7. **닦기 브러시 gradient**: `WindowWipeInteraction.tsx`의 `wipeAt()`에서 radial gradient의 불투명 구간이 너무 좁으면(가장자리 페이드만 넓으면) 실제로 지워지는 면적이 작아 `CLEAR_THRESHOLD`(70%)에 도달하기 어렵습니다. 현재는 반지름의 60%까지 완전 불투명, 나머지 40%만 페이드로 설정되어 있습니다.

## 7. GitHub

원격 저장소: https://github.com/i0kyung/spaceship

```bash
git add .
git commit -m "메시지"
git push
```

`.gitignore`에 `node_modules`, `dist`, `.env`가 포함되어 있습니다.
