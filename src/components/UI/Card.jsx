// src/components/UI/Card.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Card.css";

function Card({ data, onClick }) {
  const navigate = useNavigate();

  // 기존 구조 + 새로운 props 처리
  const {
    icon,
    name,
    desc,
    skills = [],
    talent,
    // API 데이터용 새 props
    id,
    title,
    companyName,
    companyLogo,
    categories = [],
    viewCount,
    applicationCount,
    isRemote,
    regions,
    closeDate,
    // 특별 카드용
    ranking,
    stats,
    isTopCompany = false,
    isRecommended = false,
  } = data;

  // 카드 클릭 핸들러
  const handleCardClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(id || data);
    } else if (id) {
      // 공고 상세 페이지로 이동
      navigate(`/jobpostinglist/${id}`);
    }
  };

  // 자세히 보기 버튼 클릭 핸들러
  const handleDetailsClick = (e) => {
    e.stopPropagation();
    if (id) {
      navigate(`/jobpostinglist/${id}`);
    }
  };

  // 아이콘 렌더링 (S3 이미지 또는 이모지)
  const renderIcon = () => {
    const iconSrc = companyLogo || icon;

    if (iconSrc && iconSrc.startsWith("http")) {
      return (
        <img
          src={iconSrc}
          alt={`${companyName || name} 로고`}
          className="card-logo-image"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "block";
          }}
        />
      );
    }
    return <span className="card-icon">{iconSrc || "🏢"}</span>;
  };

  // 스킬 태그 처리 (기존 + API 카테고리)
  const skillList =
    skills.length > 0 ? skills : categories.map((cat) => cat.name || cat);

  // 표시할 이름과 설명
  const displayName = companyName || name;
  const displayDesc = title || desc;

  return (
    <div
      className={`card-container ${isTopCompany ? "top-company" : ""} ${
        isRecommended ? "recommended" : ""
      }`}
      onClick={handleCardClick}
    >
      {/* 순위 배지 (Top 기업용) */}
      {ranking && <div className="ranking-badge">{ranking}</div>}

      {/* 추천 배지 */}
      {isRecommended && <div className="recommended-badge">✨ 추천</div>}

      <div className="card-inner">
        {/* 앞면 */}
        <div className="card-front">
          <div className="card-icon-wrapper">
            {renderIcon()}
            <div className="card-icon-fallback" style={{ display: "none" }}>
              🏢
            </div>
          </div>
          <h3 className="card-name">{displayName}</h3>
          <p className="card-desc">{displayDesc}</p>

          {/* 추가 정보 (앞면 하단) */}
          <div className="card-front-footer">
            {isRemote && <span className="remote-badge">🏠 재택</span>}
            {regions && <span className="location-info">📍 {regions}</span>}
          </div>
        </div>

        {/* 뒷면 */}
        <div className="card-back">
          <h3 className="card-name">{displayName}</h3>

          <div className="card-details">
            {/* 스킬/카테고리 */}
            {skillList.length > 0 && (
              <>
                <h4>요구 기술 / 직무</h4>
                <div className="skills">
                  {skillList.slice(0, 4).map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                  {skillList.length > 4 && (
                    <span className="skill-tag more">
                      +{skillList.length - 4}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* 인재상 (기존 데이터) 또는 추가 정보 */}
            {talent && (
              <>
                <h4>원하는 인재상</h4>
                <p>{talent}</p>
              </>
            )}

            {/* 통계 정보 */}
            {(viewCount !== undefined ||
              applicationCount !== undefined ||
              stats) && (
              <div className="card-stats">
                {viewCount !== undefined && (
                  <div className="stat-item">
                    <span className="stat-icon">👀</span>
                    <span className="stat-value">
                      {viewCount.toLocaleString()}
                    </span>
                  </div>
                )}
                {applicationCount !== undefined && (
                  <div className="stat-item">
                    <span className="stat-icon">📝</span>
                    <span className="stat-value">
                      {applicationCount.toLocaleString()}
                    </span>
                  </div>
                )}
                {stats && (
                  <div className="stat-item">
                    <span className="stat-value">{stats}</span>
                  </div>
                )}
              </div>
            )}

            {/* 마감일 정보 */}
            {closeDate && (
              <div className="deadline-info">
                <span className="deadline-label">마감:</span>
                <span className="deadline-date">
                  {new Date(closeDate).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <button className="details-button" onClick={handleDetailsClick}>
            {id ? "지원하기" : "자세히 보기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Card;
