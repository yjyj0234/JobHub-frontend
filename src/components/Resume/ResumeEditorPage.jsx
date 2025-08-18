// src/components/resume/ResumeEditorPage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/ResumeEditorPage.css";
import {
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Link as LinkIcon,
  Trash2,
  Eye,
  Server,
  Save,
  User,
  Phone,
  MapPin,
  Calendar,
  PlusCircle,
  X,
  Camera,
  Pencil,
} from "lucide-react";
import {
  ExperienceForm,
  EducationForm,
  AwardForm,
  CertificationForm,
  LanguageForm,
  PortfolioForm,
  SkillForm,
  ProjectForm,
  ResumePreviewModal,
} from "./index.js";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

/* ---------------------- 유틸 ---------------------- */
const getUid = (u) => u?.id ?? u?.userId ?? null;
const trimOrNull = (v) => (typeof v === "string" ? v.trim() || null : v);
const toIntOrNull = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

/* ---------------------- 로컬 전용 활동 폼 ---------------------- */
const ActivityItemForm = ({ data = {}, onUpdate }) => {
  const onChange = (e) => {
    const { name, value } = e.target;
    onUpdate?.({ ...data, [name]: value });
  };
  return (
    <div className="item-form grid-layout">
      <div className="form-field full-width">
        <label>활동명</label>
        <input
          name="activityName"
          value={data.activityName || ""}
          onChange={onChange}
          placeholder="예) 개발 동아리, 해커톤 참여"
        />
      </div>
      <div className="form-field">
        <label>기관/단체</label>
        <input
          name="organization"
          value={data.organization || ""}
          onChange={onChange}
        />
      </div>
      <div className="form-field">
        <label>역할</label>
        <input name="role" value={data.role || ""} onChange={onChange} />
      </div>
      <div className="form-field">
        <label>시작일</label>
        <input
          type="date"
          name="startDate"
          value={data.startDate || ""}
          onChange={onChange}
        />
      </div>
      <div className="form-field">
        <label>종료일</label>
        <input
          type="date"
          name="endDate"
          value={data.endDate || ""}
          onChange={onChange}
        />
      </div>
      <div className="form-field full-width">
        <label>설명</label>
        <textarea
          name="description"
          value={data.description || ""}
          onChange={onChange}
          placeholder="무엇을 했고, 어떤 임팩트가 있었는지 적어주세요."
        />
      </div>
    </div>
  );
};

