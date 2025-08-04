import React from 'react';
import './Header.css';
import logo from '../../assets/img/logo4.png'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function Header({ onLoginClick }) {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        <img src={logo} alt="JobHub 로고" />
      </Link>
      <nav className="nav">
        <button type="button">채용정보</button>
        <button type="button">커뮤니티</button>
        <button type="button">이력서</button>
        <button type="button">취업툴</button>
        <button type="button">이력서 코칭 AI</button>
      </nav>
      {isLoggedIn ? (
        <button type="button" onClick={handleLogout} className="cta-button">로그아웃</button>
      ) : (
        <button type="button" onClick={onLoginClick} className="cta-button">시작하기</button>
      )}
    </header>
  );
}

export default Header;