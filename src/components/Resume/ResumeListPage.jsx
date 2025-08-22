// src/components/resume/ResumeListPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FilePlus,
  Link as LinkIcon,
  FileText,
  MoreVertical,
  Trash2,
  Copy,
} from "lucide-react";
import "../css/ResumeListPage.css";
import { useAuth } from "../context/AuthContext.jsx";
import { Modal } from "../UI/index.js";
import { Bot } from "lucide-react";

/* ---------------------- 공통 설정 ---------------------- */
const API_BASE_URL = "http://localhost:8080/api"; // 백엔드 표준 프리픽스
axios.defaults.withCredentials = true;

/* ---------------------- 유틸 ---------------------- */
const getUid = (u) => u?.id ?? u?.userId ?? null;

/* ---------------------- 파일 업로드 / URL 모달 (임시) ---------------------- */
const FileUploadForm = () => (
  <>
    <h2>파일 업로드</h2>
    <p>이력서 파일을 이곳에 올려주세요.</p>
    <div className="upload-area">파일을 드래그하거나 클릭하여 업로드</div>
  </>
);

const UrlUploadForm = () => (
  <>
    <h2>URL로 등록</h2>
    <p>Notion, GitHub 등 이력서 URL을 입력해주세요.</p>
    <input type="url" placeholder="https://..." className="url-input" />
    <button className="action-button primary url-submit-btn">등록</button>
  </>
);

