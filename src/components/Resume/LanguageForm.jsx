import React, { useState, useEffect } from "react";
import "../css/Form.css";

function LanguageForm({ data, onUpdate, isEditing }) {
  const [formData, setFormData] = useState(data || {});

  // 부모가 다른 아이템을 내려줄 때 값 동기화
  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleChange = (e) => {
    if (!isEditing) return; // 편집 모드 아닐 때 변경 무시(안전장치)
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field">
          <label htmlFor="language">언어</label>
          <input
            type="text"
            id="language"
            name="language"
            value={formData.language || ""}
            onChange={handleChange}
            placeholder="예) 영어"
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          <label htmlFor="proficiencyLevel">숙련도</label>
          <input
            type="text"
            id="proficiencyLevel"
            name="proficiencyLevel" // 🔁 fluency → proficiencyLevel로 표준화
            value={formData.proficiencyLevel || ""}
            onChange={handleChange}
            placeholder="예) 비즈니스 회화 가능"
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          <label htmlFor="testName">어학시험명</label>
          <input
            type="text"
            id="testName"
            name="testName"
            value={formData.testName || ""}
            onChange={handleChange}
            placeholder="예) TOEIC"
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          <label htmlFor="testScore">시험점수</label>
          <input
            type="text"
            id="testScore"
            name="testScore"
            value={formData.testScore || ""}
            onChange={handleChange}
            placeholder="예) 950"
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          <label htmlFor="testDate">시험일</label>
          <input
            type="date"
            id="testDate"
            name="testDate"
            value={formData.testDate || ""}
            onChange={handleChange}
            placeholder="YYYY-MM-DD"
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );
}

export default LanguageForm;
