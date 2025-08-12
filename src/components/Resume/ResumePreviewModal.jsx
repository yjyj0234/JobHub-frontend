import React from 'react';
import '../css/ResumePreviewModal.css';

// 각 섹션 타입에 맞는 뷰 컴포넌트
const SectionView = ({ section }) => {
  const { data } = section;

  // 데이터가 비어있거나, 데이터의 모든 값이 비어있으면 메시지를 표시합니다.
  if (!data || Object.values(data).every(val => !val || (Array.isArray(val) && val.length === 0))) {
    return <div className="preview-data-item empty">작성된 내용이 없습니다.</div>;
  }

  // 각 타입별로 다른 UI를 렌더링
  switch (section.type) {
    case 'experiences':
      return (
        <div className="preview-data-item">
          <p><strong>{data.companyName || '회사명 미입력'}</strong> | {data.role || '직책 미입력'}</p>
          <p className="period">{data.startDate || '시작일'} ~ {data.endDate || '종료일'}</p>
        </div>
      );
    case 'educations':
       return (
        <div className="preview-data-item">
          <p><strong>{data.schoolName || '학교명 미입력'}</strong></p>
          <p>{data.major || '전공 미입력'} ({data.degree || '학위 미입력'})</p>
          <p className="period">{data.startDate || '입학일'} ~ {data.endDate || '졸업일'}</p>
          {data.gpa && <p>학점: {data.gpa} / {data.maxGpa || '4.5'}</p>}
        </div>
      );
    case 'skills':
      if (!Array.isArray(data.skills) || data.skills.every(skill => !skill.name)) {
        return <div className="preview-data-item empty">작성된 스킬이 없습니다.</div>;
      }
      return (
        <div className="skills-preview-container">
          {data.skills.map((skill, index) => (
             skill.name && (
              <span key={index} className="skill-preview-tag">
                {skill.name}
                {skill.category && ` (${skill.category})`}
              </span>
            )
          ))}
        </div>
      );
    case 'projects':
      return (
        <div className="preview-data-item">
          <p><strong>{data.projectName || '프로젝트명 미입력'}</strong> ({data.projectOrg || '수행기관 미입력'})</p>
          <p className="period">{data.startDate || '시작일'} ~ {data.endDate || '종료일'}</p>
          {data.url && <p><strong>링크:</strong> <a href={data.url} target="_blank" rel="noopener noreferrer">{data.url}</a></p>}
          {data.techStack && <p><strong>사용 기술:</strong> {data.techStack}</p>}
          {data.description && <p className="description">{data.description}</p>}
        </div>
      );
    case 'activities':
        return (
            <div className="preview-data-item">
                <p><strong>{data.activityName || '활동명 미입력'}</strong> ({data.activityOrg || '기관/단체 미입력'})</p>
                <p className="period">{data.startDate || '시작일'} ~ {data.endDate || '종료일'}</p>
                {data.description && <p className="description">{data.description}</p>}
            </div>
        );
    case 'awards':
        return (
            <div className="preview-data-item">
                <p><strong>{data.awardTitle || '수상명 미입력'}</strong></p>
                <p>{data.awardingInstitution || '수여기관 미입력'}</p>
                <p className="period">{data.awardDate || '수상일 미입력'}</p>
                {data.description && <p className="description">{data.description}</p>}
            </div>
        );
    case 'certifications':
        return (
            <div className="preview-data-item">
                <p><strong>{data.certName || '자격증명 미입력'}</strong></p>
                <p>발급기관: {data.certIssuer || '미입력'}</p>
                <p className="period">취득일: {data.certDate || '미입력'}</p>
            </div>
        );
    case 'languages':
        return (
            <div className="preview-data-item">
                <p><strong>{data.language || '언어명 미입력'}</strong></p>
                <p>수준: {data.fluency || '미입력'}</p>
                {data.testName && <p>시험: {data.testName} ({data.testScore || '점수 미입력'})</p>}
            </div>
        );
    case 'portfolios':
        return (
            <div className="preview-data-item">
                <p><strong>링크:</strong> <a href={data.url} target="_blank" rel="noopener noreferrer">{data.url || 'URL 미입력'}</a></p>
                {data.description && <p className="description">{data.description}</p>}
            </div>
        );
    default:
      return <div className="preview-data-item">표시할 내용이 없습니다.</div>
  }
};


function ResumePreviewModal({ isOpen, onClose, title, sections, sectionComponents }) {
  if (!isOpen) return null;

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h1>{title || '이력서 미리보기'}</h1>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="preview-body">
          {sections.length > 0 ? (
            sections.map(section => {
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
             <div className="preview-section"><p>추가된 항목이 없습니다.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumePreviewModal;