// src/components/pages/TermsOfService.jsx
import React from 'react';
import '../css/LegalPages.css';

const TermsOfService = () => {
  return (
    <div className="legal-page-container">
      <div className="legal-header">
        <h1>이용약관</h1>
        <p>JobHub 서비스 이용에 관한 규정입니다.</p>
      </div>
      <div className="legal-content">
        <h2>제1장 총칙</h2>
        <h3>제1조 (목적)</h3>
        <p>본 약관은 JobHub가 제공하는 모든 서비스의 이용 조건 및 절차, 회원과 회사 간의 권리, 의무 및 책임 사항 등을 규정함을 목적으로 합니다.</p>
        
        <h3>제2조 (용어의 정의)</h3>
        <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다. '서비스'라 함은 회사가 제공하는 모든 서비스를 의미합니다...</p>

        <h2>제2장 서비스 이용 계약</h2>
        <h3>제3조 (이용 계약의 성립)</h3>
        <p>이용 계약은 서비스를 이용하고자 하는 자의 이용 신청에 대한 회사의 이용 승낙으로 성립합니다...</p>
      </div>
    </div>
  );
};

export default TermsOfService;