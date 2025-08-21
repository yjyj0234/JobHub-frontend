// src/components/UX/TopGrid.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../UI/Card.jsx";
import "../css/TopGrid.css";
import axios from "axios";

// 기존 하드코딩 데이터 (API 실패 시 폴백용)
const fallbackData = [
  {
    icon: "🥇",
    name: "네이버",
    desc: "국내 No.1 검색 포털",
    skills: ["AI", "Big Data", "Frontend"],
    talent: "세상을 바꾸는 인재",
    ranking: "🥇",
  },
  {
    icon: "🥈",
    name: "카카오",
    desc: "사람과 기술로 만드는 더 나은 세상",
    skills: ["Mobile", "Backend", "Fintech"],
    talent: "소통을 중시하는 인재",
    ranking: "🥈",
  },
  {
    icon: "🥉",
    name: "쿠팡",
    desc: "고객의 삶을 획기적으로 바꾸는 이커머스",
    skills: ["Logistics", "SCM", "Java"],
    talent: "문제 해결 능력이 뛰어난 인재",
    ranking: "🥉",
  },
  {
    icon: "🏢",
    name: "삼성전자",
    desc: "초일류 기술로 미래를 창조",
    skills: ["Semiconductor", "Hardware", "IoT"],
    talent: "글로벌 감각을 갖춘 인재",
    ranking: "4위",
  },
  {
    icon: "🚗",
    name: "현대자동차",
    desc: "스마트 모빌리티 솔루션 프로바이더",
    skills: ["EV", "Robotics"],
    talent: "도전 정신이 강한 인재",
    ranking: "5위",
  },
  {
    icon: "✈️",
    name: "대한항공",
    desc: "세계 항공업계를 선도하는 글로벌 항공사",
    skills: ["Service", "Global", "Logistics"],
    talent: "고객 만족을 최우선으로 하는 인재",
    ranking: "6위",
  },
];

function TopGrid({ sectionRef }) {
  // ========== 상태 관리 ==========
  const [displayData, setDisplayData] = useState(fallbackData); // 표시할 데이터
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [isApiData, setIsApiData] = useState(false); // API 데이터 여부
  const [rankingType, setRankingType] = useState("viewCount"); // 순위 기준

  const navigate = useNavigate();

  // ========== 순위별 아이콘 반환 함수 ==========
  const getRankingIcon = (ranking) => {
    switch (ranking) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `${ranking}위`;
    }
  };

  // ========== API 호출 함수 ==========
  const fetchTopCompanies = async (type) => {
    try {
      setLoading(true);

      // 순위 기준에 따라 다른 엔드포인트 호출
      const endpoint =
        type === "bookmark"
          ? "/api/home/top-companies-bookmark"
          : "/api/home/top-companies";

      const response = await axios.get(endpoint, {
        timeout: 5000, // 5초 타임아웃
      });

      if (response.data && response.data.companies) {
        console.log(`✅ Top 기업 (${type}) API 성공:`, response.data);

        // API 데이터를 카드 형식에 맞게 변환
        const apiData = response.data.companies.slice(0, 6).map((company) => ({
          // 기존 Card 컴포넌트 호환용 필드
          id: company.companyId,
          name: company.companyName,
          desc: company.industry || "기타 업종",
          icon: company.companyLogo || "🏢",
          skills: [], // 기업 카드에는 스킬 대신 업종 정보

          // 새로운 API 데이터 필드
          companyName: company.companyName,
          companyLogo: company.companyLogo,
          ranking: getRankingIcon(company.ranking),
          stats:
            type === "bookmark"
              ? `관심기업 ${company.bookmarkCount?.toLocaleString() || 0}명`
              : `조회수 ${company.bookmarkCount?.toLocaleString() || 0}회`,
          isTopCompany: true,

          // 기업 클릭용
          companyId: company.companyId,
        }));

        setDisplayData(apiData);
        setIsApiData(true);
      } else {
        throw new Error("API 응답 형식 오류");
      }
    } catch (err) {
      console.warn(
        `⚠️ Top 기업 (${type}) API 실패, 기본 데이터 사용:`,
        err.message
      );

      // API 실패 시 기본 데이터 유지
      setDisplayData(fallbackData);
      setIsApiData(false);
    } finally {
      setLoading(false);
    }
  };

  // ========== 순위 기준 변경 핸들러 ==========
  const handleRankingTypeChange = (type) => {
    if (type !== rankingType) {
      setRankingType(type);
    }
  };

  // ========== 컴포넌트 마운트 & 순위 기준 변경 시 API 호출 ==========
  useEffect(() => {
    fetchTopCompanies(rankingType);
  }, [rankingType]);

  // ========== 기업 카드 클릭 핸들러 ==========
  const handleCompanyClick = (companyId) => {
    if (companyId && isApiData) {
      // API 데이터인 경우 해당 기업의 공고 목록으로 이동
      navigate(`/jobpostinglist?company=${companyId}`);
    } else {
      // 기본 데이터인 경우 전체 공고 목록으로 이동
      navigate("/jobpostinglist");
    }
  };

  return (
    <section ref={sectionRef} className="top100-grid-section">
      <h2 className="top100-grid-title">
        🏆 기업 TOP 10
        {!isApiData && <span className="demo-badge">샘플</span>}
      </h2>

      {/* 순위 기준 선택 탭 (API 데이터일 때만 표시) */}
      {isApiData && (
        <div className="ranking-tabs">
          <button
            className={`ranking-tab ${
              rankingType === "viewCount" ? "active" : ""
            }`}
            onClick={() => handleRankingTypeChange("viewCount")}
          >
            👀 조회수 기준
          </button>
          <button
            className={`ranking-tab ${
              rankingType === "bookmark" ? "active" : ""
            }`}
            onClick={() => handleRankingTypeChange("bookmark")}
          >
            ⭐ 관심기업 기준
          </button>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>인기 기업 정보를 불러오는 중...</p>
        </div>
      )}

      {/* 카드 그리드 */}
      {!loading && (
        <div className="top100-grid">
          {displayData.map((company, index) => (
            <Card
              key={isApiData ? company.companyId : index}
              data={company}
              onClick={
                isApiData
                  ? () => handleCompanyClick(company.companyId)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* 더보기 버튼 */}
      <div className="view-more-container">
        <button
          onClick={() => navigate("/jobpostinglist")}
          className="view-more-button"
        >
          전체 기업 보기 →
        </button>
      </div>
    </section>
  );
}

export default TopGrid;
