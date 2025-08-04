import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header.jsx';
import Hero from './components/Hero/Hero.jsx';
import Grid from './components/Grid/Grid.jsx';
import SideNav from './components/SideNav/SideNav.jsx';
import AuthPage from './components/Auth/AuthPage.jsx';
import Modal from './components/Modal/Modal.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

function MainPage() {
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const sections = [
    { name: "소개", ref: heroRef },
    { name: "추천 기업", ref: gridRef }
  ];

  return (
    <>
      <main>
        <Hero sectionRef={heroRef} />
        <Grid sectionRef={gridRef} />
      </main>
      <SideNav sections={sections} />
    </>
  );
}

function AppContent() {
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
      <div className="container">
        <Header onLoginClick={openModal} />
        <Routes>
          <Route path="/" element={<MainPage />} />
        </Routes>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <AuthPage onSuccess={closeModal} />
      </Modal>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
