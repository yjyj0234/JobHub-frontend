# JobHub – 프론트엔드 (React/Vite)

<p align="center">
  <img src="docs/cover.png" alt="JobHub UI cover" width="720"/>
</p>

<p align="center">
  <a href="#-주요-기능"><img src="https://img.shields.io/badge/status-active-success?style=flat" /></a>
  <a href="#-기술-스택"><img src="https://img.shields.io/badge/stack-React%2018%20%7C%20Vite%20%7C%20Axios-blue" /></a>
  <a href="#-빠른-시작"><img src="https://img.shields.io/badge/build-Vite-8875ff" /></a>
  <a><img src="https://img.shields.io/badge/license-MIT-lightgrey" /></a>
</p>

**React + Vite** 기반으로 제작된 구인구직 플랫폼 프론트엔드입니다. 지원자 흐름(검색 → 상세보기 → 지원)과 기업 측 기능(공고 작성/수정, 이미지 업로드)을 모두 포함합니다.

> **관련 저장소:** 백엔드(Spring Boot): *JobHub-backend*

---

## 목차

* [✨ 주요 기능](#-주요-기능)
* [🧱 기술 스택](#-기술-스택)
* [📐 아키텍처](#-아키텍처)
* [⚙️ 빠른 시작](#-빠른-시작)
* [🔐 환경 변수](#-환경-변수)
* [📁 프로젝트 구조](#-프로젝트-구조)
* [🔀 라우팅](#-라우팅)
* [👤 인증 및 권한](#-인증-및-권한)
* [🧾 API 계층](#-api-계층)
* [🖼️ 이미지 & S3 Presigned URL](#️-이미지--s3-presigned-url)
* [🧪 테스트 & 품질](#-테스트--품질)
* [🚀 빌드 & 배포](#-빌드--배포)
* [🧭 로드맵](#-로드맵)
* [📸 스크린샷](#-스크린샷)
* [📄 라이선스](#-라이선스)

---

## ✨ 주요 기능

* **채용공고 목록/상세**: 마감일 D-day, 근무 지역, 급여 타입, 재택 여부 등 메타 표시
* **검색 & 필터**: 기본 검색, 페이징/무한 스크롤 확장 가능
* **사용자 권한**: `USER`, `COMPANY`, `ADMIN` 별 라우팅 및 UI 제어
* **지원하기 플로우**: 유효성 검사, 비활성 상태, 접근성 고려
* **공고 작성/수정**: **CKEditor 5** 사용, 안전한 렌더링(DOMPurify 적용)
* **이미지 업로드**: 백엔드가 발급하는 **S3 Presigned URL** 사용
* **일관된 UI**: 반응형 레이아웃, `lucide-react` 아이콘
* **Axios 전역 설정**: 기본 URL, 쿠키 포함, 에러 처리

## 🧱 기술 스택

* **코어**: React 18, Vite, React Router
* **데이터 통신**: Axios (REST API)
* **인증**: 쿠키/JWT (백엔드 연동), React Context(`AuthContext`)
* **에디터/보안**: CKEditor 5, DOMPurify
* **UI**: CSS, `lucide-react`
* **도구**: ESLint, Prettier

## 📐 아키텍처

```
[Frontend] React/Vite ---- REST ----> [Backend] Spring Boot ----> [S3]
```

* 프론트: 라우팅, 인증 상태, UI 렌더링 담당
* 백엔드: 인증, Presigned URL 발급, 데이터 제공
* S3: 이미지 저장소 (항상 Presigned URL로 접근)

## ⚙️ 빠른 시작

### 요구사항

* Node.js ≥ 18
* 백엔드 서버 ([http://localhost:8080](http://localhost:8080))

### 실행 방법

```bash
git clone https://github.com/yjyj0234/JobHub-frontend.git
cd JobHub-frontend
npm install
```

환경 변수 설정 (`.env`):

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_MOCKS=false
```

개발 서버 실행:

```bash
npm run dev
```

빌드:

```bash
npm run build
npm run preview
```

## 🔐 환경 변수

| 키                   | 설명             | 예시                      |
| ------------------- | -------------- | ----------------------- |
| `VITE_API_BASE_URL` | 백엔드 API URL    | `http://localhost:8080` |
| `VITE_ENABLE_MOCKS` | Mock API 사용 여부 | `false`                 |

## 📁 프로젝트 구조

```
src/
  components/       # 공통 컴포넌트
  context/          # AuthContext 등
  pages/            # JobPostingList, Detail, Apply 등
  Resume/           # 이력서 미리보기
  api/              # Axios 인스턴스 및 API 함수
  router/           # 라우터 정의
  css/              # CSS 파일
  main.jsx
  App.jsx
```

## 🔀 라우팅 예시

* `/` → 공고 리스트
* `/jobs/:id` → 공고 상세
* `/jobs/new` → 공고 작성 (기업 전용)
* `/apply/:id` → 지원하기 (사용자 전용)
* `/login` → 로그인

## 👤 인증 및 권한

* `/auth/me` 호출로 사용자 상태 확인
* `USER`: 지원하기 가능
* `COMPANY`: 공고 작성/수정 가능
* `ADMIN`: 관리자 기능 접근

## 🧾 API 계층

Axios 인스턴스 설정:

```js
import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export default http;
```

## 🖼️ 이미지 & S3 Presigned URL

* **업로드**: 프론트 → 백엔드(`/api/files/upload`) → Presigned PUT URL → S3 업로드
* **조회**: 프론트 → 백엔드(`/api/files/view`) → Presigned GET URL 발급
* **장점**: 대용량 파일 처리, 보안 강화(버킷 직접 노출 방지)

## 🧪 테스트 & 품질

* 코드 스타일: ESLint, Prettier
* 단위 테스트: vitest + testing-library (추가 예정)
* 추천: GitHub Actions로 CI 구축

## 🚀 빌드 & 배포

* `npm run build` → `dist/` 출력
* 정적 호스팅(Vercel/Netlify/S3+CloudFront 등)
* Nginx 예시:

```nginx
location / {
  try_files $uri /index.html;
```
