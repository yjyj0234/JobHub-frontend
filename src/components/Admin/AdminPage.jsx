// src/components/Admin/AdminPage.jsx
import React from 'react';
import '../css/AdminPage.css';
import { Shield, HelpCircle, MessageSquare, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom'; // Link import 추가

const AdminPage = () => {
  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <Shield size={48} />
        <h1>관리자 페이지</h1>
        <p>JobHub의 주요 기능을 관리하세요.</p>
      </div>

      <div className="admin-menu-grid">
        {/* FAQ 관리 카드를 Link로 감싸고, button을 div로 변경 */}
        <Link to="/admin/faq" className="admin-menu-item-link">
          <div className="admin-menu-item">
            <HelpCircle size={32} />
            <h3>FAQ 관리</h3>
            <p>자주 묻는 질문을 등록하고 수정합니다.</p>
            <div className="admin-button">관리하기</div>
          </div>
        </Link>

        <Link to="/admin/notices" className="admin-menu-item-link">
          <div className="admin-menu-item">
            <Megaphone size={32} />
            <h3>공지사항 관리</h3>
            <p>서비스 공지사항을 작성하고 관리합니다.</p>
            <div className="admin-button">관리하기</div>
          </div>
        </Link>

        {/* 나머지 항목들은 그대로 둡니다. */}
        <div className="admin-menu-item">
          <MessageSquare size={32} />
          <h3>1:1 문의 관리</h3>
          <p>사용자들의 1:1 문의에 답변합니다.</p>
          <button className="admin-button">관리하기</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;