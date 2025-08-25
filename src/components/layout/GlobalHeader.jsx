import React, { useState, useEffect, useRef } from "react";
import "../css/GlobalHeader.css";
import logo from "../../assets/img/logo4.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Search, MapPin, Briefcase, ChevronDown, Info, Bell } from "lucide-react";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs.js";

const API_BASE_URL = "http://localhost:8080/api";
axios.defaults.withCredentials = true;

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

const DropdownPanel = ({
  dataTree,
  selectedIds,
  onSelect,
  onClose,
  type,
}) => {
  const [activeParent, setActiveParent] = useState(dataTree?.[0] || null);
  useEffect(() => {
    if (dataTree?.length > 0 && !activeParent) setActiveParent(dataTree?.[0]);
  }, [dataTree, activeParent]);

  const getSelectionCount = (parentId) => {
    const parent = dataTree?.find((p) => p.id === parentId);
    if (!parent || !parent.children) return 0;
    return parent.children.filter((child) => selectedIds.includes(child.id)).length;
  };

  const handleSelectAll = () => {
    if (!activeParent || !activeParent.children) return;
    const childIds = activeParent.children.map((c) => c.id);
    const allSelected = childIds.every((id) => selectedIds.includes(id));
    onSelect(
      allSelected
        ? selectedIds.filter((id) => !childIds.includes(id))
        : [...new Set([...selectedIds, ...childIds])]
    );
  };

  const handleChildSelect = (childId) => {
    onSelect(
      selectedIds.includes(childId)
        ? selectedIds.filter((id) => id !== childId)
        : [...selectedIds, childId]
    );
  };

  return (
    <div className={`dropdown-panel ${type}-panel`}>
      <div className="dropdown-panel-body">
        <div className="panel-left">
          {dataTree?.map((parent) => (
            <button
              key={parent.id}
              className={`panel-left-item ${activeParent?.id === parent.id ? "active" : ""}`}
              onClick={() => setActiveParent(parent)}
            >
              <span>{parent.name}</span>
              <span className="selection-count">
                {getSelectionCount(parent.id) > 0 ? getSelectionCount(parent.id) : ""}
              </span>
            </button>
          ))}
        </div>
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
                      activeParent.children.every((c) => selectedIds.includes(c.id))
                    }
                  />
                  <span className="checkmark"></span>
                  {activeParent.name} 전체
                </label>
              </div>
              <div className="panel-right-list">
                {activeParent.children?.map((child) => (
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
      <div className="dropdown-footer">
        <div className="selection-info">
          {selectedIds?.length > 0 ? (
            <>
              <Info size={16} /> <strong>{selectedIds.length}개</strong> 선택됨
            </>
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

// ## 최종 수정된 공지사항 컴포넌트 ##
const AnnouncementFeature = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const stompRef = useRef(null);
  const containerRef = useRef(null);
  
  const latestAnnouncement = announcements?.[0];

  useEffect(() => {
    const fetchInitialAnnouncements = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/announcements/latest`);
        setAnnouncements(response.data || []);
      } catch (error) {
        console.error("초기 공지사항 로드 실패:", error);
      }
    };
    fetchInitialAnnouncements();

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/announcements", (message) => {
          try {
            const newAnnouncement = JSON.parse(message.body);
            setAnnouncements(prev => [newAnnouncement, ...prev].slice(0, 10));
            if (!isModalOpen) setHasNew(true);
          } catch (e) {
            console.error("공지 메시지 파싱 오류:", e);
          }
        });
      },
    });

    client.activate();
    stompRef.current = client;

    return () => {
      if (stompRef.current) stompRef.current.deactivate();
    };
  }, [isModalOpen]);
  
  useOnClickOutside(containerRef, () => setIsModalOpen(false));

  const toggleModal = () => {
    setIsModalOpen(prev => !prev);
    if (!isModalOpen) setHasNew(false);
  };
  
  const handleNoticeClick = () => {
      navigate('/notices');
      setIsModalOpen(false);
  };

  return (
    <div className="announcement-container" ref={containerRef}>
      <button onClick={toggleModal} className="announcement-button" aria-label="공지사항">
        <Bell size={20} />
        {hasNew && <span className="new-badge"></span>}
        {latestAnnouncement && (
            <div className="announcement-text-wrapper">
                <p key={latestAnnouncement.id}>{latestAnnouncement.title}</p>
            </div>
        )}
      </button>

      {isModalOpen && (
        <div className="announcement-modal">
          <div className="modal-header">
            <h3>새로운 소식</h3>
          </div>
          <div className="modal-body">
            {announcements.length > 0 ? (
              <ul>
                {announcements.map((item) => (
                  <li key={item.id} onClick={handleNoticeClick}>
                    <span className="announcement-title">{item.title}</span>
                    <span className="announcement-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-announcements">새로운 공지사항이 없습니다.</p>
            )}
          </div>
          <div className="modal-footer">
            <button onClick={handleNoticeClick}>전체 공지 보기</button>
          </div>
        </div>
      )}
    </div>
  );
};


function GlobalHeader({ onLoginClick }) {
  const { isAuthed, user, logout } = useAuth();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrolledSearchExpanded, setScrolledSearchExpanded] = useState(false);
  const [isRegionOpen, setRegionOpen] = useState(false);
  const [isJobOpen, setJobOpen] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [regionTree, setRegionTree] = useState([]);
  const [jobCategoryTree, setJobCategoryTree] = useState([]);

  const searchContainerRef = useRef(null);
  const isAdmin = isAuthed && user?.role === "ADMIN";

  useOnClickOutside(searchContainerRef, () => {
    setRegionOpen(false);
    setJobOpen(false);
    setScrolledSearchExpanded(false);
  });

  useEffect(() => {
    const handleScroll = () => {
      const shouldBeScrolled = window.scrollY > 0;
      if (!shouldBeScrolled) {
        setScrolledSearchExpanded(false);
      }
      setIsScrolled(shouldBeScrolled);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [regionsRes, jobsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/search/regions/tree`),
          axios.get(`${API_BASE_URL}/search/job-categories/tree`),
        ]);
        setRegionTree(regionsRes.data.regions || []);
        setJobCategoryTree(jobsRes.data.categories || []);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      }
    };
    loadInitialData();
  }, []);

  const handleSearch = () => {
    const searchData = {
      keyword: searchKeyword || null,
      regionIds: selectedRegions.length > 0 ? selectedRegions : null,
      categoryIds: selectedJobs.length > 0 ? selectedJobs : null,
    };
    navigate("/jobpostinglist", { state: { searchData } });
    setIsExpanded(false);
    setRegionOpen(false);
    setJobOpen(false);
    setScrolledSearchExpanded(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleResumeClick = () => (isAuthed ? navigate("/resumes") : onLoginClick());
  const postList = () => navigate("/postlist");
  const jobPosting = () => navigate("/jobposting");

  const toggleRegion = () => {
    setRegionOpen((prev) => !prev);
    setJobOpen(false);
  };

  const toggleJob = () => {
    setJobOpen((prev) => !prev);
    setRegionOpen(false);
  };

  const showSearchContainer = !isScrolled || scrolledSearchExpanded;
  const isCompany = isAuthed && user?.userType?.toUpperCase() === 'COMPANY';

  return (
    <header className={`global-header ${isScrolled ? "scrolled" : ""} ${scrolledSearchExpanded ? "search-expanded" : ""}`}>
      <div className="header-content">
        <div className="top-bar">
          <Link to="/" className="logo">
            <img src={logo} alt="JobHub 로고" />
          </Link>
          <nav className="nav">
            <button type="button" onClick={() => navigate("/jobpostinglist")}>채용정보</button>
            <button type="button" onClick={postList}>커뮤니티</button>
            {isCompany ? (
              <button type="button" onClick={jobPosting}>공고 등록</button>
            ) : (
              <button type="button" onClick={handleResumeClick}>이력서</button>
            )}
            <button type="button">취업툴</button>
            <button type="button" onClick={() => navigate("/coaching-ai")}>이력서 코칭 AI</button>
            {isAdmin && (<button type="button" onClick={() => navigate("/admin")}>관리자</button>)}
          </nav>

          <div className="top-right-section">
            {isScrolled && !scrolledSearchExpanded && (
              <div className="scrolled-triggers">
                <button className="scrolled-trigger-btn" onClick={() => setScrolledSearchExpanded(true)}>
                  <MapPin size={15} /> 검색
                </button>
              </div>
            )}
            <AnnouncementFeature />
            <div className="auth-buttons">
              {isAuthed ? (
                <button type="button" onClick={handleLogout} className="cta-button logout">로그아웃</button>
              ) : (
                <button type="button" onClick={onLoginClick} className="cta-button">시작하기</button>
              )}
            </div>
          </div>

        </div>

        {showSearchContainer && (
          <div className="search-container" ref={searchContainerRef}>
            {!isExpanded && !isScrolled ? (
              <button className="pre-search-button" onClick={() => setIsExpanded(true)}>
                <Search size={22} />
                <span>어떤 기업을 찾고 계신가요?</span>
              </button>
            ) : (
              <div className="expanded-search">
                <div className="search-input-wrapper">
                  <label htmlFor="keyword-search"><Search size={20} color="#888" /></label>
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
                  <div><MapPin size={20} color="#888" /><span>{selectedRegions?.length > 0 ? `${selectedRegions.length}개 지역 선택됨` : "지역"}</span></div>
                  <ChevronDown size={16} color="#aaa" />
                </button>
                <div className="divider"></div>
                <button className="dropdown-trigger" onClick={toggleJob}>
                  <div><Briefcase size={20} color="#888" /><span>{selectedJobs?.length > 0 ? `${selectedJobs.length}개 직무 선택됨` : "직무"}</span></div>
                  <ChevronDown size={16} color="#aaa" />
                </button>
                <button className="search-submit-button" onClick={handleSearch}>검색</button>

                {isRegionOpen && <DropdownPanel dataTree={regionTree} selectedIds={selectedRegions} onSelect={setSelectedRegions} onClose={() => setRegionOpen(false)} type="region" />}
                {isJobOpen && <DropdownPanel dataTree={jobCategoryTree} selectedIds={selectedJobs} onSelect={setSelectedJobs} onClose={() => setJobOpen(false)} type="job" />}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default GlobalHeader;