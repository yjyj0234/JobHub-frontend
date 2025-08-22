// src/components/router/Router.jsx

import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// 1. layout 컴포넌트 그룹
import { GlobalHeader, SideNav, GlobalFooter, Service } from "../layout";

// 2. UI/UX 컴포넌트 그룹
import { Modal } from "../UI";
import { AuthPage, Hero, Grid, TopGrid } from "../UX";

// 3. resume 관련 페이지 그룹
import { ResumeListPage, ResumeEditorPage } from "../Resume";

// 4. Companies 관련 페이지 그룹
import { Jobposting, ApplicantsList, CompanyProfile } from "../Companies";

// 5. Admin 관련 페이지 그룹
import { AdminPage, FaqAdminPage } from "../Admin";

// 6. pages (회사소개 등)
import { AboutUs, TermsOfService, PrivacyPolicy } from "../pages";

// 7. job-posting-list 관련 페이지 그룹
import { PostList, AddPost, PostDetail, UpdatePost, GroupChat, GroupChatRoom } from "../Community";
import { JobPostingList, JobPostingDetail } from "../job-posting-list";

function MainLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const body = document.body;
    if (isModalOpen) {
      body.classList.add("body-no-scroll");
    } else {
      body.classList.remove("body-no-scroll");
    }
    return () => {
      body.classList.remove("body-no-scroll");
    };
  }, [isModalOpen]);

  return (
    <div className="app-container">
      <GlobalHeader onLoginClick={openModal} />
      <main className="main-content">
        <Outlet />
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
    { name: "고객센터", path: "/service" },
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
        {/* --- 공개 경로 --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/resumes" element={<ResumeListPage />} />
        <Route path="/resumes/new" element={<ResumeEditorPage />} />
        <Route path="/resumes/edit/:id" element={<ResumeEditorPage />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/jobposting" element={<Jobposting />} />
        <Route path="/companies/applicants" element={<ApplicantsList />} />
        <Route path="/postlist" element={<PostList />} />
        <Route path="/jobpostinglist" element={<JobPostingList />} />
        <Route path="/jobpostinglist/:id" element={<JobPostingDetail />} />
        <Route path="/postlist/addpost" element={<AddPost />} />
        <Route path="/postlist/detail/:id" element={<PostDetail />} />
        <Route path="/postlist/edit/:id" element={<UpdatePost />} />
        <Route path="/group-chat" element={<GroupChat />} />
        <Route path="/group-chat/rooms/:roomId" element={<GroupChatRoom />} />
        <Route path="/service" element={<Service />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/faq" element={<FaqAdminPage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;