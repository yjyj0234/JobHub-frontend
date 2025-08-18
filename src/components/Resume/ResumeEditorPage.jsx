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

/* ---------------------- 공통 설정 ---------------------- */
axios.defaults.withCredentials = true;
const API = "/api"; // 모든 이력서/프로필 API 경로 접두사

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
  const [editData, setEditData] = useState(profile);

  useEffect(() => {
    setEditData(profile);
  }, [profile]);

  if (!profile)
    return <div className="profile-header loading">프로필 정보 로딩 중...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...editData, [name]: value };
    if (name === "regionName") {
      newData.regionId = null;
    }
    setEditData(newData);
  };

  const handlePhotoClick = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setEditData({ ...editData, profileImageUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSaveClick = async () => {
    try {
      await onUpdate(editData);
      await onSave(editData);
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  return (
    <div className="profile-header">
      {!isEditing ? (
        <button
          type="button"
          className="profile-edit-toggle"
          onClick={() => setIsEditing(true)}
          title="프로필 수정"
        >
          <Pencil size={16} />
          <span>수정</span>
        </button>
      ) : (
        <div className="profile-edit-actions">
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
            onClick={handleCancelEdit}
            title="편집 취소"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="profile-main-info">
        <div
          className="profile-photo-edit-wrapper"
          onClick={handlePhotoClick}
          style={{ cursor: isEditing ? "pointer" : "default" }}
        >
          <div className="profile-photo-wrapper">
            {(
              isEditing ? editData.profileImageUrl : profile.profileImageUrl
            ) ? (
              <img
                src={
                  isEditing ? editData.profileImageUrl : profile.profileImageUrl
                }
                alt={profile.name || "프로필"}
                className="profile-photo"
              />
            ) : (
              <div className="profile-photo-placeholder">
                <User size={40} />
              </div>
            )}
            {isEditing && (
              <div className="photo-edit-icon">
                <Camera size={16} />
              </div>
            )}
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
          {isEditing ? (
            <input
              type="text"
              name="name"
              className="profile-name-input"
              value={editData.name || ""}
              onChange={handleChange}
              placeholder="이름"
            />
          ) : (
            <h2 className="profile-name-display">{profile.name || "이름"}</h2>
          )}

          {isEditing ? (
            <input
              type="text"
              name="headline"
              className="profile-headline-input"
              value={editData.headline || ""}
              onChange={handleChange}
              placeholder="한 줄 소개를 작성해주세요."
            />
          ) : (
            <p className="profile-headline-display">
              {profile.headline || "한 줄 소개"}
            </p>
          )}

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <Phone size={14} />
              {isEditing ? (
                <input
                  name="phone"
                  value={editData.phone || ""}
                  onChange={handleChange}
                  placeholder="연락처"
                />
              ) : (
                <span>{profile.phone || "-"}</span>
              )}
            </div>
            <div className="profile-info-item">
              <MapPin size={14} />
              {isEditing ? (
                <input
                  name="regionName"
                  value={editData.regionName || ""}
                  onChange={handleChange}
                  placeholder="거주지역"
                />
              ) : (
                <span>{profile.regionName || "-"}</span>
              )}
            </div>
            <div className="profile-info-item">
              <Calendar size={14} />
              {isEditing ? (
                <input
                  type="date"
                  name="birthDate"
                  value={editData.birthDate || ""}
                  onChange={handleChange}
                />
              ) : (
                <span>{profile.birthDate || "-"}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-info-wide">
        <label>자기소개</label>
        {isEditing ? (
          <textarea
            name="summary"
            value={editData.summary || ""}
            onChange={handleChange}
            placeholder="간단한 자기소개를 입력해주세요."
          />
        ) : (
          <div className="summary-display">
            {profile.summary || "자기소개가 없습니다."}
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

  /* ---------- 서버 → 화면 상태 변환 도우미 ---------- */
  const makeSection = (type, items = []) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      data: items.map((it, idx) => ({
        subId: `${type}-item-${Date.now()}-${idx}`,
        ...it,
      })),
    };
  };

  const buildSectionsFromResponse = (dto) => {
    const built = [];
    const push = (s) => s && built.push(s);

    // 서버 필드 네이밍에 따라 조합 (존재하는 것만 추가)
    push(makeSection("experiences", dto.experiences ?? dto.experienceList));
    push(makeSection("educations", dto.educations ?? dto.educationList));
    push(makeSection("skills", dto.skills ?? dto.skillList));
    push(makeSection("projects", dto.projects ?? dto.projectList));
    push(makeSection("activities", dto.activities ?? dto.activityList));
    push(makeSection("awards", dto.awards ?? dto.awardList));
    push(
      makeSection("certifications", dto.certifications ?? dto.certificationList)
    );
    push(makeSection("languages", dto.languages ?? dto.languageList));
    push(makeSection("portfolios", dto.portfolios ?? dto.portfolioList));

    return built;
  };

  /* ---------- 프로필 로드 ---------- */
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const uid = getUid(user);
        if (!uid) return;
        const { data, status } = await axios.get(`${API}/profile/${uid}`, {
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

  /* ---------- 이력서 로드(편집 모드) ---------- */
  useEffect(() => {
    if (!resumeId) return; // 새로 만들기 모드
    let ignore = false;

    (async () => {
      try {
        const { data } = await axios.get(`${API}/resumes/${resumeId}`);
        if (ignore) return;

        // 제목/대표/공개
        setResumeTitle(data?.title ?? "");
        setIsRepresentative(
          Boolean(data?.isPrimary ?? data?.isRepresentative ?? false)
        );
        setIsPublic(data?.isPublic !== false);

        // 섹션
        const built = buildSectionsFromResponse(data ?? {});
        setSections(built);
      } catch (err) {
        console.error("[ResumeLoad] error:", err);
        const s = err?.response?.status;
        alert(
          err?.response?.data?.message ||
            (s === 404
              ? "이력서를 찾을 수 없어요."
              : s === 401
              ? "로그인이 필요해요."
              : s === 403
              ? "권한이 없어요."
              : "이력서 로드 중 오류가 발생했어요.")
        );
      }
    })();

    return () => {
      ignore = true;
    };
  }, [resumeId]);

  /* ---------- 프로필 저장 ---------- */
  const handleSaveProfile = async (profileToSave) => {
    if (!profileToSave) return;
    const uid = getUid(user);
    if (!uid) {
      alert("로그인이 필요합니다.");
      return;
    }

    const parsedRegionId =
      profileToSave.regionId !== "" && profileToSave.regionId != null
        ? toIntOrNull(profileToSave.regionId)
        : null;

    const payload = {
      name: trimOrNull(profileToSave.name),
      phone: trimOrNull(profileToSave.phone),
      birthYear: null,
      birthDate: profileToSave.birthDate || null,
      profileImageUrl: trimOrNull(profileToSave.profileImageUrl),
      headline: trimOrNull(profileToSave.headline),
      summary: trimOrNull(profileToSave.summary),
      regionId: parsedRegionId,
      regionName: parsedRegionId ? null : trimOrNull(profileToSave.regionName),
    };

    try {
      await axios.put(`${API}/profile/${uid}`, payload);
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
        axios.post(`${API}/resumes/${createdId}/activities`, {
          activityName: it.activityName || "",
          organization: it.organization || "",
          role: it.role || "",
          startDate: it.startDate || null,
          endDate: it.endDate || null,
          description: it.description || "",
        })
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
        // 생성
        const { data } = await axios.post(
          `${API}/resumes`,
          buildResumePayload()
        );
        const createdId = typeof data === "number" ? data : Number(data?.id);
        if (!createdId) throw new Error("생성된 이력서 ID가 없습니다.");

        await postActivitiesBulk(createdId);

        localStorage.removeItem("resume_draft");
        // 현재 라우팅은 /resumes/:id 사용 중 → edit 경로 없이 이동
        navigate(`/resumes/${createdId}`, { replace: true });
        alert("이력서 작성이 완료되었습니다!");
      } else {
        // 수정
        await axios.put(`${API}/resumes/${resumeId}`, buildResumePayload());
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
