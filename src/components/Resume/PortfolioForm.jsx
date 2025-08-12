import React from 'react';
import '../css/Form.css';

function EducationForm() {
  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width"><label htmlFor="schoolName">학교명</label><input type="text" id="schoolName" name="schoolName" placeholder="예) 잡Hub대학교"/></div>
        <div className="form-field"><label htmlFor="major">전공</label><input type="text" id="major" name="major" placeholder="예) 컴퓨터공학과"/></div>
        <div className="form-field"><label htmlFor="degree">학위</label><input type="text" id="degree" name="degree" placeholder="예) 학사"/></div>
        <div className="form-field"><label htmlFor="eduStartDate">입학일</label><input type="date" id="eduStartDate" name="eduStartDate"/></div>
        <div className="form-field"><label htmlFor="eduEndDate">졸업일</label><input type="date" id="eduEndDate" name="eduEndDate"/></div>
        <div className="form-field"><label htmlFor="gpa">학점</label><input type="text" id="gpa" name="gpa" placeholder="예) 3.8"/></div>
        <div className="form-field"><label htmlFor="maxGpa">최대학점</label><input type="text" id="maxGpa" name="maxGpa" placeholder="예) 4.5"/></div>
      </div>
    </div>
  );
}
export default EducationForm;