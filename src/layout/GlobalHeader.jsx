import React, { useState, useEffect, useRef } from 'react';
import '../css/GlobalHeader.css';
import logo from '../assets/img/logo4.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Search, MapPin, Briefcase, ChevronDown } from 'lucide-react';

// 커스텀 훅: 컴포넌트 바깥을 클릭했을 때를 감지
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

  // 상태 (State)
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegionOpen, setRegionOpen] = useState(false);
  const [isJobOpen, setJobOpen] = useState(false);

  // Ref (DOM 요소 참조)
  const expandedSearchRef = useRef(null);
  const scrolledSearchRef = useRef(null);

  // 커스텀 훅을 사용하여 바깥 클릭 시 드롭다운 닫기
  useOnClickOutside(expandedSearchRef, () => {
    setRegionOpen(false);
    setJobOpen(false);
  });
  useOnClickOutside(scrolledSearchRef, () => {
    setRegionOpen(false);
    setJobOpen(false);
  });


  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const handleScroll = () => {
      const shouldBeScrolled = window.scrollY > 80;
      if (shouldBeScrolled) {
        setIsScrolled(true);
        // 스크롤 시 모든 드롭다운과 확장 상태를 닫음
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

  // 로그아웃 핸들러
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 이력서 버튼 클릭 핸들러
  const handleResumeClick = () => {
    if (isLoggedIn) {
      navigate('/resumes');
    } else {
      onLoginClick();
    }
  };

  // 드롭다운 토글 함수
  const toggleRegion = () => {
    setRegionOpen(prev => !prev);
    setJobOpen(false);
  };

  const toggleJob = () => {
    setJobOpen(prev => !prev);
    setRegionOpen(false);
  };

  const jobPosting = () => {
    navigate('/jobposting');
  };

  // 공통 드롭다운 패널 렌더링 함수
  const renderDropdownPanels = () => (
    <>
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
    </>
  );


  
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
            <button type="button" onClick={jobPosting}>공고 등록</button>
            <button type="button">취업툴</button>
            <button type="button">이력서 코칭 AI</button>
            
          </nav>

          <div className="top-right-section">
            {/* 스크롤 시 보이는 기능적 검색창 */}
            {isScrolled && (
              <div className="scrolled-search" ref={scrolledSearchRef}>
                <div className="search-input-wrapper-scrolled">
                  <Search size={16} color="#888" />
                  <input type="text" placeholder="검색" />
                </div>
                <button className="dropdown-trigger-scrolled" onClick={toggleRegion}>
                  <MapPin size={16} />
                  <span>지역</span>
                </button>
                <button className="dropdown-trigger-scrolled" onClick={toggleJob}>
                  <Briefcase size={16} />
                  <span>직무</span>
                </button>
                {renderDropdownPanels()}
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

        {/* 스크롤 아닐 때 보이는 검색 컨테이너 */}
        <div className="search-container">
          {!isExpanded ? (
            <button className="pre-search-button" onClick={() => setIsExpanded(true)}>
              <Search size={22} />
              <span>어떤 기업을 찾고 계신가요?</span>
            </button>
          ) : (
            <div className="expanded-search" ref={expandedSearchRef}>
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
              {renderDropdownPanels()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default GlobalHeader;