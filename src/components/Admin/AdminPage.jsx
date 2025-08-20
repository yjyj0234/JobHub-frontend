import React from 'react';
import '../css/AdminPage.css';
import { Shield, HelpCircle, MessageSquare, Megaphone } from 'lucide-react';

const AdminPage = () => {
  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <Shield size={48} />
        <h1>관리자 페이지</h1>
        <p>JobHub의 주요 기능을 관리하세요.</p>
      </div>

      <div className="admin-menu-grid">
        <div className="admin-menu-item">
          <HelpCircle size={32} />
          <h3>FAQ 관리</h3>
          <p>자주 묻는 질문을 등록하고 수정합니다.</p>
          <button className="admin-button">관리하기</button>
        </div>

        <div className="admin-menu-item">
          <MessageSquare size={32} />
          <h3>1:1 문의 관리</h3>
          <p>사용자들의 1:1 문의에 답변합니다.</p>
          <button className="admin-button">관리하기</button>
        </div>

        <div className="admin-menu-item">
          <Megaphone size={32} />
          <h3>공지사항 관리</h3>
          <p>서비스 공지사항을 작성하고 관리합니다.</p>
          <button className="admin-button">관리하기</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;