// src/components/Resume/ActivityForm.jsx
import React, { useState } from "react";
import "../css/Form.css";

// isEditing prop을 받아 disabled 속성에 바인딩합니다.
function ActivityForm({ data = {}, onUpdate, isEditing }) {
  const [formData, setFormData] = useState(data || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onUpdate?.(updatedData);
  };

  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width">
          <label>활동명</label>
          <input
            name="activityName"
            value={formData.activityName || ""}
            onChange={handleChange}
            placeholder="예) 개발 동아리, 해커톤 참여"
            disabled={!isEditing}
          />
        </div>
        <div className="form-field">
          <label>기관/단체</label>
          <input
            name="organization"
            value={formData.organization || ""}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div className="form-field">
          <label>역할</label>
          <input name="role" value={data.role || ""} onChange={handleChange} disabled={!isEditing} />
        </div>
        <div className="form-field">
          <label>시작일</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate || ""}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div className="form-field">
          <label>종료일</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate || ""}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
        <div className="form-field full-width">
          <label>설명</label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="무엇을 했고, 어떤 임팩트가 있었는지 적어주세요."
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );
}

export default ActivityForm;