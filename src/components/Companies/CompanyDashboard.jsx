import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import JobPostingManagement from "./JobPostingManagement";
import Jobposting from "./Jobposting";

import {
  Building2,
  FileText,
  Users,
  Settings,
  PlusCircle,
  List,
  Home,
} from "lucide-react";
import CompanyProfile from "./CompanyProfile"; // 기업정보 관리 컴포넌트
import "../css/CompanyDashboard.css";
import ApplicantsList from "./ApplicantsList";
const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthed } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingPostingId, setEditingPostingId] = useState(null);

  // 권한 체크
  useEffect(() => {
    if (!isAuthed) {
      alert("로그인이 필요합니다");
      navigate("/");
      return;
    }

    const userType = user?.userType || user?.role || "";
    if (userType.toUpperCase() !== "COMPANY") {
      alert("기업 회원만 접근 가능합니다");
      navigate("/");
    }
  }, [isAuthed, user, navigate]);

  const menuItems = [
    {
      id: "overview",
      label: "대시보드",
      icon: <Home size={20} />,
    },
    {
      id: "profile",
      label: "기업정보 관리",
      icon: <Settings size={20} />,
    },
    {
      id: "postings",
      label: "채용공고 관리",
      icon: <List size={20} />,
    },
    {
      id: "new-posting",
      label: "공고 등록",
      icon: <PlusCircle size={20} />,
    },
    {
      id: "applicants",
      label: "지원자 관리",
      icon: <Users size={20} />,
    },
  ];

  // 콘텐츠 렌더링 함수
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="overview-section">
            <h1>기업 관리 대시보드</h1>
            <div className="quick-stats">
              <div className="stat-card">
                <h3>진행중인 공고</h3>
                <p className="stat-number">0</p>
              </div>
              <div className="stat-card">
                <h3>신규 지원자</h3>
                <p className="stat-number">0</p>
              </div>
              <div className="stat-card">
                <h3>전체 지원자</h3>
                <p className="stat-number">0</p>
              </div>
              <div className="stat-card">
                <h3>임시저장 공고</h3>
                <p className="stat-number">0</p>
              </div>
            </div>

            <div className="quick-actions">
              <h2>빠른 작업</h2>
              <div className="action-buttons">
                <button
                  className="action-btn"
                  onClick={() => setActiveTab("new-posting")}
                >
                  <PlusCircle size={18} />새 공고 등록
                </button>
                <button
                  className="action-btn"
                  onClick={() => setActiveTab("postings")}
                >
                  <List size={18} />
                  공고 목록 보기
                </button>
                <button
                  className="action-btn"
                  onClick={() => setActiveTab("profile")}
                >
                  <Settings size={18} />
                  기업정보 수정
                </button>
              </div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="profile-section">
            <h1>기업정보 관리</h1>
            <div className="profile-wrapper">
              <CompanyProfile embedded={true} />
            </div>
          </div>
        );

      case "postings":
        return (
          <div className="postings-section">
            <h1>채용공고 관리</h1>
            <JobPostingManagement
              onEditClick={(id) => {
                // 수정 모드로 전환
                setEditingPostingId(id);
                setActiveTab("new-posting");
              }}
              onNewClick={() => {
                setEditingPostingId(null);
                setActiveTab("new-posting");
              }}
            />
          </div>
        );

      case "new-posting":
        return (
          <div className="new-posting-section">
            <h1>{editingPostingId ? "공고 수정" : "공고 등록"}</h1>
            <Jobposting embedded={true} postingId={editingPostingId} />
          </div>
        );
      case "applicants":

     return (
        <div className="applicants-seciont">
            <h1>지원자 관리</h1>
            <ApplicantsList/>
        </div>
     );
    }
  };

  return (
    <div className="company-dashboard">
      <div className="dashboard-sidebar">
        <h2>기업 서비스</h2>
        <nav className="dashboard-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="dashboard-content">{renderContent()}</div>
    </div>
  );
};

export default CompanyDashboard;
