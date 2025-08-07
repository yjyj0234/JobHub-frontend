/**
 * src/router/index.jsx
 * --------------------------------
 * 애플리케이션의 모든 라우팅(경로 설정) 규칙을 정의하는 파일입니다.
 * 역할:
 * 1. 사용자가 접속하는 URL에 따라 어떤 페이지 컴포넌트를 보여줄지 결정합니다.
 * 2. 여러 페이지에 공통적으로 나타나는 레이아웃(헤더, 푸터 등)을 관리합니다.
 */

import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

// 필요한 컴포넌트들을 불러옵니다.
import GlobalHeader from '../layout/GlobalHeader.jsx';     // 공통 상단 헤더
import SideNav from '../layout/SideNav.jsx';             // 공통 사이드 네비게이션
import Modal from '../components/UI/Modal.jsx';          // 공통 모달 UI
import AuthPage from '../components/UX/AuthPage.jsx';      // 로그인/회원가입 기능
import Hero from '../components/UX/Hero.jsx';              // 홈페이지의 Hero 섹션
import Grid from '../components/UX/Grid.jsx';              // 홈페이지의 Grid 섹션
import TopGrid from '../components/UX/TopGrid.jsx';        // 홈페이지의 TopGrid 섹션
import Jobposting from '../components/Companies/Jobposting.jsx'; // 채용 공고 등록 페이지
/**
 * MainLayout 컴포넌트:
 * 모든 페이지에 공통적으로 포함될 상단 헤더와 모달 로직을 담고 있습니다.
 * <Outlet /> 부분에 각 페이지의 실제 내용이 렌더링됩니다.
 */
function MainLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 모달이 열렸을 때 배경 스크롤을 막는 로직
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
        <Outlet /> {/* 이 자리에 Route에 설정된 페이지 컴포넌트가 들어옵니다. */}
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <AuthPage onSuccess={closeModal} />
      </Modal>
    </>
  );
}

/**
 * HomePage 컴포넌트:
 * 메인 페이지('/')를 구성하는 여러 섹션 컴포넌트들을 조합합니다.
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
 * AppRouter 컴포넌트:
 * react-router-dom을 사용하여 URL 경로와 컴포넌트를 매핑합니다.
 */
function AppRouter() {
  return (
    // BrowserRouter: HTML5 History API를 사용하여 URL과 UI를 동기화합니다.
    <BrowserRouter>
      {/* Routes: 여러 Route 중 현재 URL과 일치하는 첫 번째 Route를 렌더링합니다. */}
      <Routes>
        {/* '/'(홈) 경로를 포함한 여러 페이지가 MainLayout을 공유하도록 중첩 라우팅을 사용합니다. */}
        <Route element={<MainLayout />}>
          {/* path="/": 웹사이트의 메인 주소. HomePage 컴포넌트를 보여줍니다. */}
          <Route path="/" element={<HomePage />} />
          {/* 예: <Route path="/users" element={<UsersPage />} /> 와 같이 새 페이지를 추가할 수 있습니다. */}
          <Route path='/jobposting' element={<Jobposting/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;