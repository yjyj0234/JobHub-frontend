import React from 'react';
import '../../../css/Form.css';

function CertificationForm() {
  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width"><label>자격증명</label><input type="text" placeholder="예) 정보처리기사"/></div>
        <div className="form-field"><label>발급기관</label><input type="text" placeholder="예) 한국산업인력공단"/></div>
        <div className="form-field"><label>취득일</label><input type="date"/></div>
        <div className="form-field"><label>자격증 번호</label><input type="text"/></div>
      </div>
    </div>
  );
}
export default CertificationForm;