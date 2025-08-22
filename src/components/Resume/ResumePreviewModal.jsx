import React from "react";
import { User, Phone, MapPin, Calendar } from "lucide-react";
import "../css/ResumePreviewModal.css";

// 프로필 헤더 (읽기 전용)
const ProfileHeaderPreview = ({ profile }) => {
  if (!profile) return null;

  return (
    <div className="profile-header preview-mode">
      <ProfileHeaderPreview profile={profile} />
      <div className="profile-main-info">
        <div className="profile-photo-wrapper">
          {profile.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt={profile.name || "프로필"}
              className="profile-photo"
            />
          ) : (
            <div className="profile-photo-placeholder">
              <User size={40} />
            </div>
          )}
        </div>

        <div className="profile-details">
          <h2 className="profile-name-display">{profile.name || "이름"}</h2>
          <p className="profile-headline-display">
            {profile.headline || "한 줄 소개"}
          </p>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <Phone size={14} />
              <span>{profile.phone || "-"}</span>
            </div>
            <div className="profile-info-item">
              <MapPin size={14} />
              <span>{profile.regionName || "-"}</span>
            </div>
            <div className="profile-info-item">
              <Calendar size={14} />
              <span>{profile.birthDate || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {profile.summary && (
        <div className="profile-info-wide">
          <label>자기소개</label>
          <div className="summary-display">{profile.summary}</div>
        </div>
      )}
    </div>
  );
};

// 각 섹션 타입에 맞는 뷰 컴포넌트
const SectionView = ({ section }) => {
  // 데이터가 배열 형태이므로, 각 항목을 순회하며 렌더링
  if (!section.data || section.data.length === 0) {
    return (
      <div className="preview-data-item empty">작성된 내용이 없습니다.</div>
    );
  }

  return section.data.map((item, index) => (
    <div key={item.subId || index} className="preview-data-item">
      {renderItem(section.type, item)}
    </div>
  ));
};

// 항목 타입에 따라 렌더링하는 헬퍼 함수
const renderItem = (type, data) => {
  switch (type) {
    case "experiences":
      return (
        <>
          <p>
            <strong>{data.companyName || "회사명 미입력"}</strong> |{" "}
            {data.position || "직책 미입력"}
          </p>
          <p className="period">
            {data.startDate || "시작일"} ~ {data.endDate || "종료일"}
          </p>
        </>
      );
    case "educations":
      return (
        <>
          <p>
            <strong>{data.schoolName || "학교명 미입력"}</strong>
          </p>
          <p>
            {data.major || "전공 미입력"} ({data.degree || "학위 미입력"})
          </p>
          <p className="period">
            {data.admissionDate || "입학일"} ~ {data.graduationDate || "졸업일"}
          </p>
          {data.gpa && (
            <p>
              학점: {data.gpa} / {data.maxGpa || "4.5"}
            </p>
          )}
        </>
      );
    case "skills": {
      // data가 (1) 단일 스킬 객체 { name, category ... } 이거나
      //       (2) 옛 형태인 { skills: [...] } 일 수 있으니 둘 다 처리
      const items = Array.isArray(data?.skills) ? data.skills : [data];

      const visible = items
        .map((s) => ({
          name: (s?.name || "").trim(),
          category:
            (typeof s?.category === "string" && s.category.trim()) ||
            (typeof s?.categoryId === "number" ? `#${s.categoryId}` : ""),
          id: s?.id ?? s?.resumeSkillId ?? s?.skillId,
        }))
        .filter((s) => s.name.length > 0);

      if (visible.length === 0) {
        return (
          <div className="preview-data-item empty">작성된 스킬이 없습니다.</div>
        );
      }

      return (
        <div className="skills-preview-container">
          {visible.map((s, idx) => (
            <span key={s.id ?? idx} className="skill-preview-tag">
              {s.name}
              {s.category ? ` (${s.category})` : ""}
            </span>
          ))}
        </div>
      );
    }

    case "projects":
      return (
        <>
          <p>
            <strong>{data.projectName || "프로젝트명 미입력"}</strong> (
            {data.projectOrg || "수행기관 미입력"})
          </p>
          <p className="period">
            {data.startDate || "시작일"} ~ {data.endDate || "종료일"}
          </p>
          {data.url && (
            <p>
              <strong>링크:</strong>{" "}
              <a href={data.url} target="_blank" rel="noopener noreferrer">
                {data.url}
              </a>
            </p>
          )}
          {data.techStack && (
            <p>
              <strong>사용 기술:</strong> {data.techStack}
            </p>
          )}
          {data.description && (
            <p className="description">{data.description}</p>
          )}
        </>
      );
    case "activities":
      return (
        <>
          <p>
            <strong>{data.activityName || "활동명 미입력"}</strong> (
            {data.organization || "기관/단체 미입력"})
          </p>
          <p className="period">
            {data.startDate || "시작일"} ~ {data.endDate || "종료일"}
          </p>
          {data.description && (
            <p className="description">{data.description}</p>
          )}
        </>
      );
    case "awards":
      return (
        <>
          <p>
            <strong>{data.awardTitle || "수상명 미입력"}</strong>
          </p>
          <p>{data.awardingInstitution || "수여기관 미입력"}</p>
          <p className="period">{data.awardDate || "수상일 미입력"}</p>
          {data.description && (
            <p className="description">{data.description}</p>
          )}
        </>
      );
    case "certifications":
      return (
        <>
          <p>
            <strong>{data.certName || "자격증명 미입력"}</strong>
          </p>
          <p>발급기관: {data.certIssuer || "미입력"}</p>
          <p className="period">취득일: {data.certDate || "미입력"}</p>
        </>
      );
    case "languages":
      return (
        <>
          <p>
            <strong>{data.language || "언어명 미입력"}</strong>
          </p>
          <p>수준: {data.fluency || "미입력"}</p>
          {data.testName && (
            <p>
              시험: {data.testName} ({data.testScore || "점수 미입력"})
            </p>
          )}
        </>
      );
    case "portfolios":
      return (
        <>
          <p>
            <strong>링크:</strong>{" "}
            <a href={data.url} target="_blank" rel="noopener noreferrer">
              {data.url || "URL 미입력"}
            </a>
          </p>
          {data.description && (
            <p className="description">{data.description}</p>
          )}
        </>
      );
    default:
      return <div className="preview-data-item">표시할 내용이 없습니다.</div>;
  }
};

function ResumePreviewModal({
  isOpen,
  onClose,
  title,
  profile,
  sections,
  sectionComponents,
}) {
  if (!isOpen) return null;

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div
        className="preview-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="preview-header">
          <h1>{title || "이력서 미리보기"}</h1>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="preview-body">
          {/* 프로필 헤더 추가 */}

          {sections.length > 0 ? (
            sections.map((section) => {
              const sectionInfo = sectionComponents[section.type];
              if (!sectionInfo) return null;

              return (
                <div key={section.id} className="preview-section">
                  <h2>{sectionInfo.title}</h2>
                  <SectionView section={section} />
                </div>
              );
            })
          ) : (
            <div className="preview-section">
              <p>추가된 항목이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumePreviewModal;
