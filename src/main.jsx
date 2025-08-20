import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext.jsx"; // 1. 로그인/인증 상태를 관리하는 컴포넌트
import AppRouter from "./components/router/Router.jsx";
import "ckeditor5/ckeditor5.css";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true; // ✅ 쿠키 항상 전송
// 전역(Global) CSS 파일
import "./App.css"; // 3. 앱 전체의 기본 스타일 및 CSS 변수 정의
import "./index.css"; // 4. 브라우저 기본 스타일 초기화 등

// HTML의 'root' div에 React 앱을 렌더링(표시)합니다.
ReactDOM.createRoot(document.getElementById("root")).render(
  // React.StrictMode는 개발 중에 잠재적인 문제를 감지하기 위한 래퍼입니다.
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>

);
