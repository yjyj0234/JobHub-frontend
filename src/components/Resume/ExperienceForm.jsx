import React, { useState } from 'react';
import '../css/Form.css';

function ExperienceForm({ data, onUpdate, isEditing }) {
  const [formData, setFormData] = useState({
    companyName: data.companyName || '',
    role: data.role || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData); // 1. 내부 상태 업데이트
    onUpdate(updatedData);    // 2. 부모에게 최신 데이터 전달
  };

  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width">
          <label>회사명</label>
          <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="예) 잡Hub" disabled={!isEditing}/>
        </div>
        <div className="form-field">
          <label>직책/직급</label>
          <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="예) 프론트엔드 개발자" disabled={!isEditing}/>
        </div>
        <div className="form-field">
          <label>입사일</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} disabled={!isEditing}/>
        </div>
        <div className="form-field">
          <label>퇴사일</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} disabled={!isEditing}/>
        </div>
      </div>
    </div>
  );
}
export default ExperienceForm;