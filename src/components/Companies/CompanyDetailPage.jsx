// src/components/Companies/CompanyDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Building2,
  Globe,
  Users,
  Calendar,
  MapPin,
  Briefcase,
  Star,
  ChevronRight,
  Award,
  Heart,
  Target,
} from "lucide-react";
import "../css/CompanyDetailPage.css";

const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [company, setCompany] = useState(null);
  const [activePostings, setActivePostings] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 기업 정보 로드
  useEffect(() => {
    loadCompanyDetail();
  }, [id]);

  const loadCompanyDetail = async () => {
    try {
      setLoading(true);
      
      // 기업 정보와 채용공고 병렬 로드
      const [companyRes, postingsRes] = await Promise.all([
        api.get(`/api/public/companies/${id}`),
        api.get(`/api/public/companies/${id}/postings`).catch(() => ({ data: [] }))
      ]);

      setCompany(companyRes.data);
      setActivePostings(postingsRes.data || []);
      
      // 북마크 상태 체크 (로그인 상태일 때만)
      checkBookmarkStatus();
    } catch (err) {
      console.error("기업 정보 로드 실패:", err);
      setError("기업 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const res = await api.get(`/api/bookmarks/company/${id}/status`);
      setIsBookmarked(res.data.bookmarked || false);
    } catch {
      // 비로그인 상태거나 에러시 무시
    }
  };

  const toggleBookmark = async () => {
    try {
      if (isBookmarked) {
        await api.delete(`/api/bookmarks/company/${id}`);
      } else {
        await api.post(`/api/bookmarks/company/${id}`);
      }
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("로그인이 필요합니다.");
        window.dispatchEvent(new CustomEvent('openLoginModal'));
      } else {
        alert("북마크 처리 중 오류가 발생했습니다.");
      }
    }
  };

  const formatSalary = (minSalary, maxSalary) => {
    if (!minSalary && !maxSalary) return "회사내규";
    if (minSalary && maxSalary) {
      return `${(minSalary / 10000).toFixed(0)}~${(maxSalary / 10000).toFixed(0)}만원`;
    }
    if (minSalary) return `${(minSalary / 10000).toFixed(0)}만원 이상`;
    return "회사내규";
  };

  if (loading) {
    return (
      <div className="company-detail-loading">
        <div className="spinner"></div>
        <p>기업 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="company-detail-error">
        <p>{error || "기업 정보를 찾을 수 없습니다."}</p>
        <button onClick={() => navigate(-1)}>돌아가기</button>
      </div>
    );
  }

  return (
    <div className="company-detail-container">
      {/* 헤더 섹션 */}
      <div className="company-header">
        <div className="company-header-inner">
          <div className="company-logo-wrapper">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={`${company.name} 로고`} />
            ) : (
              <div className="company-logo-placeholder">
                <Building2 size={40} />
              </div>
            )}
          </div>
          
          <div className="company-header-info">
            <div className="company-name-row">
              <h1>{company.name}</h1>
              {company.isVerified && (
                <span className="verified-badge">
                  <Award size={16} /> 인증기업
                </span>
              )}
            </div>
            
            <div className="company-meta">
              {company.industryName && (
                <span><Briefcase size={16} /> {company.industryName}</span>
              )}
              {company.companySizeName && (
                <span><Users size={16} /> {company.companySizeName}</span>
              )}
              {company.foundedYear && (
                <span><Calendar size={16} /> {company.foundedYear}년 설립</span>
              )}
              {company.websiteUrl && (
                <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer">
                  <Globe size={16} /> 웹사이트
                </a>
              )}
            </div>
          </div>

          <button 
            className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
            onClick={toggleBookmark}
          >
            <Star size={20} fill={isBookmarked ? "currentColor" : "none"} />
            {isBookmarked ? '관심기업 해제' : '관심기업 등록'}
          </button>
        </div>
      </div>

      {/* 기업 소개 섹션 */}
      <div className="company-content">
        <div className="content-section">
          <h2>기업 소개</h2>
          <p className="company-description">
            {company.description || "기업 소개가 등록되지 않았습니다."}
          </p>
        </div>

        {company.mission && (
          <div className="content-section">
            <h2><Target size={20} /> 미션</h2>
            <p>{company.mission}</p>
          </div>
        )}

        {company.culture && (
          <div className="content-section">
            <h2><Heart size={20} /> 기업 문화</h2>
            <p>{company.culture}</p>
          </div>
        )}

        {company.benefits && company.benefits.length > 0 && (
          <div className="content-section">
            <h2>복리후생</h2>
            <div className="benefits-grid">
              {company.benefits.map((benefit, idx) => (
                <div key={idx} className="benefit-item">
                  <ChevronRight size={16} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 진행중인 채용공고 */}
        <div className="content-section">
          <div className="section-header">
            <h2>채용중인 포지션 ({activePostings.length})</h2>
            {activePostings.length > 0 && (
              <Link to="/jobpostinglist" className="view-all-link">
                전체보기 <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {activePostings.length > 0 ? (
            <div className="job-postings-list">
              {activePostings.map(posting => (
                <div 
                  key={posting.id} 
                  className="job-posting-card"
                  onClick={() => navigate(`/jobpostinglist/${posting.id}`)}
                >
                  <div className="posting-header">
                    <h3>{posting.title}</h3>
                    <span className="posting-date">
                      {posting.closeDate ? 
                        `~${new Date(posting.closeDate).toLocaleDateString()}` : 
                        '상시채용'
                      }
                    </span>
                  </div>
                  
                  <div className="posting-meta">
                    {posting.primaryLocation && (
                      <span><MapPin size={14} /> {posting.primaryLocation}</span>
                    )}
                    {posting.primaryJobCategory && (
                      <span><Briefcase size={14} /> {posting.primaryJobCategory}</span>
                    )}
                    {posting.experienceLevel && (
                      <span>{posting.experienceLevel}</span>
                    )}
                  </div>
                  
                  <div className="posting-salary">
                    {posting.salary || "회사내규"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-postings">현재 진행중인 채용공고가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;