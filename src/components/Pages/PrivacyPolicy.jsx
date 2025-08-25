// src/components/pages/PrivacyPolicy.jsx
import React from 'react';
import '../css/LegalPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page-container">
      <div className="legal-header">
        <h1>개인정보처리방침</h1>
        <p>여러분의 개인정보를 소중하게 생각합니다.</p>
      </div>
      <div className="legal-content">
        <h2>1. 수집하는 개인정보의 항목 및 수집 방법</h2>
        <p>회사는 회원가입, 원활한 고객상담, 각종 서비스의 제공을 위해 최초 회원가입 당시 아래와 같은 최소한의 개인정보를 필수항목으로 수집하고 있습니다.</p>
        
        <h3>가. 수집항목</h3>
        <p>- 개인회원 : 이름, 이메일 주소, 비밀번호...</p>
        <p>- 기업회원 : 회사명, 사업자등록번호, 담당자 이름...</p>

        <h2>2. 개인정보의 수집 및 이용 목적</h2>
        <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다...</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;