/* ---------------------- 프로필 헤더 ---------------------- */
const ProfileHeader = ({ profile, onUpdate, onSave }) => {
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  if (!profile)
    return <div className="profile-header loading">프로필 정보 로딩 중...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "regionName") {
      onUpdate({ ...profile, regionName: value, regionId: null });
    } else {
      onUpdate({ ...profile, [name]: value });
    }
  };

  const handlePhotoClick = () => {
    if (!isEditing) return; // 편집 중에만 변경 허용
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      onUpdate({ ...profile, profileImageUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSaveClick = async () => {
    try {
      await onSave?.();
    } finally {
      setIsEditing(false); // 저장 후 편집 종료
    }
  };

  return (
    <div className="profile-header" style={{ position: "relative" }}>
      {/* 오른쪽 상단 편집 토글 */}
      {!isEditing ? (
        <button
          type="button"
          className="profile-edit-toggle"
          onClick={() => setIsEditing(true)}
          title="프로필 수정"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <Pencil size={16} />
          <span style={{ fontSize: 12 }}>수정</span>
        </button>
      ) : (
        <div
          className="profile-edit-actions"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            gap: 8,
          }}
        >
          <button
            type="button"
            className="action-btn primary"
            onClick={handleSaveClick}
          >
            <Save size={16} /> 저장
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={() => setIsEditing(false)}
            title="편집 취소"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div
        className="profile-photo-edit-wrapper"
        onClick={handlePhotoClick}
        style={{ cursor: isEditing ? "pointer" : "default" }}
      >
        <div className="profile-photo-wrapper">
          {profile.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt={profile.name || "프로필"}
              className="profile-photo"
              style={{ opacity: isEditing ? 1 : 0.9 }}
            />
          ) : (
            <div className="profile-photo-placeholder">
              <User size={40} />
            </div>
          )}
          <div
            className="photo-edit-icon"
            style={{ opacity: isEditing ? 1 : 0.4 }}
          >
            <Camera size={16} />
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handlePhotoChange}
          accept="image/*"
          disabled={!isEditing}
        />
      </div>

      <div className="profile-details">
        <input
          type="text"
          name="name"
          className="profile-name-input"
          value={profile.name || ""}
          onChange={handleChange}
          placeholder="이름"
          readOnly={!isEditing}
        />
        <input
          type="text"
          name="headline"
          className="profile-headline-input"
          value={profile.headline || ""}
          onChange={handleChange}
          placeholder="한 줄 소개를 작성해주세요."
          readOnly={!isEditing}
        />

        <div className="profile-info-grid">
          <div className="profile-info-item">
            <Phone size={14} />
            <input
              name="phone"
              value={profile.phone || ""}
              onChange={handleChange}
              placeholder="연락처"
              readOnly={!isEditing}
            />
          </div>
          <div className="profile-info-item">
            <MapPin size={14} />
            <input
              name="regionName"
              value={profile.regionName || ""}
              onChange={handleChange}
              placeholder="거주지역 (예: 서울특별시)"
              readOnly={!isEditing}
            />
          </div>
          <div className="profile-info-item">
            <Calendar size={14} />
            <input
              type="date"
              name="birthDate"
              value={profile.birthDate || ""}
              onChange={(e) =>
                onUpdate({ ...profile, birthDate: e.target.value })
              }
              placeholder="생년월일"
              disabled={!isEditing} // date는 disabled가 더 자연스러움
            />
          </div>
        </div>

        <div className="profile-info-wide">
          <label>자기소개</label>
          <textarea
            name="summary"
            value={profile.summary || ""}
            onChange={handleChange}
            placeholder="간단한 자기소개를 입력해주세요."
            readOnly={!isEditing}
          />
        </div>

        {/* 저장 버튼은 편집 중에만 노출 */}
        {isEditing && (
          <div style={{ marginTop: 8 }}>
            <button className="action-btn" onClick={handleSaveClick}>
              <Save size={16} /> 프로필 저장
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------------- 상태 팔레트 ---------------------- */
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
          ></div>
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
            <label htmlFor="rep-switch"></label>
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
            <label htmlFor="public-switch"></label>
          </div>
        </div>
      </div>
    </aside>
  );
};

/* ---------------------- 항목 팔레트 ---------------------- */
const EditorPalette = ({ onAddItem, addedSections = [] }) => {
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

/* ====================== 메인 페이지 ====================== */
function ResumeEditorPage() {
  const navigate = useNavigate();
  const { resumeId: p1, id: p2 } = useParams();
  const resumeId = p1 ? Number(p1) : p2 ? Number(p2) : null;
  const { user } = useAuth();

  const [userProfile, setUserProfile] = useState(null);
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
    activities: { title: "대외활동", component: ActivityItemForm },
    awards: { title: "수상 경력", component: AwardForm },
    certifications: { title: "자격증", component: CertificationForm },
    languages: { title: "외국어", component: LanguageForm },
    portfolios: { title: "포트폴리오", component: PortfolioForm },
    projects: { title: "프로젝트", component: ProjectForm },
  };

  /* ---------- 프로필 로드 ---------- */
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const uid = getUid(user);
        if (!uid) return;
        const { data, status } = await axios.get(`/api/profile/${uid}`, {
          withCredentials: true,
          validateStatus: (s) => s === 200 || s === 404 || s === 204,
        });
        if (status === 200 && data) {
          setUserProfile({
            name: data?.name ?? (user.email || ""),
            phone: data?.phone ?? "",
            birthYear:
              typeof data?.birthYear === "number" ? data.birthYear : "",
            birthDate: data?.birthDate ?? "",
            profileImageUrl: data?.profileImageUrl ?? "",
            headline: data?.headline ?? "",
            summary: data?.summary ?? "",
            regionId: typeof data?.regionId === "number" ? data.regionId : null,
            regionName: data?.regionName ?? "",
          });
        } else {
          setUserProfile({
            name: user?.email || "",
            phone: "",
            birthYear: "",
            birthDate: "",
            profileImageUrl: "",
            headline: "프로필 정보 없음",
            summary: "",
            regionId: null,
            regionName: "",
          });
        }
      } catch {
        setUserProfile({
          name: user?.email || "",
          phone: "",
          birthYear: "",
          birthDate: "",
          profileImageUrl: "",
          headline: "프로필 정보 없음",
          summary: "",
          regionId: null,
          regionName: "",
        });
      }
    })();
  }, [user]);

  /* ---------- 프로필 저장 ---------- */
  const handleSaveProfile = async () => {
    if (!userProfile) return;
    const uid = getUid(user);
    if (!uid) {
      alert("로그인이 필요합니다.");
      return;
    }

    const parsedRegionId =
      userProfile.regionId !== "" && userProfile.regionId != null
        ? toIntOrNull(userProfile.regionId)
        : null;

    const payload = {
      name: trimOrNull(userProfile.name),
      phone: trimOrNull(userProfile.phone),
      birthYear: null, // 연도 컬럼은 사용 안 함(생년월일로 전환)
      birthDate: userProfile.birthDate || null, // "YYYY-MM-DD"
      profileImageUrl: trimOrNull(userProfile.profileImageUrl),
      headline: trimOrNull(userProfile.headline),
      summary: trimOrNull(userProfile.summary),
      regionId: parsedRegionId,
      regionName: parsedRegionId ? null : trimOrNull(userProfile.regionName),
    };

    try {
      await axios.put(`/api/profile/${uid}`, payload, {
        withCredentials: true,
      });
      alert("프로필이 저장되었습니다.");
    } catch (err) {
      const s = err?.response?.status;
      alert(
        err?.response?.data?.message ||
          (s === 401
            ? "로그인이 필요합니다."
            : s === 403
            ? "권한이 없습니다."
            : "프로필 저장 중 오류가 발생했어요.")
      );
    }
  };

  /* ---------- 완성도 ---------- */
  const completeness = useMemo(() => {
    const base = resumeTitle.trim() ? 10 : 0;
    const items = sections.flatMap((s) => s.data || []);
    const filled = items.filter((it) =>
      Object.values(it || {}).some(Boolean)
    ).length;
    const ratio = items.length ? Math.round((filled / items.length) * 90) : 0;
    return Math.min(100, base + ratio);
  }, [resumeTitle, sections]);

  /* ---------- 섹션 조작 ---------- */
  const handleAddItem = (sectionType) => {
    const exists = sections.some((s) => s.type === sectionType);
    if (exists) {
      setSections((prev) =>
        prev.map((s) =>
          s.type === sectionType
            ? {
                ...s,
                data: [
                  ...s.data,
                  { subId: `${sectionType}-item-${Date.now()}` },
                ],
              }
            : s
        )
      );
    } else {
      setSections((prev) => [
        ...prev,
        {
          id: `${sectionType}-${Date.now()}`,
          type: sectionType,
          data: [{ subId: `${sectionType}-item-${Date.now()}` }],
        },
      ]);
    }
  };

  const handleRemoveSection = (sectionId) =>
    setSections((prev) => prev.filter((s) => s.id !== sectionId));

  const handleAddItemToSection = (sectionId, sectionType) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              data: [...s.data, { subId: `${sectionType}-item-${Date.now()}` }],
            }
          : s
      )
    );
  };

  const handleRemoveItemFromSection = (sectionId, subId) => {
    setSections((prev) =>
      prev
        .map((s) => {
          if (s.id !== sectionId) return s;
          const rest = (s.data || []).filter((it) => it.subId !== subId);
          return rest.length ? { ...s, data: rest } : null;
        })
        .filter(Boolean)
    );
  };

  const handleItemChange = (sectionId, subId, updatedData) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              data: (s.data || []).map((it) =>
                it.subId === subId ? { ...it, ...updatedData } : it
              ),
            }
          : s
      )
    );
  };

  /* ---------- 프로필 변경 ---------- */
  const handleProfileChange = (updatedProfile) =>
    setUserProfile(updatedProfile);

  /* ---------- 저장 헬퍼들 ---------- */
  const statusFromCompleteness = () =>
    completeness >= 100 ? "작성 완료" : "작성 중";
  const buildResumePayload = () => ({
    title: resumeTitle.trim(),
    isPrimary: isRepresentative,
    isPublic,
    status: statusFromCompleteness(),
  });

  const postActivitiesBulk = async (createdId) => {
    const acts = sections.find((s) => s.type === "activities")?.data ?? [];
    if (acts.length === 0) return;
    await Promise.all(
      acts.map((it) =>
        axios.post(
          `/resumes/${createdId}/activities`,
          {
            activityName: it.activityName || "",
            organization: it.organization || "",
            role: it.role || "",
            startDate: it.startDate || null,
            endDate: it.endDate || null,
            description: it.description || "",
          },
          { withCredentials: true }
        )
      )
    );
  };

  const handleTemporarySave = () => {
    if (!resumeTitle.trim()) return alert("이력서 제목을 입력해주세요.");
    const lastModified = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, ".");
    const draft = {
      id: resumeId ?? Date.now(),
      userId: getUid(user),
      title: resumeTitle,
      sections,
      isRepresentative,
      isPublic,
      lastModified,
      status: "작성 중",
      type: "written",
    };
    const all = JSON.parse(localStorage.getItem("resumes") || "[]");
    const idx = all.findIndex((r) => String(r.id) === String(draft.id));
    if (idx > -1) all[idx] = draft;
    else all.push(draft);
    localStorage.setItem("resumes", JSON.stringify(all));
    if (!resumeId) localStorage.setItem("resumeId", String(draft.id));
    alert("이력서가 임시 저장되었습니다.");
  };

  const handleFinalSave = async () => {
    if (!user) return alert("로그인이 필요합니다.");
    if (!resumeTitle.trim()) return alert("이력서 제목을 입력해주세요.");

    setIsSaving(true);
    try {
      if (!resumeId) {
        const { data } = await axios.post("/resumes", buildResumePayload(), {
          withCredentials: true,
        });
        const createdId = typeof data === "number" ? data : Number(data?.id);
        if (!createdId) throw new Error("생성된 이력서 ID가 없습니다.");

        await postActivitiesBulk(createdId);

        localStorage.removeItem("resume_draft");
        navigate(`/resumes/${createdId}/edit`, { replace: true });
        alert("이력서 작성이 완료되었습니다!");
      } else {
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

  /* ---------------------- 렌더 ---------------------- */
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
          <ProfileHeader
            profile={userProfile}
            onUpdate={handleProfileChange}
            onSave={handleSaveProfile}
          />

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

              return (
                <section key={section.id} className="editor-section">
                  <div className="section-header">
                    <h2>{title}</h2>
                    <button
                      className="delete-item-btn"
                      onClick={() => handleRemoveSection(section.id)}
                    >
                      <Trash2 size={16} /> 항목 전체 삭제
                    </button>
                  </div>
                  <div className="section-content">
                    {(section.data || []).map((item) => (
                      <div key={item.subId} className="item-form-wrapper">
                        <Comp
                          data={item}
                          onUpdate={(updated) =>
                            handleItemChange(section.id, item.subId, updated)
                          }
                        />
                        <button
                          className="remove-item-btn"
                          onClick={() =>
                            handleRemoveItemFromSection(section.id, item.subId)
                          }
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      className="add-item-btn"
                      onClick={() =>
                        handleAddItemToSection(section.id, section.type)
                      }
                    >
                      <PlusCircle size={16} /> {title} 추가
                    </button>
                  </div>
                </section>
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
