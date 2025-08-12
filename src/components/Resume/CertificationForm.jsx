import React from 'react';
import '../css/Form.css';

function CertificationForm() {
  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width"><label htmlFor="certName">자격증명</label><input type="text" id="certName" name="certName" placeholder="예) 정보처리기사"/></div>
        <div className="form-field"><label htmlFor="certIssuer">발급기관</label><input type="text" id="certIssuer" name="certIssuer" placeholder="예) 한국산업인력공단"/></div>
        <div className="form-field"><label htmlFor="certDate">취득일</label><input type="date" id="certDate" name="certDate"/></div>
        <div className="form-field"><label htmlFor="certNumber">자격증 번호</label><input type="text" id="certNumber" name="certNumber"/></div>
      </div>
    </div>
  );
}
export default CertificationForm;