// src/components/UX/Grid.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../UI/Card.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "../css/Grid.css";
import axios from "axios";

// 기존 하드코딩 데이터 (API 실패 시 폴백용)
const fallbackData = [
  {
    icon: "🏢",
    name: "JobHub 솔루션",
    desc: "클라우드 기반 채용 솔루션",
    skills: ["React", "Node.js", "AWS", "Docker"],
  },
  {
    icon: "🚀",
    name: "스페이스로직",
    desc: "AI 우주 탐사 데이터 분석",
    skills: ["Python", "TensorFlow", "Kubernetes"],
  },
  {
    icon: "🎨",
    name: "크리에이티브 디자인",
    desc: "사용자 경험 중심 에이전시",
    skills: ["UI/UX Design", "Figma", "Sketch"],
  },
  {
    icon: "🔒",
    name: "시큐어테크",
    desc: "차세대 사이버 보안 기술",
    skills: ["C++", "Rust", "Cryptography"],
  },
  {
    icon: "🎮",
    name: "플레이게임즈",
    desc: "몰입형 모바일 게임 개발",
    skills: ["Unity", "C#", "Mobile Dev"],
  },
  {
    icon: "📊",
    name: "데이터 인사이트",
    desc: "빅데이터 분석 및 시각화",
    skills: ["Python", "SQL", "Tableau"],
  },
];

function Grid({ sectionRef }) {
  // ========== 상태 관리 ==========
  const [displayData, setDisplayData] = useState(fallbackData); // 표시할 데이터
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [isApiData, setIsApiData] = useState(false); // API 데이터 여부

  // ========== 컨텍스트 & 라우터 ==========
  const { user, isAuthed } = useAuth();
  const navigate = useNavigate();

  // ========== API 호출 함수 ==========
  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      // API 호출 시도
      const response = await axios.get("/api/home/recommendations", {
        params: { limit: 6 },
        timeout: 5000, // 5초 타임아웃
      });

      if (response.data && response.data.recommendations) {
        console.log("✅ 추천 공고 API 성공:", response.data);

        // API 데이터를 카드 형식에 맞게 변환
        const apiData = response.data.recommendations.map((job) => ({
          // 기존 Card 컴포넌트 호환용 필드
          id: job.id,
          name: job.companyName,
          desc: job.title,
          icon: job.companyLogo || "🏢",
          skills: job.categories?.map((cat) => cat.name) || [],

          // 새로운 API 데이터 필드
          companyName: job.companyName,
          title: job.title,
          companyLogo: job.companyLogo,
          categories: job.categories || [],
          viewCount: job.viewCount,
          applicationCount: job.applicationCount,
          isRemote: job.isRemote,
          regions: job.regions?.map((reg) => reg.name).join(", "),
          closeDate: job.closeDate,
          isRecommended: true,
        }));

        setDisplayData(apiData);
        setIsApiData(true);
      } else {
        throw new Error("API 응답 형식 오류");
      }
    } catch (err) {
      console.warn("⚠️ 추천 공고 API 실패, 기본 데이터 사용:", err.message);

      // API 실패 시 기본 데이터 유지
      setDisplayData(fallbackData);
      setIsApiData(false);
    } finally {
      setLoading(false);
    }
  };

  // ========== 컴포넌트 마운트 시 API 호출 시도 ==========
  useEffect(() => {
    fetchRecommendations();
  }, [user]); // 사용자 로그인 상태 변경 시 재호출

  // ========== 카드 클릭 핸들러 ==========
  const handleCardClick = (jobId) => {
    if (jobId && isApiData) {
      // API 데이터인 경우 공고 상세 페이지로 이동
      navigate(`/jobpostinglist/${jobId}`);
    } else {
      // 기본 데이터인 경우 전체 공고 목록으로 이동
      navigate("/jobpostinglist");
    }
  };

  return (
    <section ref={sectionRef} className="grid-section">
      {/* 타이틀 - 로그인 상태에 따라 변경 */}
      <h2 className="grid-title">
        ✨ {isAuthed && isApiData ? "맞춤" : "인기"} 추천 공고
        {isAuthed && isApiData && (
          <span className="personalized-badge">개인화</span>
        )}
        {!isApiData && <span className="demo-badge">샘플</span>}
      </h2>

      {/* 로딩 상태 */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>추천 공고를 불러오는 중...</p>
        </div>
      )}

      {/* 카드 그리드 */}
      {!loading && (
        <div className="grid">
          {displayData.map((company, index) => (
            <Card
              key={isApiData ? company.id : index}
              data={company}
              onClick={isApiData ? handleCardClick : undefined}
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
          전체 공고 보기 →
        </button>
      </div>
    </section>
  );
}

export default Grid;
