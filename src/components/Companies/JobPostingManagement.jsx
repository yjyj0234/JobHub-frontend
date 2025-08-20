import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import "../css/JobPostingManagement.css";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

const JobPostingManagement = ({ onEditClick, onNewClick }) => {
  const [activeTab, setActiveTab] = useState("OPEN");
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    open: 0,
    draft: 0,
    closed: 0,
    expired: 0,
  });

  // 공고 목록 조회
  const fetchPostings = async () => {
    setLoading(true);
    try {
      // API 엔드포인트는 백엔드 구조에 맞게 수정 필요
      const response = await api.get("/api/company/postings");
      const data = response.data || [];

      // 상태별로 카운트
      const counts = {
        open: data.filter((p) => p.status === "OPEN").length,
        draft: data.filter((p) => p.status === "DRAFT").length,
        closed: data.filter((p) => p.status === "CLOSED").length,
        expired: data.filter((p) => p.status === "EXPIRED").length,
      };

      setStats(counts);
      setPostings(data);
    } catch (error) {
      console.error("공고 목록 조회 실패:", error);
      // 테스트용 더미 데이터
      setPostings([
        {
          id: 1,
          title: "프론트엔드 개발자 채용",
          status: "OPEN",
          viewCount: 120,
          applicationCount: 5,
          createdAt: "2025-01-15",
          closeDate: "2025-02-15",
          locations: ["서울 강남구"],
          employmentType: "정규직",
        },
        {
          id: 2,
          title: "백엔드 개발자 (임시저장)",
          status: "DRAFT",
          viewCount: 0,
          applicationCount: 0,
          createdAt: "2025-01-10",
          closeDate: null,
          locations: ["서울 서초구"],
          employmentType: "정규직",
        },
      ]);
      setStats({ open: 1, draft: 1, closed: 0, expired: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, []);

  // 상태별 필터링
  const filteredPostings = postings.filter((p) => p.status === activeTab);

  // 상태별 아이콘과 색상
  const getStatusIcon = (status) => {
    switch (status) {
      case "OPEN":
        return <CheckCircle size={16} className="status-icon open" />;
      case "DRAFT":
        return <FileText size={16} className="status-icon draft" />;
      case "CLOSED":
        return <XCircle size={16} className="status-icon closed" />;
      case "EXPIRED":
        return <Clock size={16} className="status-icon expired" />;
      default:
        return null;
    }
  };

  // 공고 삭제
  const handleDelete = async (id, title) => {
    if (!confirm(`"${title}" 공고를 삭제하시겠습니까?`)) return;

    try {
      await api.delete(`/api/company/postings/${id}`);
      fetchPostings(); // 목록 새로고침
      alert("삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  // 상태 변경 (임시저장 → 공개, 공개 → 마감 등)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/api/company/postings/${id}/status`, {
        status: newStatus,
      });
      fetchPostings();
      alert("상태가 변경되었습니다.");
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("상태 변경에 실패했습니다.");
    }
  };

  const tabs = [
    { id: "OPEN", label: "채용중", count: stats.open, color: "green" },
    { id: "DRAFT", label: "임시저장", count: stats.draft, color: "gray" },
    { id: "CLOSED", label: "마감", count: stats.closed, color: "red" },
    { id: "EXPIRED", label: "만료", count: stats.expired, color: "orange" },
  ];

  return (
    <div className="job-posting-management">
      {/* 탭 헤더 */}
      <div className="management-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""} ${
              tab.color
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* 공고 리스트 */}
      <div className="postings-list">
        {loading ? (
          <div className="loading-state">불러오는 중...</div>
        ) : filteredPostings.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>등록된 공고가 없습니다</p>
            {activeTab === "DRAFT" && (
              <button className="create-btn" onClick={onNewClick}>
                새 공고 작성하기
              </button>
            )}
          </div>
        ) : (
          filteredPostings.map((posting) => (
            <div key={posting.id} className="posting-card">
              <div className="posting-header">
                <div className="posting-title-section">
                  {getStatusIcon(posting.status)}
                  <h3>{posting.title}</h3>
                </div>
                <div className="posting-actions">
                  {posting.status === "DRAFT" && (
                    <button
                      className="action-btn publish"
                      onClick={() => handleStatusChange(posting.id, "OPEN")}
                      title="공고 공개"
                    >
                      공개하기
                    </button>
                  )}
                  {posting.status === "OPEN" && (
                    <button
                      className="action-btn close"
                      onClick={() => handleStatusChange(posting.id, "CLOSED")}
                      title="공고 마감"
                    >
                      마감하기
                    </button>
                  )}
                  <button
                    className="action-btn edit"
                    onClick={() => onEditClick(posting.id)}
                    title="수정"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(posting.id, posting.title)}
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="posting-info">
                <div className="info-item">
                  <MapPin size={14} />
                  <span>{posting.locations?.join(", ") || "지역 미지정"}</span>
                </div>
                <div className="info-item">
                  <Calendar size={14} />
                  <span>등록일: {posting.createdAt}</span>
                </div>
                {posting.closeDate && (
                  <div className="info-item">
                    <Clock size={14} />
                    <span>마감일: {posting.closeDate}</span>
                  </div>
                )}
              </div>

              <div className="posting-stats">
                <div className="stat-item">
                  <Eye size={14} />
                  <span>조회 {posting.viewCount || 0}</span>
                </div>
                <div className="stat-item">
                  <Users size={14} />
                  <span>지원 {posting.applicationCount || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="employment-type">
                    {posting.employmentType || "고용형태 미지정"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobPostingManagement;
