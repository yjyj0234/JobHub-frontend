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
  Eye,
  Save,
  User,
  Phone,
  MapPin,
  Calendar,
  PlusCircle,
  X,
  Camera,
  Pencil,
  Server,
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
  ActivityForm,
} from "./index.js";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

/* ---------------------- 공통 설정 ---------------------- */
axios.defaults.withCredentials = true;
const API = "/api";

/* ---------------------- 유틸 ---------------------- */
const getUid = (u) => u?.id ?? u?.userId ?? null;
const trimOrNull = (v) => {
  if (v == null) return null;
  if (typeof v !== "string") return v;
  const t = v.trim();
  return t === "" ? null : t;
};
const toIntOrNull = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};
const toNumOrNull = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const stripMeta = (obj = {}) => {
  const { subId, _temp, ...rest } = obj;
  return rest;
};
const hasAnyValue = (obj = {}) =>
  Object.values(obj).some((v) => {
    if (v == null) return false;
    if (typeof v === "string") return v.trim() !== "";
    return true;
  });

/* ---------------------- 섹션별 API/정규화 ---------------------- */
const normalizeActivity = (it = {}) => ({
  id: it.id ?? it.activityId ?? it.resumeActivityId ?? it.seq ?? null,
  activityName: it.activityName ?? it.name ?? it.title ?? "",
  organization: it.organization ?? it.org ?? it.company ?? "",
  role: it.role ?? it.position ?? "",
  startDate: it.startDate ?? it.start ?? it.beginDate ?? null,
  endDate: it.endDate ?? it.finishDate ?? it.end ?? null,
  description: it.description ?? it.desc ?? "",
});

