// src/components/SelectedJobTags.jsx
import React from 'react';

const SelectedJobTags = ({ selectedJobs, onSetPrimary, onRemove }) => {
  if (!selectedJobs || selectedJobs.length === 0) return null;

  return (
    <div className="form-group" style={{ marginTop: 15 }}>
      <label>선택된 직무</label>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',               // ✅ 태그 간 간격 10px
          marginTop: 5,
        }}
      >
        {selectedJobs.map((job) => (
          <div
            key={job.id}
            role="button"
            tabIndex={0}
            onClick={() => onSetPrimary(job.id)} // ✅ 칩 전체 클릭 시 주직무 지정
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSetPrimary(job.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 18px', // ✅ 높이 느낌 2배(세로 여백 늘림)
              borderRadius: '24px',
              fontSize: '15px',     // ✅ 폰트 살짝 키움
              fontWeight: 500,
              cursor: 'pointer',
              userSelect: 'none',
              gap: 10,
              background: job.isPrimary
                ? 'linear-gradient(135deg, #EC8E12 0%, #FFD84A 100%)'
                : '#e9ecef',
              color: job.isPrimary ? '#1f2937' : '#495057',
              border: job.isPrimary ? '1px solid #EC8E12' : '1px solid #dee2e6',
            }}
          >
            <span>
              {job.mainCategory} &gt; {job.subCategory}
            </span>

            {/* 라디오 (클릭 전파 방지) */}
            <label
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 400,
                opacity: 0.5, // ✅ 50% 투명도
              }}
              title="주 직무 지정"
            >
              <input
                type="radio"
                name="primaryJob"
                checked={job.isPrimary}
                onChange={() => onSetPrimary(job.id)}
                style={{ transform: 'scale(1)' }} // ✅ 기본 크기
              />
              <span style={{ lineHeight: 1,color:'black' }}>주 직무</span>
            </label>

            {/* 제거 버튼 (클릭 전파 방지) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(job.id);
              }}
              title="제거"
              style={{
                background: 'transparent',
                border: 'none',
                color: job.isPrimary ? '#1f2937' : '#6c757d',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedJobTags;
