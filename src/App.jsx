
/**
 * src/App.jsx (리팩토링 이전 버전)
 * --------------------------------
 * [참고용] 이 파일은 프로젝트 초기에 사용되었던 구조입니다.
 * 현재는 모든 역할이 `router/index.jsx`와 각 `pages` 파일로 분리되었습니다.
 *
 * 이 파일의 역할:
 * 1. 라우팅, 공통 레이아웃, 페이지 컴포넌트 정의 등 앱의 모든 핵심 구조를 한 곳에서 관리했습니다.
 * 2. `AuthProvider`로 전체 앱을 감싸 전역 상태를 제공하고, `react-router-dom`으로 경로를 설정했습니다.
 */

import React, { useState, useEffect, useRef } from 'react'; // React와 훅(hook)들을 불러옵니다.
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'; // 라우팅 라이브러리
import { AuthProvider } from './context/AuthContext.jsx'; // 전역 인증 상태 관리
import './App.css'; // 전역 CSS

// --- 컴포넌트 불러오기 ---
// 각 UI 조각들을 해당 경로에서 불러옵니다.
import GlobalHeader from './layout/GlobalHeader.jsx';
import Hero from './UX/Hero.jsx';
import Grid from './UX/Grid.jsx';
import TopGrid from './UX/TopGrid.jsx';
import SideNav from './layout/SideNav.jsx';
import AuthPage from './UX/AuthPage.jsx';
import Modal from './UI/Modal.jsx';

/**
 * 🏢 MainLayout 컴포넌트
 * 모든 페이지를 감싸는 '공통 뼈대' 역할을 합니다.
 * 헤더나 모달처럼 모든 페이지에 공통으로 필요한 UI와 로직이 포함됩니다.
 */

function MainLayout() {
  // 로그인 모달 창의 열림/닫힘 상태를 관리합니다.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 모달이 열렸을 때 배경 스크롤을 막는 로직입니다.
  useEffect(() => {
    const body = document.body;
    if (isModalOpen) {
      body.classList.add('body-no-scroll');
    } else {
      body.classList.remove('body-no-scroll');
    }
    // 컴포넌트가 사라질 때 원래대로 되돌리기 위한 정리(cleanup) 함수입니다.
    return () => {
      body.classList.remove('body-no-scroll');
    };
  }, [isModalOpen]); // isModalOpen 상태가 바뀔 때마다 이 함수가 실행됩니다.

  return (
    <>
      {/* 모든 페이지 상단에 헤더를 표시합니다. */}
      <GlobalHeader onLoginClick={openModal} />
      <div className="container">
        {/* ✨ Outlet: 라우팅 규칙에 따라 결정된 페이지 컴포넌트가 이 자리에 렌더링됩니다. */}
        <Outlet />
      </div>
      {/* 모든 페이지에서 사용할 수 있는 로그인 모달입니다. */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <AuthPage onSuccess={closeModal} />
      </Modal>
    </>
  );
}

/**
 * 🏠 HomePage 컴포넌트
 * 웹사이트의 메인 페이지('/')를 구성하는 여러 섹션 컴포넌트들을 조합합니다.
 */
function HomePage() {
  // useRef: 스크롤 위치 추적을 위해 각 섹션 DOM 요소를 직접 참조할 때 사용합니다.
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const topgridRef = useRef(null);
  // SideNav에 전달할 섹션 목록 데이터입니다.
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
 * 🚀 App 컴포넌트
 * 이 파일의 최상위 컴포넌트로, 전체 애플리케이션의 구조를 정의합니다.
 */
function App() {
  return (
    // <Router> (BrowserRouter): 웹브라우저 주소와 UI를 동기화합니다.
    <Router>
      {/* <AuthProvider>: 이 안에 있는 모든 컴포넌트가 로그인 정보에 접근할 수 있게 합니다. */}
      <AuthProvider>
        {/* <Routes>: URL에 맞는 <Route>를 찾아 렌더링합니다. */}
        <Routes>
          {/* 중첩 라우팅: 이 <Route> 안에 있는 모든 경로는 <MainLayout>을 공유합니다. */}
          <Route element={<MainLayout />}>
            {/* path="/": 메인 페이지 경로일 때 <HomePage>를 보여줍니다. */}
            <Route path="/" element={<HomePage />} />
            
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 