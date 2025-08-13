import React, { useState } from 'react';
import '../css/Form.css';

function LanguageForm({ data, onUpdate }) {
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
        <div className="form-field"><label htmlFor="language">언어</label><input type="text" id="language" name="language" value={formData.language || ''} onChange={handleChange} placeholder="예) 영어"/></div>
        <div className="form-field"><label htmlFor="fluency">숙련도</label><input type="text" id="fluency" name="fluency" value={formData.fluency || ''} onChange={handleChange} placeholder="예) 비즈니스 회화 가능"/></div>
        <div className="form-field"><label htmlFor="testName">어학시험명</label><input type="text" id="testName" name="testName" value={formData.testName || ''} onChange={handleChange} placeholder="예) TOEIC"/></div>
        <div className="form-field"><label htmlFor="testScore">시험점수</label><input type="text" id="testScore" name="testScore" value={formData.testScore || ''} onChange={handleChange} placeholder="예) 950"/></div>
      </div>
    </div>
  );
}
export default LanguageForm;