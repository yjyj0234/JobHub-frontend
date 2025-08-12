import React, { useState, useEffect, useRef } from 'react';
import '../css/GlobalHeader.css';
import logo from '../../assets/img/logo4.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Search, MapPin, Briefcase, ChevronDown, Info } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
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

const DropdownPanel = ({
  dataTree,
  selectedIds,
  onSelect,
  onClose,
  type, // 'region' or 'job'
}) => {
  const [activeParent, setActiveParent] = useState(dataTree[0] || null);

  useEffect(() => {
    // 데이터가 로드되면 첫 번째 항목을 기본으로 활성화
    if (dataTree.length > 0 && !activeParent) {
      setActiveParent(dataTree[0]);
    }
  }, [dataTree, activeParent]);

  // 상위 카테고리에 속한 하위 항목 중 몇 개가 선택되었는지 계산
  const getSelectionCount = (parentId) => {
    const parent = dataTree.find(p => p.id === parentId);
    if (!parent || !parent.children) return 0;
    return parent.children.filter(child => selectedIds.includes(child.id)).length;
  };

  // '전체 선택' 버튼 핸들러
  const handleSelectAll = () => {
    if (!activeParent || !activeParent.children) return;

    const childIds = activeParent.children.map(child => child.id);
    const allSelected = childIds.every(id => selectedIds.includes(id));

    let newSelectedIds;
    if (allSelected) {
      // 모두 선택된 상태면 모두 해제 (상위 ID는 유지)
      newSelectedIds = selectedIds.filter(id => !childIds.includes(id));
    } else {
      // 하나라도 선택 안 된 상태면 모두 선택
      newSelectedIds = [...new Set([...selectedIds, ...childIds])];
    }
    onSelect(newSelectedIds);
  };
  
  // 개별 항목 선택 핸들러
  const handleChildSelect = (childId) => {
      const newSelectedIds = selectedIds.includes(childId)
        ? selectedIds.filter(id => id !== childId)
        : [...selectedIds, childId];
      onSelect(newSelectedIds);
  };

  return (
    <div className={`dropdown-panel ${type}-panel`}>
      <div className="dropdown-panel-body">
        {/* 왼쪽 패널 (상위 카테고리) */}
        <div className="panel-left">
          {dataTree.map(parent => (
            <button
              key={parent.id}
              className={`panel-left-item ${activeParent?.id === parent.id ? 'active' : ''}`}
              onClick={() => setActiveParent(parent)}
            >
              <span>{parent.name}</span>
              <span className="selection-count">
                {getSelectionCount(parent.id) > 0 ? getSelectionCount(parent.id) : ''}
              </span>
            </button>
          ))}
        </div>

        {/* 오른쪽 패널 (하위 카테고리) */}
        <div className="panel-right">
          {activeParent && (
            <>
              <div className="panel-right-header">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      activeParent.children?.length > 0 &&
                      activeParent.children.every(c => selectedIds.includes(c.id))
                    }
                  />
                  <span className="checkmark"></span>
                  {activeParent.name} 전체
                </label>
              </div>
              <div className="panel-right-list">
                {activeParent.children && activeParent.children.map(child => (
                  <label key={child.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(child.id)}
                      onChange={() => handleChildSelect(child.id)}
                    />
                    <span className="checkmark"></span>
                    {child.name}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {/* 푸터 */}
      <div className="dropdown-footer">
        <div className="selection-info">
          {selectedIds.length > 0 ? (
            <><Info size={16}/> <strong>{selectedIds.length}개</strong> 선택됨</>
          ) : (
            <span>항목을 선택해주세요.</span>
          )}
        </div>
        <div className="footer-buttons">
          <button className="footer-btn reset" onClick={() => onSelect([])}>초기화</button>
          <button className="footer-btn apply" onClick={onClose}>적용</button>
        </div>
      </div>
    </div>
  );
};

function GlobalHeader({ onLoginClick }) {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegionOpen, setRegionOpen] = useState(false);
  const [isJobOpen, setJobOpen] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  
  const [regionTree, setRegionTree] = useState([]);
  const [jobCategoryTree, setJobCategoryTree] = useState([]);
  const [loading, setLoading] = useState(false);

  const expandedSearchRef = useRef(null);
  const scrolledSearchRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useOnClickOutside(expandedSearchRef, () => {
    setRegionOpen(false);
    setJobOpen(false);
  });
  useOnClickOutside(scrolledSearchRef, () => {
    setRegionOpen(false);
    setJobOpen(false);
  });

  useEffect(() => {
  const handleScroll = () => {
    const y = window.scrollY;

    // 내려갈 때는 90px 이상에서만 true
    if (!isScrolled && y > 90) {
      setIsScrolled(true);
      setIsExpanded(false);
      setRegionOpen(false);
      setJobOpen(false);
    }
    // 올라올 때는 70px 이하에서만 false
    else if (isScrolled && y < 70) {
      setIsScrolled(false);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [isScrolled]); // 최신 값 참조 위해 isScrolled 추가

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [regionsRes, jobsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/search/regions/tree`),
        axios.get(`${API_BASE_URL}/search/job-categories/tree`)
      ]);
      setRegionTree(regionsRes.data.regions || []);
      setJobCategoryTree(jobsRes.data.categories || []);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    const searchData = {
      keyword: searchKeyword || null,
      regionIds: selectedRegions.length > 0 ? selectedRegions : null,
      categoryIds: selectedJobs.length > 0 ? selectedJobs : null,
      page: 0,
      size: 20
    };
    console.log('검색 요청:', searchData);
    setIsExpanded(false);
    setRegionOpen(false);
    setJobOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleResumeClick = () => {
    if (isLoggedIn) navigate('/resumes');
    else onLoginClick();
  };
  
  const jobPosting = () => navigate('/jobposting');

  const toggleRegion = () => {
    setRegionOpen(prev => !prev);
    setJobOpen(false);
  };

  const toggleJob = () => {
    setJobOpen(prev => !prev);
    setRegionOpen(false);
  };
  
  const renderDropdownPanels = () => (
    <>
      {isRegionOpen && (
        <DropdownPanel
          dataTree={regionTree}
          selectedIds={selectedRegions}
          onSelect={setSelectedRegions}
          onClose={() => setRegionOpen(false)}
          type="region"
        />
      )}
      {isJobOpen && (
        <DropdownPanel
          dataTree={jobCategoryTree}
          selectedIds={selectedJobs}
          onSelect={setSelectedJobs}
          onClose={() => setJobOpen(false)}
          type="job"
        />
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
            <button type="button" onClick={() => navigate('/jobpostinglist')}>채용정보</button>
            <button type="button">커뮤니티</button>
            <button type="button" onClick={handleResumeClick}>이력서</button>
            <button type="button" onClick={jobPosting}>공고 등록</button>
            <button type="button">취업툴</button>
            <button type="button">이력서 코칭 AI</button>
          </nav>
          <div className="top-right-section">
            {isScrolled && (
              <div className="scrolled-search" ref={scrolledSearchRef}>
                <div className="search-input-wrapper-scrolled">
                  <Search size={16} className="icon"/>
                  <input 
                    type="text" 
                    placeholder="검색"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button className="dropdown-trigger-scrolled" onClick={toggleRegion}>
                  <span>지역 {selectedRegions.length > 0 && `(${selectedRegions.length})`}</span>
                </button>
                <button className="dropdown-trigger-scrolled" onClick={toggleJob}>
                  <span>직무 {selectedJobs.length > 0 && `(${selectedJobs.length})`}</span>
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

        {!isScrolled && <div className="search-container">
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
                <input 
                  id="keyword-search" 
                  type="text" 
                  placeholder="기업, 공고, 포지션 검색"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="divider"></div>
              <button className="dropdown-trigger" onClick={toggleRegion}>
                <div>
                  <MapPin size={20} color="#888" />
                  <span>{selectedRegions.length > 0 ? `${selectedRegions.length}개 지역 선택됨` : '지역'}</span>
                </div>
                <ChevronDown size={16} color="#aaa" />
              </button>
              <div className="divider"></div>
              <button className="dropdown-trigger" onClick={toggleJob}>
                <div>
                  <Briefcase size={20} color="#888" />
                  <span>{selectedJobs.length > 0 ? `${selectedJobs.length}개 직무 선택됨` : '직무'}</span>
                </div>
                <ChevronDown size={16} color="#aaa" />
              </button>
              <button className="search-submit-button" onClick={handleSearch}>검색</button>
              {renderDropdownPanels()}
            </div>
          )}
        </div>}
      </div>
    </header>
  );
}

export default GlobalHeader;
