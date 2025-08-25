// src/components/JobPostingList.jsx
 import React, { useState, useEffect } from "react";
 import { useLocation, useNavigate, Link } from "react-router-dom";

import {
  Search,
  MapPin,
  Briefcase,
  Eye,
  Building,
  Award,
  BookOpen,
  Star,
  User,
  DollarSign,
} from "lucide-react";
import "../css/JobPostingList.css";

// ==================== 검색 컴포넌트 ====================
const JobSearchBar = ({ onSearch, initialSearchData }) => {
  const [activeTab, setActiveTab] = useState("region");
  const [regions, setRegions] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);
  const [loading, setLoading] = useState({ regions: false, categories: false });
  const [error, setError] = useState({ regions: null, categories: null });

  const [searchData, setSearchData] = useState({
    keyword: "",
    region1: "",
    region2: "",
    category1: "",
    category2: "",
    ...initialSearchData, // GlobalHeader에서 전달받은 초기값 적용
  });
  const [quickFilters, setQuickFilters] = useState([]);

  // GlobalHeader에서 전달받은 초기 검색 데이터 적용
  useEffect(() => {
    if (initialSearchData) {
      setSearchData((prev) => ({
        ...prev,
        ...initialSearchData,
      }));
    }
  }, [initialSearchData]);

  // helpers: API payload → UI 구조 매핑
  const normalizeRegions = (raw) =>
    (raw ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      parentId: r.parentId ?? null,
      subRegions: (r.children ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        parentId: c.parentId ?? r.id,
      })),
    }));

  const normalizeCategories = (raw) =>
    (raw ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      parentId: c.parentId ?? null,
      subCategories: (c.children ?? []).map((sc) => ({
        id: sc.id,
        name: sc.name,
        parentId: sc.parentId ?? c.id,
      })),
    }));

  // 지역 트리 로드
  useEffect(() => {
    const fetchRegions = async () => {
      setLoading((prev) => ({ ...prev, regions: true }));
      setError((prev) => ({ ...prev, regions: null }));
      try {
        const res = await fetch(
          "http://localhost:8080/api/search/regions/tree"
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const raw = Array.isArray(payload) ? payload : payload.regions;
        setRegions(normalizeRegions(raw));
      } catch (e) {
        console.error("지역 데이터 로드 실패:", e);
        setRegions([]);
        setError((prev) => ({
          ...prev,
          regions: "지역 데이터를 불러오지 못했습니다.",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, regions: false }));
      }
    };
    fetchRegions();
  }, []);

  // 직무 트리 로드
  useEffect(() => {
    const fetchJobCategories = async () => {
      setLoading((prev) => ({ ...prev, categories: true }));
      setError((prev) => ({ ...prev, categories: null }));
      try {
        const res = await fetch(
          "http://localhost:8080/api/search/job-categories/tree"
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const raw = Array.isArray(payload) ? payload : payload.categories;
        setJobCategories(normalizeCategories(raw));
      } catch (e) {
        console.error("직무 카테고리 데이터 로드 실패:", e);
        setJobCategories([]);
        setError((prev) => ({
          ...prev,
          categories: "직무 카테고리를 불러오지 못했습니다.",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, categories: false }));
      }
    };
    fetchJobCategories();
  }, []);

  const toggleQuickFilter = (filter) => {
    setQuickFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const handleSearch = () => {
    onSearch({ ...searchData, quickFilters, activeTab });
  };

  const topRegions = (regions ?? []).filter((r) => !r.parentId);
  const selectedTopRegion = (regions ?? []).find(
    (r) => r.id === Number(searchData.region1)
  );

  const topCategories = (jobCategories ?? []).filter((c) => !c.parentId);
  const selectedTopCategory = (jobCategories ?? []).find(
    (c) => c.id === Number(searchData.category1)
  );

  return (
    <div className="search-tab-container">
      {/* 탭 */}
      <div className="search-tabs">
        <button
          className={`search-tab ${activeTab === "region" ? "active" : ""}`}
          onClick={() => setActiveTab("region")}
        >
          지역별
        </button>
        <button
          className={`search-tab ${activeTab === "job" ? "active" : ""}`}
          onClick={() => setActiveTab("job")}
        >
          직무별
        </button>
      </div>

      {/* 메인 헤더 느낌의 리본형 검색 UI */}
      <div className="search-ribbon">
        {/* 1행: 키워드 + (탭에 따라 지역 or 직무) */}
        <div className="ribbon-row">
          {/* 키워드 */}
          <div className="ribbon-cell cell--keyword">
            <div className="input-with-icon">
              <Search size={18} className="prefix-icon" />
              <input
                type="text"
                aria-label="키워드"
                placeholder="기업, 공고, 포지션 검색"
                value={searchData.keyword}
                onChange={(e) =>
                  setSearchData({ ...searchData, keyword: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          {activeTab === "region" ? (
            <>
              {/* 시/도 */}
              <div className="ribbon-cell select cell--region1">
                <MapPin size={18} className="prefix-icon" />
                <select
                  className="flat-select"
                  aria-label="시/도"
                  value={searchData.region1}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      region1: e.target.value ? Number(e.target.value) : "",
                      region2: "",
                    })
                  }
                  disabled={loading.regions || !!error.regions}
                >
                  <option value="">시/도 전체</option>
                  {topRegions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 시/군/구 */}
              <div className="ribbon-cell select cell--region2">
                <MapPin size={18} className="prefix-icon" />
                <select
                  className="flat-select"
                  aria-label="시/군/구"
                  value={searchData.region2}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      region2: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                  disabled={
                    !searchData.region1 || loading.regions || !!error.regions
                  }
                >
                  <option value="">시/군/구 전체</option>
                  {(selectedTopRegion?.subRegions ?? []).map((sr) => (
                    <option key={sr.id} value={sr.id}>
                      {sr.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* 직무 대분류 */}
              <div className="ribbon-cell select cell--cat1">
                <Briefcase size={18} className="prefix-icon" />
                <select
                  className="flat-select"
                  aria-label="직무 대분류"
                  value={searchData.category1}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      category1: e.target.value ? Number(e.target.value) : "",
                      category2: "",
                    })
                  }
                  disabled={loading.categories || !!error.categories}
                >
                  <option value="">직무 대분류</option>
                  {topCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 직무 소분류 */}
              <div className="ribbon-cell select cell--cat2">
                <Briefcase size={18} className="prefix-icon" />
                <select
                  className="flat-select"
                  aria-label="직무 소분류"
                  value={searchData.category2}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      category2: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                  disabled={
                    !searchData.category1 ||
                    loading.categories ||
                    !!error.categories
                  }
                >
                  <option value="">직무 소분류</option>
                  {(selectedTopCategory?.subCategories ?? []).map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* 2행: (탭 반대로) + 검색 버튼 */}
        <div className="ribbon-row">
          {activeTab === "region" ? (
            <>
              {/* 직무 대분류 */}
              <div className="ribbon-cell select cell--cat1">
                <Briefcase size={18} className="prefix-icon" />
                <select
                  className="flat-select"
                  aria-label="직무 대분류"
                  value={searchData.category1}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      category1: e.target.value ? Number(e.target.value) : "",
                      category2: "",
                    })
                  }
                  disabled={loading.categories || !!error.categories}
                >
                  <option value="">직무 대분류</option>
                  {topCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 직무 소분류 */}
              <div className="ribbon-cell select cell--cat2">
                <Briefcase size={18} className="prefix-icon" />
                <select
                  className="flat-select"
                  aria-label="직무 소분류"
                  value={searchData.category2}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      category2: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                  disabled={
                    !searchData.category1 ||
                    loading.categories ||
                    !!error.categories
                  }
                >
                  <option value="">직무 소분류</option>
                  {(selectedTopCategory?.subCategories ?? []).map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* 시/도 */}
              <div className="ribbon-cell select cell--region1">
                <MapPin size={18} className="prefix-icon" />
                <select
                  className="flat-select"
                  aria-label="시/도"
                  value={searchData.region1}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      region1: e.target.value ? Number(e.target.value) : "",
                      region2: "",
                    })
                  }
                  disabled={loading.regions || !!error.regions}
                >
                  <option value="">시/도 전체</option>
                  {topRegions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 시/군/구 */}
              <div className="ribbon-cell select cell--region2">
                <MapPin size={18} className="prefix-icon" />
                <select
                  className="flat-select"
                  aria-label="시/군/구"
                  value={searchData.region2}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      region2: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                  disabled={
                    !searchData.region1 || loading.regions || !!error.regions
                  }
                >
                  <option value="">시/군/구 전체</option>
                  {(selectedTopRegion?.subRegions ?? []).map((sr) => (
                    <option key={sr.id} value={sr.id}>
                      {sr.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* 검색 버튼 */}
          <div className="ribbon-cell cell--submit">
            <button
              className="search-button"
              onClick={handleSearch}
              disabled={loading.regions || loading.categories}
            >
              <Search size={18} />
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 빠른 필터 */}
      <div className="quick-filters">
        {["재택근무", "신입", "대기업", "스타트업", "연봉 6000↑", "주4일"].map(
          (filter) => (
            <button
              key={filter}
              className={`quick-filter-chip ${
                quickFilters.includes(filter) ? "active" : ""
              }`}
              onClick={() => toggleQuickFilter(filter)}
            >
              {filter}
            </button>
          )
        )}
      </div>

      {(error.regions || error.categories) && (
        <p className="error-text">{error.regions || error.categories}</p>
      )}
    </div>
  );
};

// ==================== 사이드바 필터 ====================
const JobFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    employment: [],
    experience: [],
    education: [],
    salary: [],
  });

  const handleFilterChange = (category, value) => {
    const newFilters = { ...filters };
    if (newFilters[category].includes(value)) {
      newFilters[category] = newFilters[category].filter((v) => v !== value);
    } else {
      newFilters[category].push(value);
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <aside className="sidebar-filters">
      <div className="filter-group">
        <h3 className="filter-group-title">
          <Briefcase size={16} />
          고용형태
        </h3>
        <div className="filter-options">
          {["정규직", "계약직", "인턴", "프리랜서", "파견직"].map((type) => (
            <label key={type} className="filter-checkbox">
              <input
                type="checkbox"
                onChange={() => handleFilterChange("employment", type)}
                checked={filters.employment.includes(type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-group-title">
          <Award size={16} />
          경력
        </h3>
        <div className="filter-options">
          {[
            "신입",
            "경력 1~3년",
            "경력 3~5년",
            "경력 5~10년",
            "경력 10년↑",
          ].map((exp) => (
            <label key={exp} className="filter-checkbox">
              <input
                type="checkbox"
                onChange={() => handleFilterChange("experience", exp)}
                checked={filters.experience.includes(exp)}
              />
              <span>{exp}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-group-title">
          <BookOpen size={16} />
          학력
        </h3>
        <div className="filter-options">
          {["학력무관", "고졸", "전문대졸", "대졸(4년)", "석사", "박사"].map(
            (edu) => (
              <label key={edu} className="filter-checkbox">
                <input
                  type="checkbox"
                  onChange={() => handleFilterChange("education", edu)}
                  checked={filters.education.includes(edu)}
                />
                <span>{edu}</span>
              </label>
            )
          )}
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-group-title">
          <DollarSign size={16} />
          연봉
        </h3>
        <div className="filter-options">
          {[
            "~3000",
            "3000~4000",
            "4000~5000",
            "5000~6000",
            "6000~8000",
            "8000↑",
          ].map((salary) => (
            <label key={salary} className="filter-checkbox">
              <input
                type="checkbox"
                onChange={() => handleFilterChange("salary", salary)}
                checked={filters.salary.includes(salary)}
              />
              <span>{salary}만원</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

// JobPostingList.jsx의 getJobStatusDisplay 함수 수정
const getJobStatusDisplay = (job) => {
  // 백엔드에서 이미 처리한 상태를 그대로 사용
  switch (job.status) {
    case "OPEN":
      // DEADLINE 타입이면 D-Day 표시 추가
      if (job.closeType === "DEADLINE" && job.closeDate) {
        const daysLeft = Math.ceil(
          (new Date(job.closeDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        if (daysLeft === 0) {
          return { text: "D-DAY", className: "status-dday" };
        } else if (daysLeft > 0 && daysLeft <= 7) {
          return { text: `D-${daysLeft}`, className: "status-deadline" };
        }
      }
      return { text: "채용중", className: "status-open" };
    
    case "EXPIRED":
      return { text: "마감(기간만료)", className: "status-expired" };
    
    case "CLOSED":
      return { text: "마감", className: "status-closed" };
    
    case "DRAFT":
      return null; // 리스트에 표시 안 함
    
    default:
      return { text: job.status, className: "" };
  }
};

// ==================== 채용공고 아이템 ====================
const JobItem = ({ job, onBookmark, onOpen }) => {
  const statusInfo = getJobStatusDisplay(job);
  
  // 마감 여부 확인
  const isClosed = job.status === "CLOSED" || job.status === "EXPIRED" || 
                   (statusInfo && statusInfo.text === "마감");

  return (
    <div 
      className={`job-item ${isClosed ? 'job-item-closed' : ''}`} 
      onClick={onOpen}
    >
      <div className="job-item-header">
        <div className="company-section">
          <div className="company-logo-box">
            {job.logo ? (
              <img
                src={
                  job.logo.startsWith("http")
                    ? job.logo
                    : `http://localhost:8080/api/files/view?key=${encodeURIComponent(
                        job.logo
                      )}`
                }
                alt={`${job.company} 로고`}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = job.company?.[0] ?? "";
                }}
              />
            ) : (
              <span>{job.company?.[0] ?? ""}</span>
            )}
          </div>
          <div className="company-info">
  {job.companyId ? (
    <Link to={`/companies/${job.companyId}`} className="company-name" onClick={(e) => e.stopPropagation()}>
      {job.company}
    </Link>
  ) : (
    <div className="company-name">{job.company}</div>
  )}
  <div className="job-position">
    {job.position}
    {statusInfo && statusInfo.text !== "채용중" && (
      <span className={`status-badge ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    )}
  </div>
</div>
        </div>
        <button
          className={`bookmark-button ${job.bookmarked ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(job.id);
          }}
          disabled={isClosed}
        >
          <Star size={24} fill={job.bookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="job-details">
        <span className="job-detail-item">
          <MapPin size={14} />
          {job.location || "지역 미지정"}
        </span>
        <span className="job-detail-item">
          <Briefcase size={14} />
          {job.employment || "정규직"}
        </span>
        <span className="job-detail-item">
          <BookOpen size={14} />
          {job.education || "학력무관"}
        </span>
       <span className="job-detail-item">
        <Building size={14} />
        {job.experience || "경력무관"}
        </span>
      </div>

      <div className="job-skills">
        {(job.skills ?? []).slice(0, 5).map((skill) => (
          <span key={skill} className="skill-tag">
            {skill}
          </span>
        ))}
      </div>

      <div className="job-item-footer">
        <div className="job-meta-info">
          <span className="meta-info-item">
            <Eye size={14} />
            {(job.views ?? 0).toLocaleString()}
          </span>
          <span className="meta-info-item">
            <User size={14} />
            지원 {(job.applications ?? 0).toLocaleString()}
          </span>
          {/* 마감일/상시채용 표시 */}
          
<span className={`deadline-info ${
  isClosed ? 'deadline-closed' : ''
} ${
  (job.deadline === "상시채용" || !job.closeDate) ? 'always-open' : ''
}`}>
  {job.deadline || formatDeadline(job.closeType, job.closeDate)}
</span>
        </div>
        
      </div>
    </div>
  );
};

// ==================== 메인 페이지 ====================
const JobPosting = () => {
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GlobalHeader에서 전달받은 검색 조건 처리
  const globalHeaderSearchData = location.state?.searchData;
  const initialSearchData = globalHeaderSearchData
    ? {
        keyword: globalHeaderSearchData.keyword || "",
        // GlobalHeader의 selectedRegions 배열을 UI 형태로 변환
        region1: globalHeaderSearchData.regionIds?.[0] || "",
        region2: globalHeaderSearchData.regionIds?.[1] || "",
        // GlobalHeader의 selectedJobs 배열을 UI 형태로 변환
        category1: globalHeaderSearchData.categoryIds?.[0] || "",
        category2: globalHeaderSearchData.categoryIds?.[1] || "",
      }
    : null;

  // API → UI 매핑
  const mapApiJobToUi = (j) => ({
    id: j.id,
    companyId: j.companyId,
    company: j.companyName,
    logo: j.companyLogo,
    position: j.title,
    location: (j.regions ?? [])[0] ?? "",
    experience: j.experienceLevel
      ? mapExperienceLevel(j.experienceLevel)
      : "경력무관",
    education: j.educationLevel
      ? mapEducationLevel(j.educationLevel)
      : "학력무관",
    employment: j.employmentType
      ? mapEmploymentType(j.employmentType)
      : "정규직",
    salary: formatSalary(j.minSalary, j.maxSalary, j.salaryType),
    skills: j.skills ?? [],
    status: j.status ?? "OPEN",
    closeType: j.closeType, // ✅ closeType 추가
    closeDate: j.closeDate,
    deadline: formatDeadline(j.closeType, j.closeDate),
    views: j.viewCount ?? 0,
    applications: j.applicationCount ?? 0,
    isNew:
      !!j.createdAt &&
      Date.now() - new Date(j.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7,
    bookmarked: false,
  });


  const mapExperienceLevel = (level) => {
    const map = {
      ENTRY: "신입",
      JUNIOR: "주니어",
      MID: "미들",
      SENIOR: "시니어",
      LEAD: "리드",
      EXECUTIVE: "임원",
    };
    return map[level] || level || "경력무관";
  };

  const mapEducationLevel = (level) => {
    const map = {
      ANY: "학력무관",
      HIGH_SCHOOL: "고졸",
      COLLEGE: "전문대졸",
      UNIVERSITY: "대졸",
      MASTER: "석사",
      PHD: "박사",
    };
    return map[level] || level || "학력무관";
  };

  const mapEmploymentType = (type) => {
    const map = {
      FULLTIME: "정규직",
      CONTRACT: "계약직",
      INTERN: "인턴",
      PARTTIME: "파트타임",
      FREELANCE: "프리랜서",
    };
    return map[type] || type || "정규직";
  };

  const formatSalary = (min, max, type) => {
    if (!min && !max) return "회사내규";
    if (type === "NEGOTIABLE") return "면접 후 협의";

    const formatNum = (n) => Math.floor(n / 10000);
    if (min && max) return `${formatNum(min)}~${formatNum(max)}만원 `;
    if (min) return `${formatNum(min)}만원 이상`;
    if (max) return `~${formatNum(max)}만원`;
    return "회사내규";
  };

  const formatDeadline = (closeType, closeDate) => {
  if (closeType === "CONTINUOUS" || closeType === "continuous") return "상시채용";
  if (closeType === "UNTIL_FILLED" || closeType === "until_filled") return "충원시까지";
  if (closeType === "PERIODIC" || closeType === "periodic") return "주기적 채용";
  
  if (closeDate) {
    // 날짜가 있으면 포맷팅
    try {
      const date = new Date(closeDate);
      if (!isNaN(date.getTime())) {
        return `~ ${date.toISOString().substring(0, 10)}`;
      }
    } catch (e) {
      console.error("날짜 파싱 오류:", e);
    }
  }
  
  // 날짜가 없거나 파싱 실패시 상시채용
  return "상시채용";
};

  // 초기 로드 함수
   const handleInitialLoad = async () => {
    const body = {
      keyword: null,
      regionIds: [],
      categoryIds: [],
      employmentType: null,
      experienceLevel: null,
      minSalary: null,
      maxSalary: null,
      isRemote: null,
      sortBy: "latest",
      page: 0,
      size: 20,
    };

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8080/api/search/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const page = await res.json();
      const list = (page.content ?? []).map(mapApiJobToUi);

      // DRAFT 상태 필터링 (백엔드에서 이미 처리되지만 안전장치)
      const activeJobs = list.filter(
        (job) => job.status !== "DRAFT" && job.status !== "draft"
      );

      setJobs(activeJobs);
      setFilteredJobs(activeJobs);
    } catch (e) {
      console.error("초기 데이터 로드 실패:", e);
      setJobs([]);
      setFilteredJobs([]);
      setError("채용공고를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };
  // GlobalHeader에서 전달받은 검색 조건으로 검색
  const handleGlobalHeaderSearch = async (searchData) => {
    console.log("GlobalHeader 검색 데이터:", searchData);

    const body = {
      keyword: searchData.keyword || null,
      regionIds: searchData.regionIds || [],
      categoryIds: searchData.categoryIds || [],
      employmentType: undefined,
      experienceLevel: undefined,
      minSalary: undefined,
      maxSalary: undefined,
      isRemote: undefined,
      sortBy: "latest",
      page: 0,
      size: 20,
    };

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8080/api/search/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const page = await res.json();
      const list = (page.content ?? []).map(mapApiJobToUi);
      setJobs(list);
      setFilteredJobs(list);
    } catch (e) {
      console.error("검색 실패:", e);
      setJobs([]);
      setFilteredJobs([]);
      setError("채용공고를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 처리
  useEffect(() => {
    if (globalHeaderSearchData) {
      // GlobalHeader에서 온 경우 해당 조건으로 검색
      handleGlobalHeaderSearch(globalHeaderSearchData);
    } else {
      // 직접 접근한 경우 초기 데이터 로드
      handleInitialLoad();
    }
  }, [location.state]);

  // 검색 처리(백엔드 호출)
  const handleSearch = async (searchParams) => {
    console.log("검색 파라미터:", searchParams);

    const regionIds = [];
    if (searchParams.region2) regionIds.push(Number(searchParams.region2));
    else if (searchParams.region1) regionIds.push(Number(searchParams.region1));

    const categoryIds = [];
    if (searchParams.category2)
      categoryIds.push(Number(searchParams.category2));
    else if (searchParams.category1)
      categoryIds.push(Number(searchParams.category1));

    const body = {
      keyword:
        searchParams.keyword && searchParams.keyword.trim()
          ? searchParams.keyword.trim()
          : null,
      regionIds: regionIds.length > 0 ? regionIds : null,
      categoryIds: categoryIds.length > 0 ? categoryIds : null,
      employmentType: null,
      experienceLevel: null,
      minSalary: null,
      maxSalary: null,
      isRemote: searchParams.quickFilters?.includes("재택근무") ? true : null,
      sortBy: "latest",
      page: 0,
      size: 20,
    };

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8080/api/search/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const page = await res.json();
      const list = (page.content ?? []).map(mapApiJobToUi);

      // ✅ 오류 수정: filterDraftPostings 함수 대신 직접 필터링
      const activeJobs = list.filter(
        (job) => job.status !== "DRAFT" && job.status !== "draft"
      );

      setJobs(activeJobs);
      setFilteredJobs(activeJobs);
    } catch (e) {
      console.error("검색 실패:", e);
      setJobs([]);
      setFilteredJobs([]);
      setError("채용공고를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 북마크 토글
  const toggleBookmark = (jobId) => {
    const updated = jobs.map((job) =>
      job.id === jobId ? { ...job, bookmarked: !job.bookmarked } : job
    );
    setJobs(updated);
    setFilteredJobs(updated);
  };

  // 정렬 처리
  const handleSort = (e) => {
    const sortType = e.target.value;
    setSortBy(sortType);

    let sorted = [...filteredJobs];
    switch (sortType) {
      case "latest":
        sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      case "views":
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "applications":
        sorted.sort((a, b) => (b.applications || 0) - (a.applications || 0));
        break;
      case "deadline":
        sorted.sort((a, b) => {
          const dateA =
            a.deadline === "상시채용"
              ? new Date("9999-12-31")
              : new Date(a.deadline || "9999-12-31");
          const dateB =
            b.deadline === "상시채용"
              ? new Date("9999-12-31")
              : new Date(b.deadline || "9999-12-31");
          return dateA - dateB;
        });
        break;
      case "salary":
        sorted.sort((a, b) => (b.salary || "").localeCompare(a.salary || ""));
        break;
      default:
        break;
    }
    setFilteredJobs(sorted);
  };

  const navigate = useNavigate();

  //디테일페이지 이동
  const openDetail = React.useCallback(
    (jobId) => {
      if (!jobId) return;
      navigate(`/jobpostinglist/${jobId}`);
    },
    [navigate]
  );

  return (
    <div className="job-posting-container">
      <div className="job-posting-header">
        <div className="job-posting-inner">
          <h1 className="header-title">채용정보</h1>
          <JobSearchBar
            onSearch={handleSearch}
            initialSearchData={initialSearchData}
          />
        </div>
      </div>

      <div className="job-content-area">
        <JobFilters onFilterChange={() => {}} />

        <div className="job-list-container">
          <div className="job-list-header">
            <p className="job-count">
              총 <strong>{filteredJobs.length.toLocaleString()}</strong>건
            </p>
            <select
              className="sort-select"
              value={sortBy}
              onChange={handleSort}
            >
              <option value="latest">최신순</option>
              <option value="deadline">마감임박순</option>
              <option value="views">조회순</option>
              <option value="applications">지원자순</option>
              <option value="salary">연봉높은순</option>
            </select>
          </div>

          {loading && <p className="loading-text">불러오는 중...</p>}
          {error && !loading && <p className="error-text">{error}</p>}
          {!loading && !error && filteredJobs.length === 0 && (
            <p className="empty-text">
              표시할 채용공고가 없습니다. 검색해 보세요.
            </p>
          )}

          {filteredJobs.map((job) => (
            <JobItem
              key={job.id}
              job={job}
              onBookmark={toggleBookmark}
              onOpen={() => openDetail(job.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobPosting;
