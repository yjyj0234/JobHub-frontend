// src/components/UX/Hero.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Hero.css";

function Hero({ sectionRef }) {
  // ========== 상태 관리 ==========
  const [stats, setStats] = useState({
    totalCompanies: 1247,
    activeJobs: 892,
    totalUsers: 15420,
  });
  const [displayStats, setDisplayStats] = useState({
    totalCompanies: 0,
    activeJobs: 0,
    totalUsers: 0,
  });
  const [animated, setAnimated] = useState(false);

  const navigate = useNavigate();

  // ========== 카운트업 애니메이션 함수 ==========
  const animateCount = (target, setter, delay = 0) => {
    setTimeout(() => {
      let current = 0;
      const increment = target / 60; // 1초 동안 60프레임
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 16);
    }, delay);
  };

  // ========== 컴포넌트 마운트 시 애니메이션 시작 ==========
  useEffect(() => {
    if (!animated) {
      // 순차적으로 카운트 애니메이션 실행
      animateCount(
        stats.totalCompanies,
        (val) => setDisplayStats((prev) => ({ ...prev, totalCompanies: val })),
        500
      );

      animateCount(
        stats.activeJobs,
        (val) => setDisplayStats((prev) => ({ ...prev, activeJobs: val })),
        800
      );

      animateCount(
        stats.totalUsers,
        (val) => setDisplayStats((prev) => ({ ...prev, totalUsers: val })),
        1100
      );

      setAnimated(true);
    }
  }, [animated, stats]);

  return (
    <section ref={sectionRef} className="hero">
      {/* 메인 타이틀 */}
      <h1 className="hero-title">
        당신의 가능성이
        <br />
        새로운 기회와 만나는 곳
      </h1>

      <p className="hero-subtitle">
        JobHub에서 당신의 커리어 여정을 새롭게 시작하세요.
      </p>

      {/* 실시간 통계 카운터 */}
      <div className="stats-container">
        <div className="stat-item">
          <div className="stat-number">
            {displayStats.totalCompanies.toLocaleString()}+
          </div>
          <div className="stat-label">참여 기업</div>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <div className="stat-number">
            {displayStats.activeJobs.toLocaleString()}+
          </div>
          <div className="stat-label">채용 공고</div>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <div className="stat-number">
            {displayStats.totalUsers.toLocaleString()}+
          </div>
          <div className="stat-label">누적 지원자</div>
        </div>
      </div>

      {/* CTA 버튼들 */}
      <div className="hero-actions">
        <button
          className="cta-button primary"
          onClick={() => navigate("/jobpostinglist")}
        >
          채용공고 둘러보기
        </button>
        <button
          className="cta-button secondary"
          onClick={() => navigate("/resumes/new")}
        >
          이력서 작성하기
        </button>
      </div>
    </section>
  );
}

export default Hero;
