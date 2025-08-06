import React, { useState, useEffect, useRef } from 'react';
import './GlobalHeader.css';
import logo from '../../assets/img/logo4.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Search, MapPin, Briefcase, ChevronDown } from 'lucide-react';

const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

function GlobalHeader({ onLoginClick }) {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegionOpen, setRegionOpen] = useState(false);
  const [isJobOpen, setJobOpen] = useState(false);

  const dropdownRef = useRef(null);
  useOnClickOutside(dropdownRef, () => {
    setRegionOpen(false);
    setJobOpen(false);
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
        setIsExpanded(false);
        setRegionOpen(false);
        setJobOpen(false);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleResumeClick = () => {
    if (isLoggedIn) {
      navigate('/resumes');
    } else {
      onLoginClick();
    }
  };

  const toggleRegion = () => {
    setRegionOpen(!isRegionOpen);
    setJobOpen(false);
  };

  const toggleJob = () => {
    setJobOpen(!isJobOpen);
    setRegionOpen(false);
  };

  return (
    <header className={`global-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="top-bar">
          <Link to="/" className="logo">
            <img src={logo} alt="JobHub 로고" />
          </Link>
          <nav className="nav">
            <button type="button">채용정보</button>
            <button type="button">커뮤니티</button>
            <button type="button" onClick={handleResumeClick}>이력서</button>
            <button type="button">취업툴</button>
            <button type="button">이력서 코칭 AI</button>
          </nav>
          <div className="top-right-section">
            {isScrolled && (
              <div className="shrunken-search-bar">
                <input type="text" placeholder="검색" />
                <Search size={18} color="#888" />
              </div>
            )}
            <div className="auth-buttons">
              {isLoggedIn ? (
                <button type="button" onClick={handleLogout} className="cta-button logout">로그아웃</button>
              ) : (
                <button type="button" onClick={onLoginClick} className="cta-button">시작하기</button>
              )}
            </div>
          </div>
        </div>

        <div className="search-container">
          {!isExpanded ? (
            <button className="pre-search-button" onClick={() => setIsExpanded(true)}>
              <Search size={22} />
              <span>어떤 기업을 찾고 계신가요?</span>
            </button>
          ) : (
            <div className="expanded-search" ref={dropdownRef}>
              <div className="search-input-wrapper">
                <label htmlFor="keyword-search">
                  <Search size={20} color="#888" />
                </label>
                <input id="keyword-search" type="text" placeholder="기업, 공고, 포지션 검색" />
              </div>
              <div className="divider"></div>
              <button className="dropdown-trigger" onClick={toggleRegion}>
                <MapPin size={20} color="#888" />
                <span>지역</span>
                <ChevronDown size={16} color="#aaa" />
              </button>
              <div className="divider"></div>
              <button className="dropdown-trigger" onClick={toggleJob}>
                <Briefcase size={20} color="#888" />
                <span>직무</span>
                <ChevronDown size={16} color="#aaa" />
              </button>
              <button className="search-submit-button">검색</button>
              {isRegionOpen && (
                <div className="dropdown-panel region-panel">
                  <h4>지역을 선택하세요</h4>
                  <div className="region-grid">
                    {['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'].map(region => (
                      <button key={region} className="item-button">{region}</button>
                    ))}
                  </div>
                </div>
              )}
              {isJobOpen && (
                <div className="dropdown-panel job-panel">
                  <h4>직무를 선택하세요</h4>
                  <div className="job-grid">
                    {['개발', '경영·비즈니스', '마케팅·광고', '디자인', '영업', '고객서비스·리테일', '인사·총무', '미디어', '엔지니어링', '금융', '의료·제약', '교육'].map(job => (
                      <button key={job} className="item-button">{job}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default GlobalHeader;