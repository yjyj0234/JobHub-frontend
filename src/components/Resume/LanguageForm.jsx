import React from 'react';
import '../css/Form.css';

function LanguageForm() {
  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field"><label>언어</label><input type="text" placeholder="예) 영어"/></div>
        <div className="form-field"><label>숙련도</label><input type="text" placeholder="예) 비즈니스 회화 가능"/></div>
        <div className="form-field"><label>어학시험명</label><input type="text" placeholder="예) TOEIC"/></div>
        <div className="form-field"><label>시험점수</label><input type="text" placeholder="예) 950"/></div>
      </div>
    </div>
  );
}
export default LanguageForm;