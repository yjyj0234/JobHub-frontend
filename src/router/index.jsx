/**
 * src/router/index.jsx
 * --------------------------------
 * React 애플리케이션의 모든 페이지 경로(라우팅) 규칙을 정의하는 '교통 안내원' 같은 파일입니다.
 *
 * 이 파일의 주요 역할은 다음과 같습니다:
 * 1. 사용자가 접속하는 웹사이트 주소(URL)에 따라 어떤 페이지 컴포넌트를 보여줄지 결정합니다.
 * 2. 여러 페이지에 공통적으로 나타나는 레이아웃(예: 상단 헤더, 로그인 모달)을 관리합니다.
 */

import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

// --- 1. 페이지와 컴포넌트 불러오기 ---
// 라우터에서 사용할 모든 페이지와 공통 컴포넌트들을 미리 불러옵니다.

import GlobalHeader from "../layout/GlobalHeader.jsx"; // 공통 상단 헤더
import SideNav from "../layout/SideNav.jsx"; // 공통 사이드 네비게이션
import Modal from "../components/UI/Modal.jsx"; // 공통 모달 UI
import AuthPage from "../components/UX/AuthPage.jsx"; // 로그인/회원가입 기능
import Hero from "../components/UX/Hero.jsx"; // 홈페이지의 Hero 섹션
import Grid from "../components/UX/Grid.jsx"; // 홈페이지의 Grid 섹션
import TopGrid from "../components/UX/TopGrid.jsx"; // 홈페이지의 TopGrid 섹션
import ResumeListPage from "../pages/ResumeListPage.jsx"; // 이력서 목록 페이지
import ResumeEditorPage from "../pages/ResumeEditorPage.jsx"; // 이력서 편집 페이지
import GlobalFooter from "../layout/GlobalFooter.jsx"; // 공통 푸터
import { AuthProvider } from "../context/AuthContext.jsx";

/**
 * 🏢 MainLayout 컴포넌트
 * 이 컴포넌트는 모든 페이지를 감싸는 '공통 뼈대' 역할을 합니다.
 * 여기에 포함된 GlobalHeader나 Modal은 어떤 페이지로 이동하든 항상 화면에 존재하게 됩니다.
 * <Outlet /> 부분에 각 페이지의 실제 내용이 들어옵니다.
 */
function MainLayout() {
  // 로그인 모달 창이 열렸는지 닫혔는지 상태를 관리합니다.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 모달이 열렸을 때, 배경 페이지의 스크롤을 막는 부가 기능(Side Effect)을 처리합니다.
  useEffect(() => {
    const body = document.body;
    if (isModalOpen) {
      body.classList.add("body-no-scroll");
    } else {
      body.classList.remove("body-no-scroll");
    }
    // 컴포넌트가 사라질 때 원래대로 되돌리기 위한 정리(cleanup) 함수입니다.
    return () => {
      body.classList.remove("body-no-scroll");
    };
  }, [isModalOpen]); // isModalOpen 상태가 바뀔 때마다 이 함수가 실행됩니다.

  return (
    <>
      {/* 모든 페이지 상단에 GlobalHeader를 표시하고, 로그인 버튼 클릭 시 모달을 여는 함수를 전달합니다. */}
      <GlobalHeader onLoginClick={openModal} />
      <div className="container">
        {/* ✨ Outlet: 이 자리에 Route 규칙에 따라 결정된 페이지 컴포넌트(HomePage, ResumeListPage 등)가 들어옵니다. */}
        <Outlet />
      </div>
      {/* 모든 페이지에서 사용할 수 있는 로그인/회원가입 모달입니다. */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <AuthPage onSuccess={closeModal} />
      </Modal>
      <GlobalFooter />
    </>
  );
}

/**
 * 🏠 HomePage 컴포넌트
 * 웹사이트의 메인 페이지('/')를 구성하는 여러 섹션 컴포넌트들을 조합하는 역할을 합니다.
 */
function HomePage() {
  // useRef: 스크롤 위치를 추적하기 위해 각 섹션 DOM 요소를 직접 참조할 때 사용합니다.
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const topgridRef = useRef(null);
  // SideNav에 전달할 섹션 목록 데이터입니다.
  const sections = [
    { name: "소개", ref: heroRef },
    { name: "추천 기업", ref: gridRef },
    { name: "TOP10 기업", ref: topgridRef },
  ];

  return (
    <>
      <main>
        <Hero sectionRef={heroRef} />
        <Grid sectionRef={gridRef} />
        <TopGrid sectionRef={topgridRef} />
      </main>
      <SideNav sections={sections} />
    </>
  );
}

/**
 * 🗺️ AppRouter 컴포넌트
 * react-router-dom 라이브러리를 사용하여 웹사이트의 전체적인 페이지 경로를 설정합니다.
 */
function AppRouter() {
  return (
    // BrowserRouter: HTML5 History API를 사용하여 URL과 UI를 동기화합니다.

    // <AuthProvider>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/resumes" element={<ResumeListPage />} />
        <Route path="/resumes/new" element={<ResumeEditorPage />} />
        <Route path="/resumes/edit/:id" element={<ResumeEditorPage />} />
      </Route>
    </Routes>
    // </AuthProvider>
  );
}

export default AppRouter;
