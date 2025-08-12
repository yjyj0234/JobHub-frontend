import React from 'react';
import '../css/Form.css';

function LanguageForm() {
  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field"><label htmlFor="language">언어</label><input type="text" id="language" name="language" placeholder="예) 영어"/></div>
        <div className="form-field"><label htmlFor="fluency">숙련도</label><input type="text" id="fluency" name="fluency" placeholder="예) 비즈니스 회화 가능"/></div>
        <div className="form-field"><label htmlFor="testName">어학시험명</label><input type="text" id="testName" name="testName" placeholder="예) TOEIC"/></div>
        <div className="form-field"><label htmlFor="testScore">시험점수</label><input type="text" id="testScore" name="testScore" placeholder="예) 950"/></div>
      </div>
    </div>
  );
}
export default LanguageForm;