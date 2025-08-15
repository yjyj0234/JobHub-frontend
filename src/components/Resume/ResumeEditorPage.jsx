// src/components/resume/ResumeEditorPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../css/ResumeEditorPage.css";
import {
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Server,
  Save,
  Eye,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import {
  ExperienceForm,
  EducationForm,
  ActivityForm,
  AwardForm,
  CertificationForm,
  LanguageForm,
  PortfolioForm,
  SkillForm,
  ProjectForm,
  ResumePreviewModal,
} from "./";
import { useAuth } from "../context/AuthContext.jsx";

const ResumeStatusPalette = ({
  completeness,
  isRepresentative,
  onRepChange,
  isPublic,
  onPublicChange,
}) => {
  return (
    <aside className="resume-status-palette">
      <div className="completeness-meter">
        <div className="meter-header">
          <span>완성도</span>
          <span>{completeness}%</span>
        </div>
        <div className="meter-bar-background">
          <div
            className="meter-bar-foreground"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>
      <div className="status-toggles">
        <div className="toggle-item">
          <label>대표 이력서</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="rep-switch"
              checked={isRepresentative}
              onChange={onRepChange}
            />
            <label htmlFor="rep-switch" />
          </div>
        </div>
        <div className="toggle-item">
          <label>공개 여부</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="public-switch"
              checked={isPublic}
              onChange={onPublicChange}
            />
            <label htmlFor="public-switch" />
          </div>
        </div>
      </div>
    </aside>
  );
};

const EditorSection = ({ title, onRemove, children }) => (
  <section className="editor-section">
    <div className="section-header">
      <h2>{title}</h2>
      <button className="delete-item-btn" onClick={onRemove}>
        <Trash2 size={16} /> 삭제
      </button>
    </div>
    <div className="section-content">{children}</div>
  </section>
);

const EditorPalette = ({ onAddItem, addedSections }) => {
  const allItems = [
    { id: "experiences", name: "경력", icon: <Briefcase size={20} /> },
    { id: "educations", name: "학력", icon: <GraduationCap size={20} /> },
    { id: "skills", name: "기술", icon: <Server size={20} /> },
    { id: "projects", name: "프로젝트", icon: <Server size={20} /> },
    { id: "activities", name: "대외활동", icon: <Award size={20} /> },
    { id: "awards", name: "수상", icon: <Award size={20} /> },
    { id: "certifications", name: "자격증", icon: <Award size={20} /> },
    { id: "languages", name: "외국어", icon: <Languages size={20} /> },
    { id: "portfolios", name: "포트폴리오", icon: <LinkIcon size={20} /> },
  ];

  return (
    <aside className="editor-palette">
      <h3>항목 추가</h3>
      <div className="palette-grid">
        {allItems.map((item) => {
          const isAdded = addedSections.includes(item.id);
          return (
            <button
              key={item.id}
              className={`palette-item ${isAdded ? "disabled" : ""}`}
              onClick={() => onAddItem(item.id)}
              disabled={isAdded}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

function ResumeEditorPage() {
  const navigate = useNavigate();
  const { resumeId: resumeParam } = useParams(); // ✅ 라우트에서만 ID 읽기
  const resumeId = resumeParam ? Number(resumeParam) : null; // 숫자화
  const { user } = useAuth();

  const [sections, setSections] = useState([]);
  const [resumeTitle, setResumeTitle] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRepresentative, setIsRepresentative] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const sectionComponents = {
    experiences: { title: "경력", component: ExperienceForm },
    educations: { title: "학력", component: EducationForm },
    skills: { title: "기술", component: SkillForm },
    activities: { title: "대외활동", component: ActivityForm }, // 서버 CRUD 폼 (편집 모드에서만 서버)
    awards: { title: "수상 경력", component: AwardForm },
    certifications: { title: "자격증", component: CertificationForm },
    languages: { title: "외국어", component: LanguageForm },
    portfolios: { title: "포트폴리오", component: PortfolioForm },
    projects: { title: "프로젝트", component: ProjectForm },
  };

  // (선택) 로컬 초안 복원: 새로운 작성에도 계속 이어서 쓸 수 있게
  useEffect(() => {
    if (!resumeId) {
      const draft = JSON.parse(localStorage.getItem("resume_draft") || "null");
      if (draft) {
        setResumeTitle(draft.title || "");
        setSections(draft.sections || []);
        setIsRepresentative(!!draft.isRepresentative);
        setIsPublic(draft.isPublic ?? true);
      }
    }
  }, [resumeId]);

  // 드래프트 자동 저장
  useEffect(() => {
    if (!resumeId) {
      const draft = {
        title: resumeTitle,
        sections,
        isRepresentative,
        isPublic,
      };
      localStorage.setItem("resume_draft", JSON.stringify(draft));
    }
  }, [resumeTitle, sections, isRepresentative, isPublic, resumeId]);

  // 완성도 계산
  const completeness = useMemo(() => {
    const addedCount = sections.length;
    const filledCount = sections.filter((s) =>
      Object.values(s.data || {}).some((v) => v)
    ).length;
    const titleBonus = resumeTitle.trim() !== "" ? 10 : 0;
    const sectionBonus = Math.round((filledCount / (addedCount || 1)) * 90);
    return Math.min(100, titleBonus + sectionBonus);
  }, [sections, resumeTitle]);

  const handleAddItem = (itemType) => {
    // ✅ 예전의 "!resumeId면 activities 금지" 가드 제거 (드래프트 입력 허용)
    if (sections.some((s) => s.type === itemType)) {
      alert("이미 추가된 항목입니다.");
      return;
    }
    const newSection = {
      id: `${itemType}-${Date.now()}`,
      type: itemType,
      data: {},
    };
    setSections((prev) => [...prev, newSection]);
  };

  const handleRemoveItem = (sectionId) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const handleSectionChange = (sectionId, updatedData) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, data: updatedData } : s))
    );
  };

  const buildResumePayload = () => ({
    title: resumeTitle.trim(),
    isPrimary: !!isRepresentative,
    isPublic: !!isPublic,
    // 서버가 status를 자동 결정하도록 completionRate만 전달
    completionRate: completeness,
  });
  const postActivitiesBulk = async (finalResumeId) => {
    const actSections = sections.filter((s) => s.type === "activities");
    for (const sec of actSections) {
      const a = sec.data || {};
      if (!a.activityName?.trim()) continue;
      const payload = {
        activityName: a.activityName.trim(),
        organization: a.organization || "",
        role: a.role || "",
        startDate: a.startDate || null,
        endDate: a.endDate || null,
        description: a.description || "",
      };
      await axios.post(`/resumes/${finalResumeId}/activities`, payload, {
        withCredentials: true,
      });
    }
  };

  const handleTemporarySave = () => {
    // 서버 저장 없이 드래프트만
    alert("임시 저장 완료 (로컬 드래프트)");
  };

  const handleFinalSave = async () => {
    if (!user) return alert("로그인이 필요합니다.");
    if (!resumeTitle.trim()) return alert("이력서 제목을 입력해주세요.");

    setIsSaving(true);
    try {
      if (!resumeId) {
        // (신규 작성) 작성 완료 시에만 INSERT
        const { data } = await axios.post("/resumes", buildResumePayload(), {
          withCredentials: true,
        });
        const createdId = typeof data === "number" ? data : Number(data?.id);
        if (!createdId) throw new Error("생성된 이력서 ID가 없습니다.");

        // 활동 일괄 업로드
        await postActivitiesBulk(createdId);

        // 드래프트 비우고 편집 페이지로 이동
        localStorage.removeItem("resume_draft");
        navigate(`/resumes/${createdId}/edit`);
        alert("이력서 작성이 완료되었습니다!");
      } else {
        // (편집 모드) 기본 정보만 갱신
        await axios.put(`/resumes/${resumeId}`, buildResumePayload(), {
          withCredentials: true,
        });
        alert("이력서가 저장되었습니다.");
      }
    } catch (err) {
      console.error("[FinalSave] error:", err);
      const s = err?.response?.status;
      alert(
        err?.response?.data?.message ||
          (s === 401
            ? "로그인이 필요해요."
            : s === 403
            ? "권한이 없어요."
            : "저장 중 오류가 발생했어요.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ResumePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={resumeTitle}
        user={user}
        sections={sections}
        sectionComponents={sectionComponents}
      />

      <div className="resume-editor-page">
        <main className="editor-main">
          <div className="editor-header">
            <input
              type="text"
              className="resume-title-input"
              placeholder="이력서 제목 입력"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
            />
            <div className="editor-actions">
              <button
                className="action-btn"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye size={16} /> 미리보기
              </button>
              <button
                className="action-btn"
                onClick={handleTemporarySave}
                disabled={isSaving}
              >
                <Save size={16} /> 임시저장
              </button>
              <button
                className="action-btn primary"
                onClick={handleFinalSave}
                disabled={isSaving}
              >
                {isSaving ? "저장 중..." : "작성 완료"}
              </button>
            </div>
          </div>

          <div className="editor-content">
            {sections.length === 0 && (
              <div className="editor-placeholder">
                오른쪽 팔레트에서 추가할 항목을 클릭하여 이력서 작성을
                시작하세요.
              </div>
            )}

            {sections.map((section) => {
              const def = sectionComponents[section.type];
              if (!def) return null;
              const { component: Comp, title } = def;

              if (section.type === "activities") {
                return (
                  <EditorSection
                    key={section.id}
                    title={title}
                    onRemove={() => handleRemoveItem(section.id)}
                  >
                    <ActivityForm
                      resumeId={resumeId || undefined}
                      serverMode={!!resumeId} // ✅ 신규 작성(없음)=드래프트, 편집(있음)=서버 CRUD
                      activity={section.data?.id ? section.data : undefined}
                      onSaved={(saved) =>
                        handleSectionChange(section.id, saved)
                      } // 서버 모드
                      onUpdate={(draft) =>
                        handleSectionChange(section.id, draft)
                      } // 드래프트 모드
                      onDelete={() => handleRemoveItem(section.id)}
                    />
                  </EditorSection>
                );
              }

              return (
                <EditorSection
                  key={section.id}
                  title={title}
                  onRemove={() => handleRemoveItem(section.id)}
                >
                  <Comp
                    data={section.data}
                    onUpdate={(updated) =>
                      handleSectionChange(section.id, updated)
                    }
                  />
                </EditorSection>
              );
            })}
          </div>
        </main>

        <div className="editor-sidebar">
          <ResumeStatusPalette
            completeness={completeness}
            isRepresentative={isRepresentative}
            onRepChange={() => setIsRepresentative((p) => !p)}
            isPublic={isPublic}
            onPublicChange={() => setIsPublic((p) => !p)}
          />
          <EditorPalette
            onAddItem={handleAddItem}
            addedSections={sections.map((s) => s.type)}
          />
        </div>
      </div>
    </>
  );
}

export default ResumeEditorPage;
