// src/components/router/Router.jsx

import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
// 1. layout 컴포넌트 그룹
import { GlobalHeader, SideNav, GlobalFooter, Service } from "../layout";

// 2. UI/UX 컴포넌트 그룹
import { Modal } from "../UI";
import { AuthPage, Hero, Grid, TopGrid } from "../UX";

// 3. resume 관련 페이지 그룹
import { ResumeListPage, ResumeEditorPage } from "../resume";

// 4. Companies 관련 페이지 그룹
<<<<<<< HEAD
import { Jobposting, ApplicantsList, CompanyProfile } from "../Companies";

import { JobPostingList } from "../job-posting-list";
import {
  PostList,
  AddPost,
  PostDetail,
  UpdatePost,
  GroupChat,
  GroupChatRoom,
} from "../Community";
=======
import { Jobposting, ApplicantsList } from "../Companies";

import { JobPostingList, JobPostingDetail } from "../job-posting-list";
import { PostList, AddPost, PostDetail, UpdatePost, GroupChat, GroupChatRoom } from "../Community";
>>>>>>> 6ac231e026f1b2dbc1c35a5451738ea5f11951c7

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
        {/* 홈/리스트 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/resumes" element={<ResumeListPage />} />
        <Route path="/resumes/new" element={<ResumeEditorPage />} />
<<<<<<< HEAD
        <Route path="/resumes/edit/:id" element={<ResumeEditorPage />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
=======
        <Route path="/resumes/:id" element={<ResumeEditorPage />} />

>>>>>>> 6ac231e026f1b2dbc1c35a5451738ea5f11951c7
        <Route path="/jobposting" element={<Jobposting />} />
        <Route path="/companies/applicants" element={<ApplicantsList />} />
        <Route path="/postlist" element={<PostList />} />
        <Route path="/jobpostinglist" element={<JobPostingList />} />
        <Route path="/postlist/addpost" element={<AddPost />} />
        <Route path="/postlist/detail/:id" element={<PostDetail />} />
        <Route path="/postlist/edit/:id" element={<UpdatePost />} />
        <Route path="/group-chat" element={<GroupChat />} />
        <Route path="/group-chat/rooms/:roomId" element={<GroupChatRoom />} />
        <Route path="/service" element={<Service />} />
        {/* 공고 디테일 */}
        <Route path="/jobpostinglist/:id" element={<JobPostingDetail />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
