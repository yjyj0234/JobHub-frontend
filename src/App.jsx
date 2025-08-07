import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./App.css";
import GlobalHeader from "./layout/GlobalHeader.jsx";
import Hero from "./UX/Hero.jsx";
import Grid from "./UX/Grid.jsx";
import TopGrid from "./UX/TopGrid.jsx";
import SideNav from "./layout/SideNav.jsx";
import AuthPage from "./UX/AuthPage.jsx";
import Modal from "./UI/Modal.jsx";

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
    <>
      <GlobalHeader onLoginClick={openModal} />
      <div className="container">
        <Outlet />
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <AuthPage onSuccess={closeModal} />
      </Modal>
    </>
  );
}

function HomePage() {
  const heroRef = React.useRef(null);
  const gridRef = React.useRef(null);
  const topgridRef = React.useRef(null);
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

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