function ResumeListPage() {
  const navigate = useNavigate();
  const { user, isAuthed } = useAuth();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalContent, setModalContent] = useState(null); // 'file' | 'url' | null
  const [error, setError] = useState("");

  const openModal = (type) => setModalContent(type);
  const closeModal = () => setModalContent(null);

  /* ---------------------- DB에서 내 이력서 목록 로드 ---------------------- */
  useEffect(() => {
    const fetchMyResumes = async () => {
      if (!isAuthed) {
        setResumes([]);
        return;
      }
      setLoading(true);
      setError("");

      try {
        // 백엔드 표준화: GET /api/resumes → 인증 사용자의 목록 반환
        const res = await axios.get(`${API_BASE_URL}/resumes`, {
          validateStatus: (s) => s >= 200 && s < 500,
        });

        if (res.status === 200 && Array.isArray(res.data)) {
          const data = res.data.slice();
          const toTime = (r) =>
            new Date(
              r.updatedAt || r.lastModified || r.createdAt || "1970-01-01"
            ).getTime();
          data.sort((a, b) => toTime(b) - toTime(a));
          setResumes(data);
        } else if (res.status === 401) {
          setError("로그인이 필요해요.");
          setResumes([]);
        } else {
          setError("이력서 목록을 불러오지 못했어요.");
          setResumes([]);
        }
      } catch (e) {
        console.error("[ResumeList] fetch error:", e);
        setError("이력서 목록을 불러오지 못했어요.");
        setResumes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyResumes();
  }, [isAuthed]);

  /* ---------------------- 액션 핸들러 ---------------------- */
  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm("정말로 이 이력서를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/resumes/${resumeId}`);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
      alert("이력서가 삭제되었습니다.");
    } catch (e) {
      console.error("[ResumeList] delete error:", e);
      const s = e?.response?.status;
      alert(
        e?.response?.data?.message ||
          (s === 401
            ? "로그인이 필요해요."
            : s === 403
            ? "본인 이력서만 삭제할 수 있어요."
            : "삭제 중 오류가 발생했어요.")
      );
    }
  };

  const handleCopyResume = async (resumeId) => {
    // 1순위: 서버에 복사 API가 있을 때 (POST /api/resumes/{id}/copy)
    try {
      const res = await axios.post(
        `${API_BASE_URL}/resumes/${resumeId}/copy`,
        null,
        { validateStatus: (s) => s >= 200 && s < 500 }
      );
      if (res.status === 200 || res.status === 201) {
        const createdId = res.data?.id ?? res.data;
        if (createdId) {
          alert("복사되었습니다. 편집 화면으로 이동합니다.");
          navigate(`/resumes/${createdId}`);
          return;
        }
      }
    } catch (_) {
      /* no-op, fallback 진행 */
    }

    // 2순위: 복사 API가 없으면 → 원본 조회 후 기본 필드로 새로 생성
    try {
      const orig = await axios.get(`${API_BASE_URL}/resumes/${resumeId}`);
      const o = orig.data || {};
      const payload = {
        title: (o.title || "이력서") + " - 복사본",
        isPrimary: !!o.isPrimary,
        isPublic: !!o.isPublic,
        status: o.status || "작성 중",
      };
      const resCreate = await axios.post(`${API_BASE_URL}/resumes`, payload);
      const newId = resCreate.data?.id ?? resCreate.data;
      alert("복사되었습니다. 편집 화면으로 이동합니다.");
      navigate(`/resumes/${newId}`);
    } catch (e) {
      console.error("[ResumeList] copy error:", e);
      alert("복사 중 오류가 발생했어요.");
    }
  };

  const handleCreateResume = () => {
    if (!isAuthed) {
      alert("로그인이 필요해요.");
      return;
    }

    // 에디터에 "학력" 섹션 1개를 기본으로 넘겨주고, 포커스도 학력으로 지정
    navigate("/resumes/new", {
      state: {
        presetSections: [
          {
            id: `educations-${Date.now()}`,
            type: "educations",
            data: [{ subId: `educations-item-${Date.now()}` }],
          },
        ],
        presetFocusSectionType: "educations",
      },
    });
  };

  /* ---------------------- 카드 ---------------------- */
  const ResumeCard = ({ resume }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const uid = getUid(user);
    const ownerId =
      resume.userId ?? resume.ownerId ?? resume.createdBy ?? resume.user?.id;
    const isMine =
      uid != null && ownerId != null && String(uid) === String(ownerId);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const openForEditOrView = () => {
      if (isMine) navigate(`/resumes/${resume.id}`);
      else {
        if (resume.isPublic) navigate(`/resumes/${resume.id}`);
        else alert("다른 사용자의 이력서는 열람할 수 없어요.");
      }
    };

    const lastMod =
      resume.updatedAt || resume.lastModified || resume.createdAt || "";

    return (
      <div
        className={`resume-card ${resume.isPrimary ? "representative" : ""}`}
      >
        <div className="card-header">
          <div className="card-title-group">
            {resume.isPrimary && <span className="rep-badge">대표</span>}
            <h3 className="resume-title">{resume.title || "제목 없음"}</h3>
          </div>
          <div className="more-button-wrapper" ref={dropdownRef}>
            {isMine && (
              <>
                <button
                  className="more-button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  title="더보기"
                >
                  <MoreVertical size={20} />
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <button
                      onClick={() => {
                        handleCopyResume(resume.id);
                        setDropdownOpen(false);
                      }}
                    >
                      <Copy size={14} /> 복사
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteResume(resume.id);
                        setDropdownOpen(false);
                      }}
                      className="delete"
                    >
                      <Trash2 size={14} /> 삭제
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="card-body">
          <span
            className={`status-tag ${
              (resume.status || "작성 중") === "작성 중"
                ? "writing"
                : "completed"
            }`}
          >
            {resume.status || "작성 중"}
          </span>
          <p className="resume-meta">
            {lastMod
              ? `${String(lastMod).slice(0, 10)} 수정`
              : "날짜 정보 없음"}
          </p>
        </div>

        <div className="card-footer">
          <button
            className="action-button main-action"
            onClick={openForEditOrView}
          >
            {isMine ? "이력서 수정" : "이력서 보기"}
          </button>
        </div>
      </div>
    );
  };

  /* ---------------------- 렌더 ---------------------- */
  return (
    <>
      <Modal isOpen={!!modalContent} onClose={closeModal}>
        {modalContent === "file" && <FileUploadForm />}
        {modalContent === "url" && <UrlUploadForm />}
      </Modal>

      <div className="resume-list-page">
        <div className="list-page-header">
          <h1>나의 이력서</h1>
          <div className="new-resume-buttons">
            <button
              className="new-resume-btn"
              onClick={() => openModal("file")}
            >
              <FilePlus size={16} /> 파일 등록
            </button>
            <button className="new-resume-btn" onClick={() => openModal("url")}>
              <LinkIcon size={16} /> URL 등록
            </button>
            <button
              className="new-resume-btn primary"
              onClick={handleCreateResume}
            >
              이력서 새로 작성
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-list-message">불러오는 중...</div>
        ) : error ? (
          <div className="empty-list-message">{error}</div>
        ) : (
          <div className="resume-grid-container">
            {isAuthed ? (
              resumes.length > 0 ? (
                resumes.map((resume) => (
                  <ResumeCard key={resume.id} resume={resume} />
                ))
              ) : (
                <div className="empty-list-message">
                  작성된 이력서가 없습니다. 새 이력서를 작성해보세요.
                </div>
              )
            ) : (
              <div className="empty-list-message">
                로그인 후 이력서를 관리할 수 있습니다.
              </div>
            )}
          </div>
        )}

        <div className="activity-stats-container">
          <h2>나의 활동 현황 </h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span>0</span>
              <p>입사지원</p>
            </div>
            <div className="stat-item">
              <span>0</span>
              <p>스크랩</p>
            </div>
            <div className="stat-item">
              <span>0</span>
              <p>받은 제안</p>
            </div>
            <div className="stat-item">
              <span>0</span>
              <p>이력서 열람</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResumeListPage;
