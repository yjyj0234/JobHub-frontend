import React from "react";
import "../css/GlobalFooter.css";
import logo from "../assets/img/logo4.png";


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
