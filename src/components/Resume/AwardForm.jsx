import React, { useEffect, useState } from "react";
import "../css/Form.css";

function AwardForm({ data, onUpdate, isEditing }) {
  const [formData, setFormData] = useState({
    awardName: "", // ← 수상명
    organization: "", // ← 수여기관
    awardDate: null, // ← 수상일 (YYYY-MM-DD | null)
    description: "", // ← 수상 내용
    ...(data || {}),
  });

  // 외부 data 들어오면 동기화
  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...(data || {}) }));
  }, [data]);

  const emit = (next) => {
    setFormData(next);
    onUpdate && onUpdate(next);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "date") {
      // 빈 날짜는 null로
      emit({ ...formData, [name]: value === "" ? null : value });
      return;
    }
    emit({ ...formData, [name]: value });
  };

  // blur 시 공백 제거 + 빈 문자열은 null
  const handleTrimOnBlur = (e) => {
    const { name, value } = e.target;
    const trimmed = (value ?? "").trim();
    emit({ ...formData, [name]: trimmed === "" ? null : trimmed });
  };

  const v = (x) => x ?? "";

  return (
    <div className="item-form">
      <div className="grid-layout">
        {/* 수상명 */}
        <div className="form-field full-width">
          <label htmlFor="awardName">수상명</label>
          <input
            type="text"
            id="awardName"
            name="awardName"
            value={v(formData.awardName)}
            onChange={handleChange}
            onBlur={handleTrimOnBlur}
            placeholder="예) 전국 대학생 코딩 경진대회 대상"
            disabled={!isEditing}
          />
        </div>

        {/* 수여기관 */}
        <div className="form-field">
          <label htmlFor="organization">수여기관</label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={v(formData.organization)}
            onChange={handleChange}
            onBlur={handleTrimOnBlur}
            placeholder="예) 한국정보올림피아드"
            disabled={!isEditing}
          />
        </div>

        {/* 수상일 */}
        <div className="form-field">
          <label htmlFor="awardDate">수상일</label>
          <input
            type="date"
            id="awardDate"
            name="awardDate"
            value={v(formData.awardDate)}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        {/* 수상 내용 */}
        <div className="form-field full-width">
          <label htmlFor="description">수상 내용</label>
          <textarea
            id="description"
            name="description"
            value={v(formData.description)}
            onChange={handleChange}
            onBlur={handleTrimOnBlur}
            placeholder="수상을 통해 얻은 역량이나 경험에 대해 작성해주세요."
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );
}

export default AwardForm;
