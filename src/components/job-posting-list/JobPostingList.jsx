
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Clock, Users, DollarSign, Calendar, BookOpen, ChevronRight, Filter, Star, Eye, Building2, Award, ChevronDown, User, Home } from 'lucide-react';
import '../css/JobPostingList.css';

// ==================== 더미 채용공고 데이터 ====================
const dummyJobs = [
  {
    id: 1,
    company: '네이버',
    logo: 'N',
    position: 'React 프론트엔드 개발자',
    location: '경기 성남시',
    experience: '경력 3~7년',
    education: '학사 이상',
    employment: '정규직',
    salary: '6,000~8,000만원',
    skills: ['React', 'TypeScript', 'Next.js', 'Redux', 'Jest'],
    deadline: 'D-7',
    views: 2453,
    applications: 89,
    isNew: true,
    bookmarked: false
  },
  {
    id: 2,
    company: '카카오',
    logo: 'K',
    position: 'Java 백엔드 개발자 (커머스 플랫폼)',
    location: '경기 성남시',
    experience: '경력 5년 이상',
    education: '학사 이상',
    employment: '정규직',
    salary: '7,000만원~1억',
    skills: ['Java', 'Spring Boot', 'MySQL', 'AWS', 'Kafka'],
    deadline: '상시채용',
    views: 3892,
    applications: 156,
    isNew: false,
    bookmarked: false
  },
  {
    id: 3,
    company: '토스',
    logo: 'T',
    position: '풀스택 개발자 (Node.js/React)',
    location: '서울 강남구',
    experience: '경력 2~5년',
    education: '학사 이상',
    employment: '정규직',
    salary: '5,000~7,000만원',
    skills: ['Node.js', 'React', 'TypeScript', 'PostgreSQL', 'GraphQL'],
    deadline: 'D-14',
    views: 1876,
    applications: 67,
    isNew: true,
    bookmarked: false
  },
  {
    id: 4,
    company: '쿠팡',
    logo: 'C',
    position: 'DevOps 엔지니어',
    location: '서울 송파구',
    experience: '경력 3년 이상',
    education: '무관',
    employment: '정규직',
    salary: '협의 후 결정',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins'],
    deadline: 'D-21',
    views: 1234,
    applications: 43,
    isNew: false,
    bookmarked: true
  },
  {
    id: 5,
    company: '배달의민족',
    logo: 'B',
    position: 'iOS 개발자',
    location: '서울 송파구',
    experience: '경력 3~5년',
    education: '학사 이상',
    employment: '정규직',
    salary: '5,500~7,500만원',
    skills: ['Swift', 'iOS', 'RxSwift', 'MVVM', 'UIKit'],
    deadline: 'D-10',
    views: 987,
    applications: 34,
    isNew: true,
    bookmarked: false
  },
  {
    id: 6,
    company: '라인',
    logo: 'L',
    position: '데이터 엔지니어',
    location: '경기 성남시',
    experience: '경력 4년 이상',
    education: '학사 이상',
    employment: '정규직',
    salary: '6,500~9,000만원',
    skills: ['Python', 'Spark', 'Hadoop', 'Airflow', 'BigQuery'],
    deadline: '상시채용',
    views: 2100,
    applications: 78,
    isNew: false,
    bookmarked: false
  }
];