const SECTION_API = {
  activities: {
    list: (rid) => `${API}/resumes/${rid}/activities`,
    create: (rid) => `${API}/resumes/${rid}/activities`,
    update: (rid, id) => `${API}/resumes/${rid}/activities/${id}`, // (rid,id)
    remove: (rid, id) => `${API}/resumes/${rid}/activities/${id}`, // (rid,id)
    toPayload: (it) => ({
      activityName: trimOrNull(it.activityName),
      organization: trimOrNull(it.organization),
      role: trimOrNull(it.role),
      startDate: it.startDate || null,
      endDate: it.endDate || null,
      description: trimOrNull(it.description),
    }),
    normalize: normalizeActivity,
  },

  educations: {
    list: (rid) => `${API}/resumes/${rid}/educations`,
    create: (rid) => `${API}/resumes/${rid}/educations`,
    update: (id) => `${API}/resumes/educations/${id}`, // (id)
    remove: (id) => `${API}/resumes/educations/${id}`, // (id)
    toPayload: (it) => ({
      schoolName: trimOrNull(it.schoolName),
      schoolType: trimOrNull(it.schoolType),
      major: trimOrNull(it.major),
      minor: trimOrNull(it.minor),
      degree: trimOrNull(it.degree),
      admissionDate: it.admissionDate || null,
      graduationDate: it.graduationDate || null,
      graduationStatus: trimOrNull(it.graduationStatus),
      gpa: toNumOrNull(it.gpa),
      maxGpa: toNumOrNull(it.maxGpa),
    }),
  },

  experiences: {
    list: (rid) => `${API}/resumes/${rid}/experiences`,
    create: (rid) => `${API}/resumes/${rid}/experiences`,
    update: (id) => `${API}/resumes/experiences/${id}`,
    remove: (id) => `${API}/resumes/experiences/${id}`,
    toPayload: (it) => stripMeta(it),
  },
  skills: {
    list: (rid) => `${API}/resumes/${rid}/skills`,
    create: (rid) => `${API}/resumes/${rid}/skills`,
    update: (id) => `${API}/resumes/skills/${id}`,
    remove: (id) => `${API}/resumes/skills/${id}`,
    toPayload: (it) => stripMeta(it),
  },
  projects: {
    list: (rid) => `${API}/resumes/${rid}/projects`,
    create: (rid) => `${API}/resumes/${rid}/projects`,
    update: (id) => `${API}/resumes/projects/${id}`,
    remove: (id) => `${API}/resumes/projects/${id}`,
    toPayload: (it) => stripMeta(it),
  },
  awards: {
    list: (rid) => `${API}/resumes/${rid}/awards`,
    create: (rid) => `${API}/resumes/${rid}/awards`,
    update: (id) => `${API}/resumes/awards/${id}`,
    remove: (id) => `${API}/resumes/awards/${id}`,
    toPayload: (it) => stripMeta(it),
  },
  certifications: {
    list: (rid) => `${API}/resumes/${rid}/certifications`,
    create: (rid) => `${API}/resumes/${rid}/certifications`,
    update: (id) => `${API}/resumes/certifications/${id}`,
    remove: (id) => `${API}/resumes/certifications/${id}`,
    toPayload: (it) => stripMeta(it),
  },
  languages: {
    list: (rid) => `${API}/resumes/${rid}/languages`,
    create: (rid) => `${API}/resumes/${rid}/languages`,
    update: (id) => `${API}/resumes/languages/${id}`,
    remove: (id) => `${API}/resumes/languages/${id}`,
    toPayload: (it) => stripMeta(it),
  },
  portfolios: {
    list: (rid) => `${API}/resumes/${rid}/portfolios`,
    create: (rid) => `${API}/resumes/${rid}/portfolios`,
    update: (id) => `${API}/resumes/portfolios/${id}`,
    remove: (id) => `${API}/resumes/portfolios/${id}`,
    toPayload: (it) => stripMeta(it),
  },
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
    if (name === "regionName") newData.regionId = null;
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
  const initialResumeId = p1 ? Number(p1) : p2 ? Number(p2) : null;
  const { user } = useAuth();

  const [resumeId, setResumeId] = useState(initialResumeId);
  const [userProfile, setUserProfile] = useState(null);
  const [sections, setSections] = useState([]);
  const [resumeTitle, setResumeTitle] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRepresentative, setIsRepresentative] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  // 섹션 편집/백업
  const [editingSections, setEditingSections] = useState({});
  const [sectionBeforeEdit, setSectionBeforeEdit] = useState({});
  // 삭제 확인
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const sectionComponents = {
    experiences: { title: "경력", component: ExperienceForm },
    educations: { title: "학력", component: EducationForm, required: true },
    skills: { title: "기술", component: SkillForm },
    activities: { title: "대외활동", component: ActivityForm },
    awards: { title: "수상 경력", component: AwardForm },
    certifications: { title: "자격증", component: CertificationForm },
    languages: { title: "외국어", component: LanguageForm },
    portfolios: { title: "포트폴리오", component: PortfolioForm },
    projects: { title: "프로젝트", component: ProjectForm },
  };

  /* ---------- 서버 → 화면 상태 변환 ---------- */
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

  /** 개별 엔드포인트로 로드(없는 건 무시) */
  const fetchSectionsByEndpoints = async (rid) => {
    const out = [];

    const tryFetch = async (type, cfg) => {
      if (!cfg?.list) return;
      try {
        const res = await axios.get(cfg.list(rid), {
          validateStatus: () => true,
        });
        if (res.status >= 200 && res.status < 300) {
          const raw = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.content)
            ? res.data.content
            : [];
          const items =
            type === "activities" && SECTION_API.activities.normalize
              ? raw.map(SECTION_API.activities.normalize)
              : raw;
          const sec = makeSection(type, items);
          if (sec) out.push(sec);
        }
      } catch {
        /* ignore */
      }
    };

    await Promise.all(
      Object.entries(SECTION_API).map(([type, cfg]) => tryFetch(type, cfg))
    );
    return out;
  };

  /** 같은 type 섹션 합치기 */
  const mergeSections = (base = [], extra = []) => {
    const map = new Map();
    const add = (sec) => {
      if (!sec) return;
      const exist = map.get(sec.type);
      if (exist) exist.data = [...exist.data, ...sec.data];
      else map.set(sec.type, { ...sec });
    };
    base.forEach(add);
    extra.forEach(add);
    return Array.from(map.values());
  };

  /** 필요 시 이력서 생성해서 ID 확보 */
  const ensureResumeId = async () => {
    if (resumeId) return resumeId;
    const payload = {
      title: (resumeTitle || "").trim() || "새 이력서",
      isPrimary: isRepresentative,
      isPublic,
      completionRate: 0,
    };
    const res = await axios.post(`${API}/resumes`, payload);
    const newId =
      typeof res.data === "number" ? res.data : Number(res.data?.id);
    setResumeId(newId);
    navigate(`/resumes/${newId}`, { replace: true });
    return newId;
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

  /* ---------- 이력서 로드 ---------- */
  useEffect(() => {
    if (!resumeId) return;
    let ignore = false;

    (async () => {
      try {
        const res = await axios.get(`${API}/resumes/${resumeId}`, {
          validateStatus: () => true,
        });
        if (ignore) return;

        if (res.status >= 200 && res.status < 300) {
          const data = res.data ?? {};
          setResumeTitle(data?.title ?? "");
          setIsRepresentative(
            Boolean(data?.isPrimary ?? data?.isRepresentative ?? false)
          );
          setIsPublic(data?.isPublic !== false);

          const base = buildSectionsFromResponse(data);
          const extra = await fetchSectionsByEndpoints(resumeId);
          setSections(mergeSections(base, extra));
        } else {
          const s = res.status;
          alert(
            (res.data && res.data.message) ||
              (s === 404
                ? "이력서를 찾을 수 없어요."
                : s === 401
                ? "로그인이 필요해요."
                : s === 403
                ? "권한이 없어요."
                : "이력서 로드 중 오류가 발생했어요.")
          );
        }
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
    if (!uid) return alert("로그인이 필요합니다.");

    const parsedRegionId =
      profileToSave.regionId !== "" && profileToSave.regionId != null
        ? toIntOrNull(profileToSave.regionId)
        : null;

    const payload = {
      name: trimOrNull(profileToSave.name),
      phone: trimOrNull(profileToSave.phone),
      birthYear: null, // 미사용
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
    const base = (resumeTitle || "").trim() ? 10 : 0;
    const items = sections.flatMap((s) => s.data || []);
    const filled = items.filter((it) => hasAnyValue(stripMeta(it))).length;
    const ratio = items.length ? Math.round((filled / items.length) * 90) : 0;
    return Math.min(100, base + ratio);
  }, [resumeTitle, sections]);

  /* ---------- 섹션 편집 관리 ---------- */
  const handleEditSection = (sectionId) => {
    const target = sections.find((s) => s.id === sectionId);
    if (!target) return;
    const snapshot = JSON.parse(JSON.stringify(target)); // 딥카피
    setSectionBeforeEdit((prev) => ({ ...prev, [sectionId]: snapshot }));
    setEditingSections((prev) => ({ ...prev, [sectionId]: true }));
  };

  const handleSaveSection = (sectionId) => {
    setEditingSections((prev) => ({ ...prev, [sectionId]: false }));
    setSectionBeforeEdit((prev) => {
      const n = { ...prev };
      delete n[sectionId];
      return n;
    });
  };

  const handleCancelEditSection = (sectionId) => {
    const backup = sectionBeforeEdit[sectionId];
    if (!backup) {
      setEditingSections((p) => ({ ...p, [sectionId]: false }));
      return;
    }
    const restore = JSON.parse(JSON.stringify(backup));
    setSections((prev) => prev.map((s) => (s.id === sectionId ? restore : s)));
    setEditingSections((prev) => ({ ...prev, [sectionId]: false }));
    setSectionBeforeEdit((prev) => {
      const n = { ...prev };
      delete n[sectionId];
      return n;
    });
  };

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
                  ...(s.data || []),
                  { subId: `${sectionType}-item-${Date.now()}` },
                ],
              }
            : s
        )
      );
    } else {
      const newSectionId = `${sectionType}-${Date.now()}`;
      setSections((prev) => [
        ...prev,
        {
          id: newSectionId,
          type: sectionType,
          data: [{ subId: `${sectionType}-item-${Date.now()}` }],
        },
      ]);
      handleEditSection(newSectionId); // 새 섹션은 곧바로 편집 모드
    }
  };

  const handleRemoveSection = (sectionIdParam) =>
    setSections((prev) => prev.filter((s) => s.id !== sectionIdParam));

  /** 아이템 삭제 (DB 반영 포함) */
  const handleRemoveItemFromSection = async (sectionIdParam, subId) => {
    const sec = sections.find((s) => s.id === sectionIdParam);
    if (!sec) return;

    const api = SECTION_API[sec.type];
    const item = (sec.data || []).find((it) => it.subId === subId);

    if (item?.id && api?.remove) {
      try {
        let rid = resumeId;
        if (!rid && api.remove.length === 2) rid = await ensureResumeId();
        const urlForDelete =
          api.remove.length === 2
            ? api.remove(rid, item.id)
            : api.remove(item.id);
        await axios.delete(urlForDelete);
      } catch (e) {
        console.error("[Delete item] error", e);
        const s = e?.response?.status;
        alert(
          e?.response?.data?.message ||
            (s === 401
              ? "로그인이 필요해요."
              : s === 403
              ? "권한이 없어요."
              : s === 404
              ? "이미 삭제된 항목이에요."
              : "삭제에 실패했어요.")
        );
        return;
      }
    }

    setSections((prev) =>
      prev
        .map((s) => {
          if (s.id !== sectionIdParam) return s;
          const rest = (s.data || []).filter((it) => it.subId !== subId);
          return rest.length > 0 ? { ...s, data: rest } : null;
        })
        .filter(Boolean)
    );
    setConfirmingDelete(null);
  };

  const handleItemChange = (sectionIdParam, subId, updatedData) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionIdParam
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

  // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ이력서 페이지 메인 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
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
  /* ---------- 섹션별 저장 ---------- */
  const buildResumePayload = () => ({
    title: (resumeTitle || "").trim() || "새 이력서",
    isPrimary: isRepresentative,
    isPublic,
    completionRate: completeness,
  });

  const saveSection = async (sectionIdParam) => {
    const sec = sections.find((s) => s.id === sectionIdParam);
    if (!sec) return;

    if (!(resumeTitle || "").trim()) {
      alert("이력서 제목을 먼저 입력해주세요.");
      return;
    }

    const rid = await ensureResumeId();
    const cfg = SECTION_API[sec.type];
    if (!cfg) {
      alert("이 섹션은 아직 서버 연동이 설정되지 않았어요.");
      return;
    }

    try {
      // 아이템 단위 upsert
      await Promise.all(
        (sec.data || []).map(async (it) => {
          const payload = cfg.toPayload ? cfg.toPayload(it) : stripMeta(it);
          if (!hasAnyValue(payload)) return; // 완전 비어있으면 패스

          if (it.id) {
            if (!cfg.update) return;
            const urlForUpdate =
              cfg.update.length === 2
                ? cfg.update(rid, it.id)
                : cfg.update(it.id);
            await axios.put(urlForUpdate, payload);
          } else {
            if (!cfg.create) return;
            const res = await axios.post(cfg.create(rid), payload, {
              validateStatus: () => true,
            });
            if (res.status >= 200 && res.status < 300) {
              const body = res.data;
              const newId =
                typeof body === "number"
                  ? body
                  : body?.id ?? body?.activityId ?? null;
              if (newId) {
                setSections((prev) =>
                  prev.map((s) =>
                    s.id === sectionIdParam
                      ? {
                          ...s,
                          data: s.data.map((d) =>
                            d.subId === it.subId ? { ...d, id: newId } : d
                          ),
                        }
                      : s
                  )
                );
              }
            } else {
              throw res;
            }
          }
        })
      );

      // 저장 후 해당 섹션만 서버 기준 재로드
      if (cfg.list) {
        const listRes = await axios.get(cfg.list(rid), {
          validateStatus: () => true,
        });
        if (listRes.status >= 200 && listRes.status < 300) {
          const raw = Array.isArray(listRes.data)
            ? listRes.data
            : Array.isArray(listRes.data?.content)
            ? listRes.data.content
            : [];
          const items =
            sec.type === "activities" && SECTION_API.activities.normalize
              ? raw.map(SECTION_API.activities.normalize)
              : raw;

          const refreshed = makeSection(sec.type, items);
          setSections((prev) =>
            prev.map((s) => (s.id === sectionIdParam ? refreshed || s : s))
          );
        }
      }

      // 이력서 메타(완성도 등) 업데이트
      await axios.put(`${API}/resumes/${rid}`, buildResumePayload());

      // 편집 종료 & 백업 해제
      handleSaveSection(sectionIdParam);
      alert("섹션이 저장되었습니다.");
    } catch (err) {
      console.error("[SaveSection] error:", err);
      const s = err?.response?.status;
      alert(
        err?.response?.data?.message ||
          (s === 401
            ? "로그인이 필요해요."
            : s === 403
            ? "권한이 없어요."
            : "섹션 저장 중 오류가 발생했어요.")
      );
    }
  };

  /* ---------- 상단(이력서) 단위 저장 ---------- */
  const handleTemporarySave = () => {
    if (!(resumeTitle || "").trim())
      return alert("이력서 제목을 입력해주세요.");
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
    if (!(resumeTitle || "").trim())
      return alert("이력서 제목을 입력해주세요.");

    setIsSaving(true);
    try {
      if (!resumeId) {
        const res = await axios.post(`${API}/resumes`, buildResumePayload());
        const createdId =
          typeof res.data === "number" ? res.data : Number(res.data?.id);
        if (!createdId) throw new Error("생성된 이력서 ID가 없습니다.");
        setResumeId(createdId);
        localStorage.removeItem("resume_draft");
        navigate(`/resumes/${createdId}`, { replace: true });
        alert("이력서 작성이 완료되었습니다!");
      } else {
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
            onUpdate={(p) => setUserProfile(p)}
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
              const { component: Comp, title, required } = def;
              const isEditing = !!editingSections[section.id];

              return (
                <section key={section.id} className="editor-section">
                  <div className="section-header">
                    <h2>
                      {title}
                      {required && (
                        <span className="required-text">(필수)</span>
                      )}
                    </h2>
                    <div className="section-header-actions">
                      {isEditing ? (
                        <>
                          <button
                            className="action-btn primary"
                            onClick={async () => {
                              await saveSection(section.id);
                              // handleSaveSection은 saveSection 내부에서 호출됨
                            }}
                          >
                            저장
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => handleCancelEditSection(section.id)}
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <button
                          className="action-btn"
                          onClick={() => handleEditSection(section.id)}
                        >
                          수정
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="section-content">
                    {(section.data || []).map((item) => {
                      const isConfirmingDelete =
                        confirmingDelete?.sectionId === section.id &&
                        confirmingDelete?.subId === item.subId;

                      return (
                        <div key={item.subId} className="item-form-wrapper">
                          {isConfirmingDelete ? (
                            <div className="delete-confirm-box">
                              <span>이 항목을 삭제하시겠습니까?</span>
                              <div className="delete-confirm-actions">
                                <button
                                  className="action-btn primary"
                                  onClick={() => {
                                    handleRemoveItemFromSection(
                                      section.id,
                                      item.subId
                                    );
                                    setConfirmingDelete(null);
                                  }}
                                >
                                  예
                                </button>
                                <button
                                  className="action-btn"
                                  onClick={() => setConfirmingDelete(null)}
                                >
                                  아니오
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Comp
                                data={item}
                                onUpdate={(updated) =>
                                  handleItemChange(
                                    section.id,
                                    item.subId,
                                    updated
                                  )
                                }
                                isEditing={isEditing}
                              />
                              <button
                                className="remove-item-btn"
                                onClick={() =>
                                  setConfirmingDelete({
                                    sectionId: section.id,
                                    subId: item.subId,
                                  })
                                }
                                title={item.id ? "DB에서도 삭제" : "삭제"}
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}

                    {isEditing && (
                      <button
                        className="add-item-btn"
                        onClick={() =>
                          setSections((prev) =>
                            prev.map((s) =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    data: [
                                      ...(s.data || []),
                                      {
                                        subId: `${
                                          section.type
                                        }-item-${Date.now()}`,
                                      },
                                    ],
                                  }
                                : s
                            )
                          )
                        }
                      >
                        <PlusCircle size={16} /> {title} 추가
                      </button>
                    )}
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
