import React, { useState } from 'react';
import '../css/Form.css';

function AwardForm({ data, onUpdate, isEditing }) {
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
        <div className="form-field full-width"><label htmlFor="awardTitle">수상명</label><input type="text" id="awardTitle" name="awardTitle" value={formData.awardTitle || ''} onChange={handleChange} placeholder="예) 전국 대학생 코딩 경진대회 대상" disabled={!isEditing}/></div>
        <div className="form-field"><label htmlFor="awardingInstitution">수여기관</label><input type="text" id="awardingInstitution" name="awardingInstitution" value={formData.awardingInstitution || ''} onChange={handleChange} placeholder="예) 한국정보올림피아드" disabled={!isEditing}/></div>
        <div className="form-field"><label htmlFor="awardDate">수상일</label><input type="date" id="awardDate" name="awardDate" value={formData.awardDate || ''} onChange={handleChange} disabled={!isEditing}/></div>
        <div className="form-field full-width"><label htmlFor="awardDescription">수상 내용</label><textarea id="awardDescription" name="description" value={formData.description || ''} onChange={handleChange} placeholder="수상을 통해 얻은 역량이나 경험에 대해 작성해주세요." disabled={!isEditing}/></div>
      </div>
    </div>
  );
}
export default AwardForm;