// src/components/JobPostingList.jsx
import React, { useState, useEffect } from 'react';
import {
  Search, MapPin, Briefcase, Eye, Building2, Award, BookOpen, Star, User, DollarSign
} from 'lucide-react';
import '../css/JobPostingList.css';

// ==================== 검색 컴포넌트 ====================
const JobSearchBar = ({ onSearch }) => {
  const [activeTab, setActiveTab] = useState('region');
  const [regions, setRegions] = useState([]);             // [{ id, name, parentId, subRegions: [{id, name}] }]
  const [jobCategories, setJobCategories] = useState([]); // [{ id, name, parentId, subCategories: [{id, name}] }]
  const [loading, setLoading] = useState({ regions: false, categories: false });
  const [error, setError] = useState({ regions: null, categories: null });

  const [searchData, setSearchData] = useState({
    keyword: '',
    region1: '',
    region2: '',
    category1: '',
    category2: ''
  });
  const [quickFilters, setQuickFilters] = useState([]);

  // helpers: API payload → UI 구조 매핑
  const normalizeRegions = (raw) =>
    (raw ?? []).map(r => ({
      id: r.id,
      name: r.name,
      parentId: r.parentId ?? null,
      subRegions: (r.children ?? []).map(c => ({
        id: c.id,
        name: c.name,
        parentId: c.parentId ?? r.id
      }))
    }));

  const normalizeCategories = (raw) =>
    (raw ?? []).map(c => ({
      id: c.id,
      name: c.name,
      parentId: c.parentId ?? null,
      subCategories: (c.children ?? []).map(sc => ({
        id: sc.id,
        name: sc.name,
        parentId: sc.parentId ?? c.id
      }))
    }));

  // 지역 트리 로드
  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(prev => ({ ...prev, regions: true }));
      setError(prev => ({ ...prev, regions: null }));
      try {
        const res = await fetch('http://localhost:8080/api/search/regions/tree');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json(); // { regions: [...] } or [...]
        const raw = Array.isArray(payload) ? payload : payload?.regions;
        setRegions(normalizeRegions(raw));
      } catch (e) {
        console.error('지역 데이터 로드 실패:', e);
        setRegions([]);
        setError(prev => ({ ...prev, regions: '지역 데이터를 불러오지 못했습니다.' }));
      } finally {
        setLoading(prev => ({ ...prev, regions: false }));
      }
    };
    fetchRegions();
  }, []);

  // 직무 트리 로드
  useEffect(() => {
    const fetchJobCategories = async () => {
      setLoading(prev => ({ ...prev, categories: true }));
      setError(prev => ({ ...prev, categories: null }));
      try {
        const res = await fetch('http://localhost:8080/api/search/job-categories/tree');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json(); // { categories: [...] } or [...]
        const raw = Array.isArray(payload) ? payload : payload?.categories;
        setJobCategories(normalizeCategories(raw));
      } catch (e) {
        console.error('직무 카테고리 데이터 로드 실패:', e);
        setJobCategories([]);
        setError(prev => ({ ...prev, categories: '직무 카테고리를 불러오지 못했습니다.' }));
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };
    fetchJobCategories();
  }, []);

  const toggleQuickFilter = (filter) => {
    setQuickFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  // 🔸 여기서는 부모로 검색 조건만 전달함
  const runSearch = () => {
    onSearch({ ...searchData, quickFilters, activeTab });
  };

  const topRegions = (regions ?? []).filter(r => !r.parentId);
  const selectedTopRegion = (regions ?? []).find(r => r.id === Number(searchData.region1));

  const topCategories = (jobCategories ?? []).filter(c => !c.parentId);
  const selectedTopCategory = (jobCategories ?? []).find(c => c.id === Number(searchData.category1));

  return (
    <div className="search-tab-container">
      {/* 탭 */}
      <div className="search-tabs">
        <button
          className={`search-tab ${activeTab === 'region' ? 'active' : ''}`}
          onClick={() => setActiveTab('region')}
        >
          지역별
        </button>
        <button
          className={`search-tab ${activeTab === 'job' ? 'active' : ''}`}
          onClick={() => setActiveTab('job')}
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
                onChange={(e) => setSearchData({ ...searchData, keyword: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              />
            </div>
          </div>

          {activeTab === 'region' ? (
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
                      region1: e.target.value ? Number(e.target.value) : '',
                      region2: ''
                    })
                  }
                  disabled={loading.regions || !!error.regions}
                >
                  <option value="">시/도 전체</option>
                  {topRegions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
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
                      region2: e.target.value ? Number(e.target.value) : ''
                    })
                  }
                  disabled={!searchData.region1 || loading.regions || !!error.regions}
                >
                  <option value="">시/군/구 전체</option>
                  {(selectedTopRegion?.subRegions ?? []).map(sr => (
                    <option key={sr.id} value={sr.id}>{sr.name}</option>
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
                      category1: e.target.value ? Number(e.target.value) : '',
                      category2: ''
                    })
                  }
                  disabled={loading.categories || !!error.categories}
                >
                  <option value="">직무 대분류</option>
                  {topCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                      category2: e.target.value ? Number(e.target.value) : ''
                    })
                  }
                  disabled={!searchData.category1 || loading.categories || !!error.categories}
                >
                  <option value="">직무 소분류</option>
                  {(selectedTopCategory?.subCategories ?? []).map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* 2행: (탭 반대로) + 검색 버튼 */}
        <div className="ribbon-row">
          {activeTab === 'region' ? (
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
                      category1: e.target.value ? Number(e.target.value) : '',
                      category2: ''
                    })
                  }
                  disabled={loading.categories || !!error.categories}
                >
                  <option value="">직무 대분류</option>
                  {topCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                      category2: e.target.value ? Number(e.target.value) : ''
                    })
                  }
                  disabled={!searchData.category1 || loading.categories || !!error.categories}
                >
                  <option value="">직무 소분류</option>
                  {(selectedTopCategory?.subCategories ?? []).map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.name}</option>
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
                      region1: e.target.value ? Number(e.target.value) : '',
                      region2: ''
                    })
                  }
                  disabled={loading.regions || !!error.regions}
                >
                  <option value="">시/도 전체</option>
                  {topRegions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
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
                      region2: e.target.value ? Number(e.target.value) : ''
                    })
                  }
                  disabled={!searchData.region1 || loading.regions || !!error.regions}
                >
                  <option value="">시/군/구 전체</option>
                  {(selectedTopRegion?.subRegions ?? []).map(sr => (
                    <option key={sr.id} value={sr.id}>{sr.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* 검색 버튼 */}
          <div className="ribbon-cell cell--submit">
            <button
              className="search-button"
              onClick={runSearch}
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
        {['재택근무', '신입', '대기업', '스타트업', '연봉 6000↑', '주4일'].map(filter => (
          <button
            key={filter}
            className={`quick-filter-chip ${quickFilters.includes(filter) ? 'active' : ''}`}
            onClick={() => toggleQuickFilter(filter)}
          >
            {filter}
          </button>
        ))}
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
    salary: []
  });

  const handleFilterChange = (category, value) => {
    const newFilters = { ...filters };
    if (newFilters[category].includes(value)) {
      newFilters[category] = newFilters[category].filter(v => v !== value);
    } else {
      newFilters[category].push(value);
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <aside className="sidebar-filters">
      <div className="filter-group">
        <h3 className="filter-group-title"><Briefcase size={16} />고용형태</h3>
        <div className="filter-options">
          {['정규직', '계약직', '인턴', '프리랜서', '파견직'].map(type => (
            <label key={type} className="filter-checkbox">
              <input
                type="checkbox"
                onChange={() => handleFilterChange('employment', type)}
                checked={filters.employment.includes(type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-group-title"><Award size={16} />경력</h3>
        <div className="filter-options">
          {['신입', '경력 1~3년', '경력 3~5년', '경력 5~10년', '경력 10년↑'].map(exp => (
            <label key={exp} className="filter-checkbox">
              <input
                type="checkbox"
                onChange={() => handleFilterChange('experience', exp)}
                checked={filters.experience.includes(exp)}
              />
              <span>{exp}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-group-title"><BookOpen size={16} />학력</h3>
        <div className="filter-options">
          {['학력무관', '고졸', '전문대졸', '대졸(4년)', '석사', '박사'].map(edu => (
            <label key={edu} className="filter-checkbox">
              <input
                type="checkbox"
                onChange={() => handleFilterChange('education', edu)}
                checked={filters.education.includes(edu)}
              />
              <span>{edu}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-group-title"><DollarSign size={16} />연봉</h3>
        <div className="filter-options">
          {['~3000', '3000~4000', '4000~5000', '5000~6000', '6000~8000', '8000↑'].map(salary => (
            <label key={salary} className="filter-checkbox">
              <input
                type="checkbox"
                onChange={() => handleFilterChange('salary', salary)}
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

// ==================== 채용공고 아이템 ====================
const JobItem = ({ job, onBookmark }) => (
  <div className="job-item">
    <div className="job-item-header">
      <div className="company-section">
        <div className="company-logo-box">{job.logo ?? (job.companyName?.[0] ?? '')}</div>
        <div className="company-info">
          <div className="company-name">{job.company}</div>
          <div className="job-position">
            {job.position}
            {job.isNew && <span className="new-label">NEW</span>}
          </div>
        </div>
      </div>
      <button
        className={`bookmark-button ${job.bookmarked ? 'active' : ''}`}
        onClick={() => onBookmark(job.id)}
      >
        <Star size={24} fill={job.bookmarked ? 'currentColor' : 'none'} />
      </button>
    </div>

    <div className="job-details">
      <span className="job-detail-item"><MapPin size={14} />{job.location}</span>
      <span className="job-detail-item"><Briefcase size={14} />{job.experience ?? ''}</span>
      <span className="job-detail-item"><BookOpen size={14} />{job.education ?? ''}</span>
      <span className="job-detail-item"><Building2 size={14} />{job.employment ?? ''}</span>
    </div>

    <div className="job-skills">
      {(job.skills ?? []).map(skill => <span key={skill} className="skill-tag">{skill}</span>)}
    </div>

    <div className="job-item-footer">
      <div className="job-meta-info">
        <span className="meta-info-item"><Eye size={14} />{(job.views ?? 0).toLocaleString()}</span>
        <span className="meta-info-item"><User size={14} />지원 {job.applications ?? 0}</span>
        {job.deadline && job.deadline !== '상시채용' && (
          <span className="deadline-warning">{job.deadline}</span>
        )}
      </div>
      <div className="salary-badge">{job.salary ?? ''}</div>
    </div>
  </div>
);

// ==================== 메인 페이지 ====================
const JobPostingList = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [sortBy, setSortBy] = useState('latest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API → UI 매핑
  const mapApiJobToUi = (j) => ({
    id: j.id,
    company: j.companyName,
    logo: j.companyLogo,
    position: j.title,
    location: (j.regions ?? [])[0] ?? '',
    experience: j.experienceLevel ?? '',
    education: j.education ?? '',
    employment: j.employmentType ?? '',
    salary: j.salaryLabel ?? '',
    skills: j.skills ?? [],
    deadline: j.closeType === '상시' ? '상시채용' : (j.closeDate ? `~ ${j.closeDate.substring(0,10)}` : ''),
    views: j.viewCount ?? 0,
    applications: j.applicationCount ?? 0,
    createdAt: j.createdAt ?? null, // 정렬에 사용
    isNew: !!j.createdAt && (Date.now() - new Date(j.createdAt).getTime()) < 1000 * 60 * 60 * 24 * 7,
    bookmarked: false,
  });

  // 검색 처리(백엔드 호출) — 🔸 부모에서만 네트워크 호출
  const handleSearch = async (searchParams) => {
    const regionIds = [];
    if (searchParams.region2) regionIds.push(Number(searchParams.region2));
    else if (searchParams.region1) regionIds.push(Number(searchParams.region1));

    const categoryIds = [];
    if (searchParams.category2) categoryIds.push(Number(searchParams.category2));
    else if (searchParams.category1) categoryIds.push(Number(searchParams.category1));

    const params = new URLSearchParams();
    if (searchParams.keyword) params.set("keyword", searchParams.keyword);
    regionIds.forEach(id => params.append("regionIds", id));
    categoryIds.forEach(id => params.append("categoryIds", id));
    if (searchParams.quickFilters?.includes("재택근무")) params.set("isRemote", "true");
    params.set("sortBy", "latest");
    params.set("page", "0");
    params.set("size", "20");

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/search/jobs?${params.toString()}`, {
        method: "GET",
        credentials: "include", // 세션/쿠키 기반이면 필요(손현정 추가)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const page = await res.json(); // Spring Page<JobSearchResponseDto>
      const list = (page.content ?? []).map(mapApiJobToUi);
      setJobs(list);
      setFilteredJobs(list);
    } catch (e) {
      console.error('검색 실패:', e);
      setJobs([]);
      setFilteredJobs([]);
      setError('채용공고를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 북마크 토글
  const toggleBookmark = (jobId) => {
    const updated = jobs.map(job =>
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
      case 'latest':
        sorted.sort((a, b) => (new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) || (b.id - a.id));
        break;
      case 'views':
        sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
        break;
      case 'applications':
        sorted.sort((a, b) => (b.applications ?? 0) - (a.applications ?? 0));
        break;
      default:
        break;
    }
    setFilteredJobs(sorted);
  };

  return (
    <div className="job-posting-container">
      <div className="job-posting-header">
        <div className="job-posting-inner">
          <h1 className="header-title">채용정보</h1>
          <JobSearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="job-content-area">
        <JobFilters onFilterChange={() => {}} />

        <div className="job-list-container">
          <div className="job-list-header">
            <p className="job-count">
              총 <strong>{filteredJobs.length.toLocaleString()}</strong>건
            </p>
            <select className="sort-select" value={sortBy} onChange={handleSort}>
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
            <p className="empty-text">표시할 채용공고가 없습니다. 검색해 보세요.</p>
          )}

          {filteredJobs.map(job => (
            <JobItem
              key={job.id}
              job={job}
              onBookmark={toggleBookmark}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobPostingList;
