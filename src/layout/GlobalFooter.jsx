/**
 * src/layout/GlobalFooter.jsx
 * --------------------------------
 * 모든 페이지 하단에 공통으로 표시될 푸터 컴포넌트입니다.
 */
import React from 'react';
import '../css/GlobalFooter.css'; // 푸터 전용 CSS
import logo from '../assets/img/logo3.png'; // 로고 이미지

function GlobalFooter() {
  return (
    <footer className="global-footer">
      <div className="footer-content container">
        <div className="footer-left">
          <img src={logo} alt="JobHub" className="footer-logo" />
          <p className="footer-description">
            당신의 커리어 여정, JobHub와 함께.
          </p>
        </div>
        <div className="footer-right">
          <div className="footer-links">
            <a href="#">회사소개</a>
            <a href="#">이용약관</a>
            <a href="#">개인정보처리방침</a>
            <a href="#">고객센터</a>
          </div>
          <p className="footer-copyright">
            © 2025 JobHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default GlobalFooter;