// ==================== 검색 컴포넌트 ====================
const JobSearchBar = ({ onSearch }) => {
  const [activeTab, setActiveTab] = useState('region');
  const [regions, setRegions] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);
  const [searchData, setSearchData] = useState({
    region1: '',
    region2: '',
    category1: '',
    category2: '',
    keyword: ''
  });
  const [quickFilters, setQuickFilters] = useState([]);

  // DB에서 지역 데이터 가져오기
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch('http://localhost:8080/search/regions');
        const data = await response.json();
        setRegions(data);
      } catch (error) {
        console.error('지역 데이터 로드 실패:', error);
        // 백엔드 연결 실패시 기본 데이터 사용
        setRegions([
          { id: 1, name: '서울', parentId: null, subRegions: [
            { id: 101, name: '강남구' }, { id: 102, name: '강동구' }, { id: 103, name: '강북구' },
            { id: 104, name: '강서구' }, { id: 105, name: '관악구' }, { id: 106, name: '광진구' }
          ]},
          { id: 2, name: '경기', parentId: null, subRegions: [
            { id: 201, name: '수원시' }, { id: 202, name: '성남시' }, { id: 203, name: '안양시' },
            { id: 204, name: '부천시' }, { id: 205, name: '광명시' }, { id: 206, name: '용인시' }
          ]},
          { id: 3, name: '인천', parentId: null, subRegions: [
            { id: 301, name: '중구' }, { id: 302, name: '동구' }, { id: 303, name: '연수구' },
            { id: 304, name: '남동구' }, { id: 305, name: '부평구' }, { id: 306, name: '계양구' }
          ]}
        ]);
      }
    };
    fetchRegions();
  }, []);

  // DB에서 직무 카테고리 데이터 가져오기
  useEffect(() => {
    const fetchJobCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/search/job-categories');
        const data = await response.json();
        setJobCategories(data);
      } catch (error) {
        console.error('직무 카테고리 데이터 로드 실패:', error);
        // 백엔드 연결 실패시 기본 데이터 사용
        setJobCategories([
          { id: 1, name: 'IT/개발', parentId: null, subCategories: [
            { id: 101, name: '백엔드 개발' }, { id: 102, name: '프론트엔드 개발' },
            { id: 103, name: '풀스택 개발' }, { id: 104, name: '모바일 개발' },
            { id: 105, name: 'DevOps' }, { id: 106, name: '데이터 엔지니어' }
          ]},
          { id: 2, name: '디자인', parentId: null, subCategories: [
            { id: 201, name: 'UI/UX 디자인' }, { id: 202, name: '그래픽 디자인' },
            { id: 203, name: '웹 디자인' }, { id: 204, name: '모바일 디자인' }
          ]},
          { id: 3, name: '마케팅', parentId: null, subCategories: [
            { id: 301, name: '디지털 마케팅' }, { id: 302, name: '콘텐츠 마케팅' },
            { id: 303, name: '퍼포먼스 마케팅' }, { id: 304, name: '브랜드 마케팅' }
          ]}
        ]);
      }
    };
    fetchJobCategories();
  }, []);

  const toggleQuickFilter = (filter) => {
    setQuickFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleSearch = () => {
    onSearch({ ...searchData, quickFilters, activeTab });
  };

  return (
    <div className="search-tab-container">
      {/* 탭 버튼 */}
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

      {/* 검색 필드 */}
      <div className="search-fields">
        {activeTab === 'region' ? (
          <>
            <div className="search-field-group">
              <label className="search-label">시/도</label>
              <select 
                className="search-select"
                value={searchData.region1}
                onChange={(e) => setSearchData({...searchData, region1: e.target.value, region2: ''})}
              >
                <option value="">전체</option>
                {regions.filter(r => !r.parentId).map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
            <div className="search-field-group">
              <label className="search-label">시/구/군</label>
              <select 
                className="search-select"
                value={searchData.region2}
                onChange={(e) => setSearchData({...searchData, region2: e.target.value})}
                disabled={!searchData.region1}
              >
                <option value="">전체</option>
                {searchData.region1 && 
                  regions.find(r => r.id === parseInt(searchData.region1))?.subRegions?.map(subRegion => (
                    <option key={subRegion.id} value={subRegion.id}>{subRegion.name}</option>
                  ))
                }
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="search-field-group">
              <label className="search-label">직무 대분류</label>
              <select 
                className="search-select"
                value={searchData.category1}
                onChange={(e) => setSearchData({...searchData, category1: e.target.value, category2: ''})}
              >
                <option value="">전체</option>
                {jobCategories.filter(c => !c.parentId).map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="search-field-group">
              <label className="search-label">직무 소분류</label>
              <select 
                className="search-select"
                value={searchData.category2}
                onChange={(e) => setSearchData({...searchData, category2: e.target.value})}
                disabled={!searchData.category1}
              >
                <option value="">전체</option>
                {searchData.category1 && 
                  jobCategories.find(c => c.id === parseInt(searchData.category1))?.subCategories?.map(subCategory => (
                    <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>
                  ))
                }
              </select>
            </div>
          </>
        )}
        <button className="search-button" onClick={handleSearch}>
          <Search size={20} />
          검색
        </button>
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
    </div>
  );
};

// ==================== 사이드바 필터 컴포넌트 ====================
const JobFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    employment: [],
    experience: [],
    education: [],
    salary: []
  });

  const handleFilterChange = (category, value) => {
    const newFilters = {...filters};
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
        <h3 className="filter-group-title">
          <Briefcase size={16} />
          고용형태
        </h3>
        <div className="filter-options">
          {['정규직', '계약직', '인턴', '프리랜서', '파견직'].map(type => (
            <label key={type} className="filter-checkbox">
              <input 
                type="checkbox"
                checked={filters.employment.includes(type)}
                onChange={() => handleFilterChange('employment', type)}
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
          {['신입', '경력 1~3년', '경력 3~5년', '경력 5~10년', '경력 10년↑'].map(exp => (
            <label key={exp} className="filter-checkbox">
              <input 
                type="checkbox"
                checked={filters.experience.includes(exp)}
                onChange={() => handleFilterChange('experience', exp)}
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
          {['학력무관', '고졸', '전문대졸', '대졸(4년)', '석사', '박사'].map(edu => (
            <label key={edu} className="filter-checkbox">
              <input 
                type="checkbox"
                checked={filters.education.includes(edu)}
                onChange={() => handleFilterChange('education', edu)}
              />
              <span>{edu}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-group-title">
          <DollarSign size={16} />
          연봉
        </h3>
        <div className="filter-options">
          {['~3000', '3000~4000', '4000~5000', '5000~6000', '6000~8000', '8000↑'].map(salary => (
            <label key={salary} className="filter-checkbox">
              <input 
                type="checkbox"
                checked={filters.salary.includes(salary)}
                onChange={() => handleFilterChange('salary', salary)}
              />
              <span>{salary}만원</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

// ==================== 채용공고 아이템 컴포넌트 ====================
const JobItem = ({ job, onBookmark }) => {
  return (
    <div className="job-item">
      <div className="job-item-header">
        <div className="company-section">
          <div className="company-logo-box">
            {job.logo}
          </div>
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
        <span className="job-detail-item">
          <MapPin size={14} />
          {job.location}
        </span>
        <span className="job-detail-item">
          <Briefcase size={14} />
          {job.experience}
        </span>
        <span className="job-detail-item">
          <BookOpen size={14} />
          {job.education}
        </span>
        <span className="job-detail-item">
          <Building2 size={14} />
          {job.employment}
        </span>
      </div>

      <div className="job-skills">
        {job.skills.map(skill => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>

      <div className="job-item-footer">
        <div className="job-meta-info">
          <span className="meta-info-item">
            <Eye size={14} />
            {job.views.toLocaleString()}
          </span>
          <span className="meta-info-item">
            <User size={14} />
            지원 {job.applications}
          </span>
          {job.deadline !== '상시채용' && (
            <span className="deadline-warning">{job.deadline}</span>
          )}
        </div>
        <div className="salary-badge">
          {job.salary}
        </div>
      </div>
    </div>
  );
};

// ==================== 메인 페이지 컴포넌트 ====================
const JobPosting = () => {
  const [jobs, setJobs] = useState(dummyJobs);
  const [filteredJobs, setFilteredJobs] = useState(dummyJobs);
  const [sortBy, setSortBy] = useState('latest');

  // 검색 처리
  const handleSearch = async (searchParams) => {
    console.log('검색 파라미터:', searchParams);
    
    // 백엔드 API 호출
    /*
    try {
      const response = await fetch('http://localhost:8080/search/job-postings/search?' + 
        new URLSearchParams(searchParams));
      const data = await response.json();
      setFilteredJobs(data);
    } catch (error) {
      console.error('검색 실패:', error);
    }
    */
    
    // 현재는 더미데이터 그대로 사용
    setFilteredJobs(jobs);
  };

  // 필터 변경 처리
  const handleFilterChange = (filters) => {
    console.log('필터 변경:', filters);
    // 필터링 로직 구현
    let filtered = [...jobs];
    
    // 필터 적용 로직 (예시)
    if (filters.employment.length > 0) {
      filtered = filtered.filter(job => 
        filters.employment.includes(job.employment)
      );
    }
    
    setFilteredJobs(filtered);
  };

  // 북마크 토글
  const toggleBookmark = (jobId) => {
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? { ...job, bookmarked: !job.bookmarked } : job
    );
    setJobs(updatedJobs);
    setFilteredJobs(updatedJobs);
  };

  // 정렬 처리
  const handleSort = (e) => {
    const sortType = e.target.value;
    setSortBy(sortType);
    
    let sorted = [...filteredJobs];
    switch(sortType) {
      case 'latest':
        sorted.sort((a, b) => b.id - a.id);
        break;
      case 'views':
        sorted.sort((a, b) => b.views - a.views);
        break;
      case 'applications':
        sorted.sort((a, b) => b.applications - a.applications);
        break;
      default:
        break;
    }
    setFilteredJobs(sorted);
  };

  return (
    <div className="job-posting-container">
      {/* 헤더 영역 */}
      <div className="job-posting-header">
        <div className="job-posting-inner">
          <h1 className="header-title">채용정보</h1>
          <JobSearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="job-content-area">
        <JobFilters onFilterChange={handleFilterChange} />
        
        {/* 채용공고 리스트 */}
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

          {/* 채용공고 목록 */}
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

export default JobPosting;