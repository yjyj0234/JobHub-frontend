/**
 * src/components/domain/Resume/ResumePreviewModal.jsx
 * --------------------------------
 * '미리보기' 기능을 위한 모달 컴포넌트입니다.
 * 이력서의 제목과 각 섹션의 데이터를 받아서 실제 이력서처럼 보여줍니다.
 */
import React from 'react';
import '../css/ResumePreviewModal.css'; // 미리보기 전용 CSS

function ResumePreviewModal({ isOpen, onClose, title, sections, sectionComponents }) {
  // isOpen이 false이면 아무것도 렌더링하지 않습니다.
  if (!isOpen) return null;

  return (
    // 모달 배경 (클릭하면 닫힘)
    <div className="preview-modal-overlay" onClick={onClose}>
      {/* 모달 본문 (클릭해도 안 닫힘) */}
      <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h1>{title || '이력서 미리보기'}</h1>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="preview-body">
          {/* sections 배열을 순회하며 각 항목의 데이터를 예쁘게 표시합니다. */}
          {sections.map(section => {
            const sectionInfo = sectionComponents[section.type];
            if (!sectionInfo) return null;
            
            return (
              <div key={section.id} className="preview-section">
                <h2>{sectionInfo.title}</h2>
                {/* 실제로는 각 데이터에 맞는 예쁜 UI로 렌더링해야 하지만,
                  지금은 데이터를 JSON 형태로 간단히 보여줍니다.
                */}
                <pre>{JSON.stringify(section.data, null, 2)}</pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ResumePreviewModal;