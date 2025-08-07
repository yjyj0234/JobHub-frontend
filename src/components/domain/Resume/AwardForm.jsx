import React from 'react';
import '../../../css/Form.css';

function AwardForm() {
  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width"><label>수상명</label><input type="text" placeholder="예) 전국 대학생 코딩 경진대회 대상"/></div>
        <div className="form-field"><label>수여기관</label><input type="text" placeholder="예) 한국정보올림피아드"/></div>
        <div className="form-field"><label>수상일</label><input type="date"/></div>
        <div className="form-field full-width"><label>수상 내용</label><textarea placeholder="수상을 통해 얻은 역량이나 경험에 대해 작성해주세요."/></div>
      </div>
    </div>
  );
}
export default AwardForm;