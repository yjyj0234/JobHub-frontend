/**
 * src/main.jsx
 * --------------------------------
 * React 애플리케이션의 최상위 진입점(Entry Point) 파일입니다.
 * 이 파일의 역할은 다음과 같습니다:
 * 1. 필요한 핵심 라이브러리(React, ReactDOM)를 불러옵니다.
 * 2. 앱 전체에서 사용될 전역 상태 관리 Provider(`AuthProvider`)를 설정합니다.
 * 3. 모든 페이지의 경로를 관리하는 라우터(`AppRouter`)를 불러와 렌더링합니다.
 * 4. 앱 전체에 적용될 전역 CSS 파일을 불러옵니다.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx"; // 1. 로그인/인증 상태를 관리하는 컴포넌트
import AppRouter from "./router/index.jsx"; // 2. 페이지 경로를 설정하는 라우터 컴포넌트

// 전역(Global) CSS 파일
import "./App.css"; // 3. 앱 전체의 기본 스타일 및 CSS 변수 정의
import "./index.css"; // 4. 브라우저 기본 스타일 초기화 등

// HTML의 'root' div에 React 앱을 렌더링(표시)합니다.
ReactDOM.createRoot(document.getElementById("root")).render(
  // React.StrictMode는 개발 중에 잠재적인 문제를 감지하기 위한 래퍼입니다.
  <React.StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);
