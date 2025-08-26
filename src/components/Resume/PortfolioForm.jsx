// src/components/resume/PortfolioForm.jsx
import React, { useState, useEffect } from "react";
import "../css/Form.css";

function PortfolioForm({ data, onUpdate, isEditing }) {
  const [formData, setFormData] = useState(data || {});

  // 부모가 아이템을 바꿔서 내려줄 때 폼 상태 동기화
  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  // 스킴이 없으면 https:// 자동 부착
  const handleUrlBlur = () => {
    const raw = (formData.url || "").trim();
    if (!raw) return;
    if (!/^https?:\/\//i.test(raw)) {
      const fixed = `https://${raw}`;
      const updatedData = { ...formData, url: fixed };
      setFormData(updatedData);
      onUpdate(updatedData);
    }
  };

  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field">
          <label htmlFor="portfolioTitle">제목</label>
          <input
            type="text"
            id="portfolioTitle"
            name="title"
            value={formData.title || ""}
            onChange={handleChange}
            placeholder="예) GitHub / 블로그 / Notion / 개인 사이트"
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          <label htmlFor="portfolioType">유형</label>
          {/* 자유 입력 + 추천 옵션 */}
          <input
            type="text"
            id="portfolioType"
            name="portfolioType"
            list="portfolioTypeOptions"
            value={formData.portfolioType || ""}
            onChange={handleChange}
            placeholder="예) GitHub, Blog, Website, Notion"
            disabled={!isEditing}
          />
          <datalist id="portfolioTypeOptions">
            <option value="GitHub" />
            <option value="Blog" />
            <option value="Website" />
            <option value="Notion" />
            <option value="Behance" />
            <option value="Dribbble" />
            <option value="Other" />
          </datalist>
        </div>

        <div className="form-field full-width">
          <label htmlFor="portfolioUrl">URL</label>
          <input
            type="url"
            id="portfolioUrl"
            name="url"
            value={formData.url || ""}
            onChange={handleChange}
            onBlur={handleUrlBlur}
            placeholder="https://example.com"
            disabled={!isEditing}
          />
        </div>

        <div className="form-field full-width">
          <label htmlFor="portfolioDesc">설명</label>
          <textarea
            id="portfolioDesc"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="포트폴리오에 대한 간단한 설명을 입력하세요."
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );
}

export default PortfolioForm;
