// src/router/AppRouter.jsx
import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

// 1. layout 컴포넌트 그룹
import { GlobalHeader, SideNav, GlobalFooter } from "../layout";

// 2. UI/UX 컴포넌트 그룹
import { Modal } from "../UI";
import { AuthPage, Hero, Grid, TopGrid } from "../UX";

// 3. resume 관련 페이지 그룹
import { ResumeListPage, ResumeEditorPage } from "../Resume";

// 4. Companies 관련 페이지 그룹
import { Jobposting, ApplicantsList } from "../Companies";

import { JobPostingList } from "../job-posting-list";
import { PostList, AddPost, PostDetail, UpdatePost } from "../Community";

function MainLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const body = document.body;
    if (isModalOpen) body.classList.add("body-no-scroll");
    else body.classList.remove("body-no-scroll");
    return () => body.classList.remove("body-no-scroll");
  }, [isModalOpen]);

  return (
    <div className="app-container">
      <GlobalHeader onLoginClick={openModal} />
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <AuthPage onSuccess={closeModal} />
      </Modal>
      <GlobalFooter />
    </div>
  );
}

function HomePage() {
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const topgridRef = useRef(null);
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

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* 홈/리스트 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/resumes" element={<ResumeListPage />} />

        {/* ✨ 편집 라우트 — 두 가지 패턴 모두 지원 */}
        {/* 권장: /resumes/:resumeId/edit */}
        <Route path="/resumes/new" element={<ResumeEditorPage />} />
        <Route path="/resumes/:resumeId/edit" element={<ResumeEditorPage />} />
        {/* 하위호환: /resumes/edit/:id */}
        <Route path="/resumes/edit/:id" element={<ResumeEditorPage />} />

        {/* 새 이력서 — 아직 ID가 없으면 ActivityForm에선 API 호출 막힘(의도) */}
        <Route path="/resumes/new" element={<ResumeEditorPage />} />

        {/* 기타 */}
        <Route path="/jobposting" element={<Jobposting />} />
        <Route path="/companies/applicants" element={<ApplicantsList />} />
        <Route path="/jobpostinglist" element={<JobPostingList />} />
        <Route path="/postlist" element={<PostList />} />
        <Route path="/postlist/addpost" element={<AddPost />} />
        <Route path="/postlist/detail/:id" element={<PostDetail />} />
        <Route path="/postlist/edit/:id" element={<UpdatePost />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
