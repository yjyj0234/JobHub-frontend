/**
 * src/router/index.jsx
 * --------------------------------
 * React 애플리케이션의 모든 페이지 경로(라우팅) 규칙을 정의하는 '교통 안내원' 같은 파일입니다.
 *
 * 이 파일의 주요 역할은 다음과 같습니다:
 * 1. 사용자가 접속하는 웹사이트 주소(URL)에 따라 어떤 페이지 컴포넌트를 보여줄지 결정합니다.
 * 2. 여러 페이지에 공통적으로 나타나는 레이아웃(예: 상단 헤더, 로그인 모달)을 관리합니다.
 */

import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import GlobalHeader from '../layout/GlobalHeader.jsx';     // 공통 상단 헤더
import SideNav from '../layout/SideNav.jsx';             // 공통 사이드 네비게이션
import Modal from '../components/UI/Modal.jsx';          // 공통 모달 UI
import AuthPage from '../components/UX/AuthPage.jsx';      // 로그인/회원가입 기능
import Hero from '../components/UX/Hero.jsx';              // 홈페이지의 Hero 섹션
import Grid from '../components/UX/Grid.jsx';              // 홈페이지의 Grid 섹션
import TopGrid from '../components/UX/TopGrid.jsx';        // 홈페이지의 TopGrid 섹션
import ResumeListPage from '../pages/ResumeListPage.jsx'; // 이력서 목록 페이지
import ResumeEditorPage from '../pages/ResumeEditorPage.jsx'; // 이력서 편집 페이지
import GlobalFooter from '../layout/GlobalFooter.jsx'; // 공통 푸터
import Jobposting from '../components/Companies/Jobposting.jsx';

import Jobposting from '../components/Companies/Jobposting.jsx';
/**
 * 🏢 MainLayout 컴포넌트
 * 이 컴포넌트는 모든 페이지를 감싸는 '공통 뼈대' 역할을 합니다.
 * 여기에 포함된 GlobalHeader나 Modal은 어떤 페이지로 이동하든 항상 화면에 존재하게 됩니다.
 * <Outlet /> 부분에 각 페이지의 실제 내용이 들어옵니다.
 */
function MainLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const body = document.body;
    if (isModalOpen) {
      body.classList.add('body-no-scroll');
    } else {
      body.classList.remove('body-no-scroll');
    }
    return () => {
      body.classList.remove('body-no-scroll');
    };
  }, [isModalOpen]);

  return (
    <>
      <GlobalHeader onLoginClick={openModal} />
      <div className="container">
        <Outlet />
      </div>
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
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const topgridRef = useRef(null);
  const sections = [
    { name: "소개", ref: heroRef },
    { name: "추천 기업", ref: gridRef },
    { name: "TOP10 기업", ref: topgridRef }
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
        <Route path="/jobposting" element={<Jobposting/>}/>
      </Route>
    </Routes>
    // </AuthProvider>

  );
}

export default AppRouter;