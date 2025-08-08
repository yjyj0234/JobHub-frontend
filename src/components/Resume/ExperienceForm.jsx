/**
 * src/components/domain/Resume/ExperienceForm.jsx
 * --------------------------------
 * [기능 추가] '경력' 항목의 실제 데이터를 관리하는 폼 컴포넌트
 *
 * 주요 기능:
 * 1. 자체적인 상태(formData)를 가지고 사용자 입력을 관리합니다.
 * 2. 부모로부터 받은 데이터(props.data)로 초기 상태를 설정합니다.
 * 3. 입력 필드의 내용이 변경될 때마다, `onUpdate` 함수를 호출하여 부모(ResumeEditorPage)에게 최신 데이터를 전달합니다.
 */
import React, { useState } from 'react';
import '../css/Form.css';

function ExperienceForm({ data, onUpdate }) {
  // 각 입력 필드의 값을 관리하는 상태. 부모로부터 받은 `data`로 초기화합니다.
  const [formData, setFormData] = useState({
    companyName: data.companyName || '',
    role: data.role || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
  });

  /**
   * 입력 필드 변경 핸들러 함수
   * 어떤 입력 필드(`name`)의 값이 어떻게(`value`) 바뀌었는지 감지하여 상태를 업데이트합니다.
   */
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
          <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="예) 잡Hub"/>
        </div>
        <div className="form-field">
          <label>직책/직급</label>
          <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="예) 프론트엔드 개발자"/>
        </div>
        <div className="form-field">
          <label>입사일</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange}/>
        </div>
        <div className="form-field">
          <label>퇴사일</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange}/>
        </div>
      </div>
    </div>
  );
}
export default ExperienceForm;