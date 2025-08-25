import React, { useState, useEffect } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

// Layout Components
import { GlobalHeader, SideNav, GlobalFooter, Service } from "../layout";

// UI/UX Components
import { Modal } from "../UI";
import { AuthPage, Hero, Grid, TopGrid } from "../UX";

// Page Components
import { ResumeListPage, ResumeEditorPage } from "../Resume";

import { Jobposting, ApplicantsList, CompanyProfile } from "../Companies";
import { AdminPage, FaqAdminPage } from "../Admin";
import { AboutUs, TermsOfService, PrivacyPolicy, NoticePage, NoticeAdminPage } from "../pages";
import { PostList, AddPost, PostDetail, UpdatePost, GroupChat, GroupChatRoom } from "../Community";
import { JobPostingList, JobPostingDetail } from "../job-posting-list";
import { CoachingAI } from "../personalstatecoach"; // CoachingAI import 추가

// Main Layout Component


// 4. Companies 관련 페이지 그룹
import {
  Jobposting,
  ApplicantsList,
  CompanyProfile,
  CompanyDashboard,
} from "../Companies";

import AdminPage from "../Admin/AdminPage";

// 6. job-posting-list 관련 페이지 그룹
import { PostList, AddPost, PostDetail, UpdatePost, GroupChat, GroupChatRoom } from "../Community";
import { JobPostingList, JobPostingDetail, JobApplication } from "../job-posting-list";
import { CoachingAI } from "../personalstatecoach";

function MainLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const body = document.body;
    body.classList.toggle("body-no-scroll", isModalOpen);
    return () => body.classList.remove("body-no-scroll");
  }, [isModalOpen]);

  // openLoginModal
    useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    
    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
    };
  }, []);

  return (
    <div className="app-container">
      <GlobalHeader onLoginClick={openModal} />
      <main className="main-content">
        <Outlet /> {/* 페이지 컴포넌트가 이 자리에 렌더링됩니다 */}
      </main>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <AuthPage onSuccess={closeModal} />
      </Modal>
      <GlobalFooter />
    </div>
  );
}

// HomePage Component (SideNav를 포함한 특별한 레이아웃)
function HomePageLayout() {
    const sections = [
        { name: "소개", ref: React.useRef(null) },
        { name: "추천 기업", ref: React.useRef(null) },
        { name: "TOP10 기업", ref: React.useRef(null) },
        { name: "고객센터", path: "/service" },
    ];

    return (
        <>
            <Hero sectionRef={sections[0].ref} />
            <Grid sectionRef={sections[1].ref} />
            <TopGrid sectionRef={sections[2].ref} />
            <SideNav sections={sections} />
        </>
    );
}

// AppRouter Component
function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* 모든 페이지가 MainLayout을 공유합니다 */}
        <Route path="/" element={<HomePageLayout />} />
        <Route path="/resumes" element={<ResumeListPage />} />
        <Route path="/resumes/new" element={<ResumeEditorPage />} />
        <Route path="/resumes/edit/:id" element={<ResumeEditorPage />} />
        <Route path="/company-info" element={<CompanyDashboard />} />
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
        <Route path="/notices" element={<NoticePage />} />
        <Route path="/coaching-ai" element={<CoachingAI />} />
        <Route path="/admin" element={<AdminPage />} />

        <Route path="/admin/faq" element={<FaqAdminPage />} />
        <Route path="/admin/notices" element={<NoticeAdminPage />} />

        {/* 공고 디테일 */}
        <Route path="/jobpostinglist/:id" element={<JobPostingDetail />} />
        <Route path="/apply/:jobId" element={<JobApplication />} />
        <Route path="/coaching-ai" element={<CoachingAI />} />

      </Route>
    </Routes>
  );
}

export default AppRouter;
