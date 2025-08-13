import React, { useState } from 'react';
import '../css/Form.css';

function ActivityForm({ data, onUpdate }) {
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
        <div className="form-field full-width"><label htmlFor="activityName">활동명</label><input type="text" id="activityName" name="activityName" value={formData.activityName || ''} onChange={handleChange} placeholder="예) 잡Hub 개발 동아리"/></div>
        <div className="form-field"><label htmlFor="activityOrg">활동 기관/단체</label><input type="text" id="activityOrg" name="activityOrg" value={formData.activityOrg || ''} onChange={handleChange} placeholder="예) 잡Hub대학교"/></div>
        <div className="form-field"><label htmlFor="activityRole">역할</label><input type="text" id="activityRole" name="activityRole" value={formData.activityRole || ''} onChange={handleChange} placeholder="예) 팀장"/></div>
        <div className="form-field"><label htmlFor="activityStartDate">시작일</label><input type="date" id="activityStartDate" name="startDate" value={formData.startDate || ''} onChange={handleChange}/></div>
        <div className="form-field"><label htmlFor="activityEndDate">종료일</label><input type="date" id="activityEndDate" name="endDate" value={formData.endDate || ''} onChange={handleChange}/></div>
        <div className="form-field full-width"><label htmlFor="activityDesc">활동 설명</label><textarea id="activityDesc" name="description" value={formData.description || ''} onChange={handleChange} placeholder="어떤 활동이었고, 본인의 역할은 무엇이었는지 구체적으로 작성해주세요."/></div>
      </div>
    </div>
  );
}
export default ActivityForm;