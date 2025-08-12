import React, { useState, useEffect, useRef } from "react";
import "../css/GlobalHeader.css";
import logo from "../../assets/img/logo4.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Search, MapPin, Briefcase, ChevronDown } from "lucide-react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

function GlobalHeader({ onLoginClick }) {
  const { isAuthed, logout, id } = useAuth(); //토큰에서 id 가져다쓰기
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegionOpen, setRegionOpen] = useState(false);
  const [isJobOpen, setJobOpen] = useState(false);

  //  검색 관련 state 추가
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);

  //  API에서 가져올 데이터
  const [regionTree, setRegionTree] = useState([]);
  const [jobCategoryTree, setJobCategoryTree] = useState([]);
  const [loading, setLoading] = useState(false);

  const expandedSearchRef = useRef(null);
  const scrolledSearchRef = useRef(null);

  // 컴포넌트 마운트 시 데이터 로드
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
      const shouldBeScrolled = window.scrollY > 80;
      if (shouldBeScrolled) {
        setIsScrolled(true);
        setIsExpanded(false);
        setRegionOpen(false);
        setJobOpen(false);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 초기 데이터 로드 (트리 구조)
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 지역 트리 구조 로드
      const regionsRes = await axios.get(`${API_BASE_URL}/search/regions/tree`);
      console.log("지역 트리:", regionsRes.data);
      setRegionTree(regionsRes.data.regions || []);

      // 직무 트리 구조 로드
      const jobsRes = await axios.get(
        `${API_BASE_URL}/search/job-categories/tree`
      );
      console.log("직무 트리:", jobsRes.data);
      setJobCategoryTree(jobsRes.data.categories || []);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      // 에러 시 기본 데이터
      setRegionTree([
        { id: 1000, name: "서울", children: [] },
        { id: 2000, name: "경기", children: [] },
        { id: 3000, name: "인천", children: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  //지역 선택/해제
  const handleRegionSelect = (regionId) => {
    setSelectedRegions((prev) => {
      if (prev.includes(regionId)) {
        return prev.filter((id) => id !== regionId);
      } else {
        return [...prev, regionId];
      }
    });
  };

  //직무 선택/해제
  const handleJobSelect = (jobId) => {
    setSelectedJobs((prev) => {
      if (prev.includes(jobId)) {
        return prev.filter((id) => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  // 검색 실행
  const handleSearch = async () => {
    const searchData = {
      keyword: searchKeyword || null,
      regionIds: selectedRegions.length > 0 ? selectedRegions : null,
      categoryIds: selectedJobs.length > 0 ? selectedJobs : null,
      page: 0,
      size: 20,
    };

    console.log("검색 요청:", searchData);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/search/jobs`,
        searchData
      );
      console.log("검색 결과:", response.data);

      // 검색 결과 페이지로 이동
      const queryParams = new URLSearchParams({
        keyword: searchKeyword,
        regions: selectedRegions.join(","),
        jobs: selectedJobs.join(","),
      }).toString();

      navigate(`/jobs?${queryParams}`);

      // 검색 후 초기화
      setIsExpanded(false);
      setRegionOpen(false);
      setJobOpen(false);
    } catch (error) {
      console.error("검색 실패:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleResumeClick = () => {
    if (isAuthed) {
      navigate("/resumes");
    } else {
      onLoginClick();
    }
  };

  const jobPosting = () => {
    navigate("/jobposting");
  };

  const toggleRegion = () => {
    setRegionOpen((prev) => !prev);
    setJobOpen(false);
  };

  const toggleJob = () => {
    setJobOpen((prev) => !prev);
    setRegionOpen(false);
  };

  const renderDropdownPanels = () => (
    <>
      {isRegionOpen && (
        <div className="dropdown-panel region-panel">
          <h4>지역을 선택하세요</h4>
          {loading ? (
            <div>로딩 중...</div>
          ) : (
            <div className="region-tree">
              {regionTree.map((region) => (
                <div key={region.id} className="region-group">
                  <div className="region-parent">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedRegions.includes(region.id)}
                        onChange={() => handleRegionSelect(region.id)}
                      />
                      <span className="region-name">{region.name}</span>
                    </label>
                  </div>
                  {region.children && region.children.length > 0 && (
                    <div className="region-children">
                      {region.children.map((child) => (
                        <label key={child.id} className="region-child">
                          <input
                            type="checkbox"
                            checked={selectedRegions.includes(child.id)}
                            onChange={() => handleRegionSelect(child.id)}
                          />
                          <span>{child.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {selectedRegions.length > 0 && (
            <div className="selection-info">
              선택됨: {selectedRegions.length}개
              <button onClick={() => setSelectedRegions([])}>초기화</button>
            </div>
          )}
        </div>
      )}

      {isJobOpen && (
        <div className="dropdown-panel job-panel">
          <h4>직무를 선택하세요</h4>
          {loading ? (
            <div>로딩 중...</div>
          ) : (
            <div className="job-tree">
              {jobCategoryTree.map((category) => (
                <div key={category.id} className="job-group">
                  <div className="job-parent">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(category.id)}
                        onChange={() => handleJobSelect(category.id)}
                      />
                      <span className="job-name">{category.name}</span>
                    </label>
                  </div>
                  {category.children && category.children.length > 0 && (
                    <div className="job-children">
                      {category.children.map((child) => (
                        <label key={child.id} className="job-child">
                          <input
                            type="checkbox"
                            checked={selectedJobs.includes(child.id)}
                            onChange={() => handleJobSelect(child.id)}
                          />
                          <span>{child.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {selectedJobs.length > 0 && (
            <div className="selection-info">
              선택됨: {selectedJobs.length}개
              <button onClick={() => setSelectedJobs([])}>초기화</button>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <header className={`global-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-content">
        <div className="top-bar">
          <Link to="/" className="logo">
            <img src={logo} alt="JobHub 로고" />
          </Link>
          <nav className="nav">
            <button type="button" onClick={() => navigate("/jobs")}>
              채용정보
            </button>
            <button type="button">커뮤니티</button>
            <button type="button" onClick={handleResumeClick}>
              이력서
            </button>
            <button type="button" onClick={jobPosting}>
              공고 등록
            </button>
            <button type="button">취업툴</button>
            <button type="button">이력서 코칭 AI</button>
            {isAuthed && <span className="user-id">내 ID: {id}</span>}
            {/* 토큰에서 id 가져다쓰기 */}
          </nav>
          <div className="top-right-section">
            {isScrolled && (
              <div className="scrolled-search" ref={scrolledSearchRef}>
                <div className="search-input-wrapper-scrolled">
                  <Search size={16} color="#888" />
                  <input
                    type="text"
                    placeholder="검색"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <button
                  className="dropdown-trigger-scrolled"
                  onClick={toggleRegion}
                >
                  <MapPin size={16} />
                  <span>
                    지역{" "}
                    {selectedRegions.length > 0 &&
                      `(${selectedRegions.length})`}
                  </span>
                </button>
                <button
                  type="button"
                  className="dropdown-trigger-scrolled"
                  onClick={toggleJob}
                >
                  <Briefcase size={16} />
                  <span>
                    직무 {selectedJobs.length > 0 && `(${selectedJobs.length})`}
                  </span>
                </button>
                {renderDropdownPanels()}
              </div>
            )}
            <div className="auth-buttons">
              {isAuthed ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="cta-button logout"
                >
                  로그아웃
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="cta-button"
                >
                  시작하기
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="search-container">
          {!isExpanded ? (
            <button
              className="pre-search-button"
              onClick={() => setIsExpanded(true)}
            >
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
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="divider"></div>
              <button className="dropdown-trigger" onClick={toggleRegion}>
                <MapPin size={20} color="#888" />
                <span>
                  지역{" "}
                  {selectedRegions.length > 0 && `(${selectedRegions.length})`}
                </span>
                <ChevronDown size={16} color="#aaa" />
              </button>
              <div className="divider"></div>
              <button className="dropdown-trigger" onClick={toggleJob}>
                <Briefcase size={20} color="#888" />
                <span>
                  직무 {selectedJobs.length > 0 && `(${selectedJobs.length})`}
                </span>
                <ChevronDown size={16} color="#aaa" />
              </button>
              <button className="search-submit-button" onClick={handleSearch}>
                검색
              </button>
              {renderDropdownPanels()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default GlobalHeader;
