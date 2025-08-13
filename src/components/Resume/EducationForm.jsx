import React, { useState } from 'react';
import '../css/Form.css';

function EducationForm({ data, onUpdate }) {
  const [formData, setFormData] = useState(data || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width"><label htmlFor="schoolName">학교명</label><input type="text" id="schoolName" name="schoolName" value={formData.schoolName || ''} onChange={handleChange} placeholder="예) 잡Hub대학교"/></div>
        <div className="form-field"><label htmlFor="major">전공</label><input type="text" id="major" name="major" value={formData.major || ''} onChange={handleChange} placeholder="예) 컴퓨터공학과"/></div>
        <div className="form-field"><label htmlFor="degree">학위</label><input type="text" id="degree" name="degree" value={formData.degree || ''} onChange={handleChange} placeholder="예) 학사"/></div>
        <div className="form-field"><label htmlFor="eduStartDate">입학일</label><input type="date" id="eduStartDate" name="startDate" value={formData.startDate || ''} onChange={handleChange}/></div>
        <div className="form-field"><label htmlFor="eduEndDate">졸업일</label><input type="date" id="eduEndDate" name="endDate" value={formData.endDate || ''} onChange={handleChange}/></div>
        <div className="form-field"><label htmlFor="gpa">학점</label><input type="text" id="gpa" name="gpa" value={formData.gpa || ''} onChange={handleChange} placeholder="예) 3.8"/></div>
        <div className="form-field"><label htmlFor="maxGpa">최대학점</label><input type="text" id="maxGpa" name="maxGpa" value={formData.maxGpa || ''} onChange={handleChange} placeholder="예) 4.5"/></div>
      </div>
    </div>
  );
}
export default EducationForm;