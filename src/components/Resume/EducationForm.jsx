import React from 'react';
import '../css/Form.css';

function EducationForm() {
  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width"><label>학교명</label><input type="text" placeholder="예) 잡Hub대학교"/></div>
        <div className="form-field"><label>전공</label><input type="text" placeholder="예) 컴퓨터공학과"/></div>
        <div className="form-field"><label>학위</label><input type="text" placeholder="예) 학사"/></div>
        <div className="form-field"><label>입학일</label><input type="date"/></div>
        <div className="form-field"><label>졸업일</label><input type="date"/></div>
        <div className="form-field"><label>학점</label><input type="text" placeholder="예) 3.8"/></div>
        <div className="form-field"><label>최대학점</label><input type="text" placeholder="예) 4.5"/></div>
      </div>
    </div>
  );
}
export default EducationForm;