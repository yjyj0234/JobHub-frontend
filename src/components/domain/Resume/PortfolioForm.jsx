import React from 'react';
import '../../../css/Form.css';

function PortfolioForm() {
  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width"><label>포트폴리오 제목</label><input type="text" placeholder="포트폴리오를 잘 나타낼 수 있는 제목을 입력하세요"/></div>
        <div className="form-field full-width"><label>URL</label><input type="url" placeholder="http://..."/></div>
        <div className="form-field full-width"><label>설명</label><textarea placeholder="포트폴리오에 대한 간단한 설명을 작성해주세요."/></div>
      </div>
    </div>
  );
}
export default PortfolioForm;