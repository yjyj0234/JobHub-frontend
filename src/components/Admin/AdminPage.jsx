import React from "react";
import { useNavigate } from "react-router-dom";
// ArrowLeft 아이콘은 이제 필요 없으므로 삭제해도 됩니다.
import {
  Users,
  FileText,
  ShieldQuestion,
  MessageSquareWarning,
} from "lucide-react";
import "../css/AdminPage.css";

function AdminPage() {
  const navigate = useNavigate();

  // handleGoBack 함수 전체를 삭제합니다.

  // 각 관리 페이지로 이동하는 함수들
  const goToUserAdmin = () => {
    alert("회원 관리 페이지는 현재 준비 중입니다.");
  };

  const goToPostingAdmin = () => {
    alert("공고 관리 페이지는 현재 준비 중입니다.");
  };

  const goToFaqAdmin = () => {
    navigate("/admin/faq");
  };

  const goToReportAdmin = () => {
    alert("신고 관리 페이지는 현재 준비 중입니다.");
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-content">
        {/* 헤더에서 뒤로가기 버튼이 있던 부분을 삭제했습니다. */}
        <div className="admin-header">
          <h1>관리자 페이지</h1>
        </div>
        <p className="admin-subtitle">
          JobHub의 사용자, 게시물, FAQ 등을 관리하세요.
        </p>
        <div className="admin-menu">
          <div className="admin-menu-card" onClick={goToUserAdmin}>
            <Users size={48} className="menu-icon" />
            <h2>회원 관리</h2>
            <p>사용자 정보 조회 및 관리</p>
          </div>
          <div className="admin-menu-card" onClick={goToPostingAdmin}>
            <FileText size={48} className="menu-icon" />
            <h2>공고 관리</h2>
            <p>채용 공고 모니터링 및 제재</p>
          </div>
          <div className="admin-menu-card" onClick={goToFaqAdmin}>
            <ShieldQuestion size={48} className="menu-icon" />
            <h2>FAQ 관리</h2>
            <p>자주 묻는 질문 등록 및 수정</p>
          </div>
          <div className="admin-menu-card" onClick={goToReportAdmin}>
            <MessageSquareWarning size={48} className="menu-icon" />
            <h2>신고 관리</h2>
            <p>사용자 신고 내역 확인 및 처리</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;