// src/components/resume/ResumeEditorPage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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

// 고정 섹션 순서
const SECTION_ORDER = [
  "educations",
  "skills",
  "projects",
  "experiences",
  "certifications",
  "activities",
  "awards",
  "languages",
  "portfolios",
];

const SECTION_ORDER_INDEX = Object.fromEntries(
  SECTION_ORDER.map((t, i) => [t, i])
);
const sortSections = (arr = []) =>
  [...arr].sort(
    (a, b) =>
      (SECTION_ORDER_INDEX[a.type] ?? 999) -
      (SECTION_ORDER_INDEX[b.type] ?? 999)
  );

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
// URL 스킴 자동 보정(미입력 시 https:// 붙임)
const normalizeUrl = (u) => {
  if (!u) return null;
  const t = String(u).trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

/* ---------------------- 지역 선택 팝업 ( /api/search/regions 사용 ) ---------------------- */
const RegionPicker = ({ initial, onSelect, onClose }) => {
  const [sido, setSido] = useState([]);
  const [sigungu, setSigungu] = useState([]);
  const [selectedSido, setSelectedSido] = useState(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  // 트리 빠른검색용 캐시
  const [flatRegions, setFlatRegions] = useState(null);

  // 최초: 시/도 불러오기
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // 🔁 최상위(시/도)
        const res = await axios.get(`${API}/search/regions`);
        setSido(res.data?.regions || []);

        // 초기 parentId가 있으면 해당 시/도 하위도 미리 조회
        if (initial?.parentId) {
          setSelectedSido(initial.parentId);
          const r2 = await axios.get(`${API}/search/regions`, {
            params: { parentId: initial.parentId },
          });
          setSigungu(r2.data?.regions || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [initial?.parentId]);

  // 시/도 선택 시 하위(시군구) 조회
  const handleSido = async (id) => {
    setSelectedSido(id);
    setSigungu([]);
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/search/regions`, {
        params: { parentId: id },
      });
      setSigungu(res.data?.regions || []);
    } finally {
      setLoading(false);
    }
  };

  // 빠른 검색: /api/search/regions/tree 한번 받아서 프론트에서 필터링
  const ensureRegionTree = async () => {
    if (flatRegions) return flatRegions;
    const res = await axios.get(`${API}/search/regions/tree`);
    const roots = res.data?.regions || [];
    const flat = [];
    const walk = (node, parentId = null) => {
      if (!node) return;
      flat.push({ id: node.id, name: node.name, parentId });
      (node.children || []).forEach((ch) => walk(ch, node.id));
    };
    roots.forEach((r) => walk(r, null));
    setFlatRegions(flat);
    return flat;
  };

  const handleQuickSearch = async (e) => {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) return;

    try {
      const flat = await ensureRegionTree();
      const kw = keyword.toLowerCase();
      const row = flat.find((r) => r.name.toLowerCase().includes(kw)) || null;

      if (row) {
        onSelect({
          id: row.id,
          name: row.name,
          parentId: row.parentId ?? null,
        });
        onClose?.();
      } else {
        alert("검색 결과가 없습니다.");
      }
    } catch {
      alert("지역 검색 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <div className="rp-backdrop" onClick={onClose} />
      <div className="rp-pop">
        <div className="rp-head">
          <strong>지역 선택</strong>
          <button className="rp-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="rp-search" onSubmit={handleQuickSearch}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="빠른 검색 (예: 종로구)"
          />
          <button type="submit">검색</button>
        </form>

        <div className="rp-cols">
          <div className="rp-col">
            <div className="rp-title">시/도</div>
            <ul className="rp-list">
              {sido.map((r) => (
                <li
                  key={r.id}
                  className={selectedSido === r.id ? "active" : ""}
                  onClick={() => handleSido(r.id)}
                >
                  {r.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="rp-col">
            <div className="rp-title">시/군/구</div>
            <ul className="rp-list">
              {sigungu.map((r) => (
                <li
                  key={r.id}
                  onClick={() => {
                    onSelect({
                      id: r.id,
                      name: r.name,
                      parentId: r.parentId ?? null,
                    });
                    onClose?.();
                  }}
                >
                  {r.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {loading && <div className="rp-loading">불러오는 중…</div>}
      </div>

      {/* 최소 스타일 */}
      <style>{`
        .rp-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.25);z-index:999;}
        .rp-pop{position:fixed;z-index:1000;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2);padding:14px;width:560px;max-width:90vw;}
        .rp-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
        .rp-close{border:0;background:transparent;font-size:20px;cursor:pointer}
        .rp-search{display:flex;gap:6px;margin:8px 0 12px}
        .rp-search input{flex:1;padding:8px;border:1px solid #ddd;border-radius:8px}
        .rp-search button{padding:8px 12px;border:1px solid #ddd;background:#f7f7f9;border-radius:8px;cursor:pointer}
        .rp-cols{display:flex;gap:12px}
        .rp-col{flex:1;border:1px solid #eee;border-radius:10px;padding:8px;max-height:280px;overflow:auto}
        .rp-title{font-size:12px;color:#666;margin-bottom:6px}
        .rp-list{list-style:none;margin:0;padding:0}
        .rp-list li{padding:8px;border-radius:8px;cursor:pointer}
        .rp-list li:hover,.rp-list li.active{background:#f3f6ff}
        .rp-loading{margin-top:8px;color:#777;font-size:12px}
      `}</style>
    </>
  );
};

/* ---------------------- 섹션별 API/정규화 ---------------------- */
// 포트폴리오 정규화
const normalizePortfolio = (it = {}) => ({
  id: it.id ?? it.portfolioId ?? null,
  title: it.title ?? it.name ?? "",
  url: it.url ?? it.link ?? "",
  description: it.description ?? it.desc ?? "",
  portfolioType: it.portfolioType ?? it.type ?? "",
});

const normalizeActivity = (it = {}) => ({
  id: it.id ?? it.activityId ?? it.resumeActivityId ?? it.seq ?? null,
  activityName: it.activityName ?? it.name ?? it.title ?? "",
  organization: it.organization ?? it.org ?? it.company ?? "",
  role: it.role ?? it.position ?? "",
  startDate: it.startDate ?? it.start ?? it.beginDate ?? null,
  endDate: it.endDate ?? it.finishDate ?? it.end ?? null,
  description: it.description ?? it.desc ?? "",
});

// ✅ 스킬 정규화: id=링크PK(resume_skills), skillId=스킬PK(skills)
const normalizeSkill = (it = {}) => ({
  id: it.id ?? it.resumeSkillId ?? null, // resume_skills PK (언링크/삭제에 사용)
  skillId: it.skillId ?? it.skill?.id ?? null, // skills PK (생성/연결에 사용)
  name: it.name ?? it.skillName ?? it.skill?.name ?? "",
  categoryId: it.categoryId ?? it.category?.id ?? it.skill?.categoryId ?? null,
  isVerified: Boolean(it.isVerified ?? it.skill?.isVerified ?? false),
});

/** 경력: BE <-> FE 키 정규화 */
const normalizeExperience = (it = {}) => ({
  id: it.id ?? it.experienceId ?? null,
  companyName: it.companyName ?? it.company ?? "",
  companyId: it.companyId ?? it.company?.id ?? null,
  position: it.position ?? "",
  employmentType: it.employmentType ?? null,
  startDate: it.startDate ?? null,
  endDate: it.endDate ?? null,
  current:
    typeof it.current === "boolean"
      ? it.current
      : typeof it.isCurrent === "boolean"
      ? it.isCurrent
      : false,
  description: it.description ?? "",
  achievements: it.achievements ?? "",
});

const SECTION_API = {
  activities: {
    list: (rid) => `${API}/resumes/${rid}/activities`,
    create: (rid) => `${API}/resumes/${rid}/activities`,
    update: (rid, id) => `${API}/resumes/${rid}/activities/${id}`,
    remove: (rid, id) => `${API}/resumes/${rid}/activities/${id}`,
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

  // 🔧 학력
  educations: {
    list: (rid) => `${API}/resumes/${rid}/educations`,
    create: (rid) => `${API}/resumes/${rid}/educations`,
    update: (id) => `${API}/resumes/educations/${id}`,
    remove: (id) => `${API}/resumes/educations/${id}`,
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

  // 🔧 경력
  experiences: {
    list: (rid) => `${API}/resumes/${rid}/experiences`,
    create: (rid) => `${API}/resumes/${rid}/experiences`,
    update: (id) => `${API}/resumes/experiences/${id}`,
    remove: (id) => `${API}/resumes/experiences/${id}`,
    toPayload: (it) => {
      const position = it.position ?? it.role ?? it.jobTitle ?? it.title ?? "";
      const companyName = it.companyName ?? it.company ?? it.organization ?? "";
      return {
        companyName: trimOrNull(companyName),
        companyId: toIntOrNull(it.companyId),
        position: trimOrNull(position),
        employmentType: it.employmentType || null,
        startDate: it.startDate || null,
        endDate: it.endDate || null,
        current: Boolean(it.current ?? it.isCurrent ?? false),
        description: trimOrNull(it.description),
        achievements: trimOrNull(it.achievements),
      };
    },
    normalize: normalizeExperience,
  },

  // ✅ 스킬(이력서-스킬 링크용 API)
  skills: {
    list: (rid) => `${API}/resumes/${rid}/skills`,
    create: (rid) => `${API}/resumes/${rid}/skills`,
    remove: (rid, id) => `${API}/resumes/${rid}/skills/${id}`,
    toPayload: (it) => {
      // 👉 다양한 키를 수용
      const sid = toIntOrNull(it.skillId ?? it.skill?.id);
      const name = trimOrNull(it.name ?? it.skillName ?? it.skill?.name);
      const categoryId = toIntOrNull(
        it.categoryId ?? it.category?.id ?? it.skill?.categoryId
      );
      if (sid) return { skillId: sid }; // 기존 스킬 연결
      if (name) return { name, categoryId: categoryId ?? null }; // 새 스킬 생성 + 연결
      return {}; // 아무것도 없으면 스킵
    },
    // 🔁 중복 정의 제거, 표준 정규화 재사용
    normalize: normalizeSkill,
  },

  projects: {
    list: (rid) => `${API}/resumes/${rid}/projects`,
    create: (rid) => `${API}/resumes/${rid}/projects`,
    update: (id) => `${API}/resumes/projects/${id}`,
    remove: (id) => `${API}/resumes/projects/${id}`,
    toPayload: (it) => {
      const organization = it.organization ?? it.projectOrg;
      const projectUrl = it.projectUrl ?? it.url;
      const tech = Array.isArray(it.techStack)
        ? it.techStack.map((s) => String(s).trim()).filter(Boolean)
        : String(it.techStack ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

      return {
        projectName: (it.projectName ?? "").trim() || null,
        organization: organization ? organization.trim() : null,
        role: it.role ? it.role.trim() : null,
        startDate: it.startDate || null,
        endDate: it.ongoing ? null : it.endDate || null,
        ongoing: Boolean(it.ongoing),
        projectUrl: projectUrl ? projectUrl.trim() : null,
        description: it.description ? it.description.trim() : null,
        techStack: tech,
      };
    },
  },
  awards: {
    list: (rid) => `${API}/resumes/${rid}/awards`,
    create: (rid) => `${API}/resumes/${rid}/awards`,
    update: (rid, awardId) => `${API}/resumes/${rid}/awards/${awardId}`,
    remove: (rid, awardId) => `${API}/resumes/${rid}/awards/${awardId}`,
    toPayload: (it) => ({
      awardName: it.awardName ?? it.awardTitle ?? "",
      organization: it.organization ?? it.awardingInstitution ?? "",
      awardDate: it.awardDate ?? null,
      description: it.description ?? null,
    }),
    normalize: (r) => ({
      id: r.id,
      awardName: r.awardName,
      organization: r.organization,
      awardDate: r.awardDate,
      description: r.description,
    }),
  },
  certifications: {
    list: (rid) => `${API}/resumes/${rid}/certifications`,
    create: (rid) => `${API}/resumes/${rid}/certifications`,
    update: (rid, id) => `${API}/resumes/${rid}/certifications/${id}`,
    remove: (rid, id) => `${API}/resumes/${rid}/certifications/${id}`,
    toPayload: (it) => ({
      certificationName: (it.certificationName ?? "").trim() || null,
      issuingOrganization: (it.issuingOrganization ?? "").trim() || null,
      issueDate: it.issueDate || null,
      expiryDate: it.expiryDate || null,
      certificationNumber: (it.certificationNumber ?? "").trim() || null,
    }),
    normalize: (row) => ({
      id: row.id,
      certificationName: row.certificationName ?? null,
      issuingOrganization: row.issuingOrganization ?? null,
      issueDate: row.issueDate ?? null,
      expiryDate: row.expiryDate ?? null,
      certificationNumber: row.certificationNumber ?? null,
    }),
  },

  languages: {
    list: (rid) => `${API}/resumes/${rid}/languages`,
    create: (rid) => `${API}/resumes/${rid}/languages`,
    update: (rid, id) => `${API}/resumes/${rid}/languages/${id}`,
    remove: (rid, id) => `${API}/resumes/${rid}/languages/${id}`,
    toPayload: (it) => ({
      language: (it.language ?? "").trim() || null,
      proficiencyLevel:
        (it.proficiencyLevel ?? it.fluency ?? "").trim() || null,
      testName: (it.testName ?? "").trim() || null,
      testScore: (it.testScore ?? "").trim() || null,
      testDate: it.testDate || null,
    }),
    normalize: (r) => ({
      id: r.id ?? r.languageId ?? null,
      language: r.language ?? "",
      proficiencyLevel: r.proficiencyLevel ?? r.fluency ?? "",
      testName: r.testName ?? "",
      testScore: r.testScore ?? "",
      testDate: r.testDate ?? null,
    }),
  },

  portfolios: {
    list: (rid) => `${API}/resumes/${rid}/portfolios`,
    create: (rid) => `${API}/resumes/${rid}/portfolios`,
    update: (id) => `${API}/resumes/portfolios/${id}`,
    remove: (id) => `${API}/resumes/portfolios/${id}`,
    toPayload: (it) => ({
      title: (it.title ?? "").trim() || null,
      url: normalizeUrl(it.url),
      description: (it.description ?? "").trim() || null,
      portfolioType: (it.portfolioType ?? "").trim() || null,
    }),
    normalize: normalizePortfolio,
  },
};

/* ---------------------- 프로필 헤더 ---------------------- */
const ProfileHeader = ({ profile, onUpdate, onSave }) => {
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile);
  const [isUploading, setIsUploading] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false); // ★ 추가

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
    if (!isEditing || isUploading) return;
    fileInputRef.current?.click();
  };

  // 🔥 S3 업로드로 변경 (미리보기 기능 추가)
  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하로 업로드해주세요.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setIsUploading(true);

    const localPreviewUrl = URL.createObjectURL(file);
    setEditData({ ...editData, profileImageUrl: localPreviewUrl });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("module", "profiles");
      formData.append("public", "false");

      const response = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `업로드 실패: ${response.status}`);
      }

      const uploadResult = await response.json();
      let imageUrl = uploadResult.viewerUrl || uploadResult.url;
      if (imageUrl && imageUrl.startsWith("/api/")) {
        imageUrl = `http://localhost:8080${imageUrl}`;
      }

      URL.revokeObjectURL(localPreviewUrl);
      setEditData({ ...editData, profileImageUrl: imageUrl });
    } catch (error) {
      console.error("프로필 이미지 업로드 실패:", error);
      URL.revokeObjectURL(localPreviewUrl);
      setEditData({
        ...editData,
        profileImageUrl: profile.profileImageUrl || "",
      });
      alert("이미지 업로드에 실패했습니다: " + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
          style={{
            cursor: isEditing && !isUploading ? "pointer" : "default",
            opacity: isUploading ? 0.7 : 1,
          }}
        >
          <div className="profile-photo-wrapper">
            {(
              isEditing ? editData.profileImageUrl : profile.profileImageUrl
            ) ? (
              <img
                src={(() => {
                  const url = isEditing
                    ? editData.profileImageUrl
                    : profile.profileImageUrl;
                  if (url && url.startsWith("/api/")) {
                    return `http://localhost:8080${url}`;
                  }
                  return url;
                })()}
                alt={profile.name || "프로필"}
                className="profile-photo"
                onError={(e) => {
                  console.error("이미지 로드 실패:", e.currentTarget.src);
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.style.setProperty(
                    "display",
                    "flex"
                  );
                }}
              />
            ) : (
              <div className="profile-photo-placeholder">
                <User size={40} />
              </div>
            )}
            <div
              className="profile-photo-placeholder"
              style={{ display: "none" }}
            >
              <User size={40} />
            </div>
            {isEditing && (
              <div className="photo-edit-icon">
                {isUploading ? (
                  <div className="upload-spinner">
                    <div className="spinner-circle"></div>
                    <span>업로드 중...</span>
                  </div>
                ) : (
                  <Camera size={16} />
                )}
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handlePhotoChange}
            accept="image/*"
            disabled={!isEditing || isUploading}
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

            {/* ==== 여기 수정됨: 지역 인풋을 선택 팝업으로 ==== */}
            <div className="profile-info-item" style={{ position: "relative" }}>
              <MapPin size={14} />
              {isEditing ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    name="regionName"
                    value={editData.regionName || ""}
                    readOnly
                    onClick={() => setShowRegionPicker(true)}
                    placeholder="거주지역 선택"
                    style={{ cursor: "pointer", background: "#fff" }}
                  />
                  {editData.regionId && (
                    <button
                      type="button"
                      className="mini-btn"
                      onClick={() =>
                        setEditData({
                          ...editData,
                          regionId: null,
                          regionName: "",
                          regionParentId: null,
                        })
                      }
                      title="지역 지우기"
                    >
                      지우기
                    </button>
                  )}
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() => setShowRegionPicker(true)}
                    title="지역 선택"
                  >
                    선택
                  </button>

                  {showRegionPicker && (
                    <RegionPicker
                      initial={
                        editData.regionParentId
                          ? { parentId: editData.regionParentId }
                          : null
                      }
                      onSelect={(r) => {
                        setEditData({
                          ...editData,
                          regionId: r.id,
                          regionName: r.name,
                          regionParentId: r.parentId ?? null,
                        });
                      }}
                      onClose={() => setShowRegionPicker(false)}
                    />
                  )}
                </div>
              ) : (
                <span>{profile.regionName || "-"}</span>
              )}
            </div>
            {/* ==== /지역 ==== */}

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
    {
      id: "educations",
      name: (
        <>
          학력 <span className="palette-required-text">(필수)</span>
        </>
      ),
      icon: <GraduationCap size={20} />,
    },
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
  const location = useLocation();
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
  const validateExperiencePayload = (p, idx = 0) => {
    if (!p.companyName) return `경력 #${idx + 1}: 회사명은 필수입니다.`;
    if (!p.position) return `경력 #${idx + 1}: 직무/직책은 필수입니다.`;
    if (!p.startDate) return `경력 #${idx + 1}: 시작일은 필수입니다.`;
    return null;
  };
  const validateEducationPayload = (p, idx = 0) => {
    if (!p.schoolName) return `학력 #${idx + 1}: 학교명은 필수입니다.`;
    return null;
  };
  const validateCertificationPayload = (p, idx = 0) => {
    if (!p.certificationName)
      return `자격증 #${idx + 1}: 자격증명은 필수입니다.`;
    if (!p.issuingOrganization)
      return `자격증 #${idx + 1}: 발급기관은 필수입니다.`;
    if (!p.issueDate) return `자격증 #${idx + 1}: 취득일은 필수입니다.`;
    return null;
  };
  const buildSectionsFromResponse = (dto) => {
    const built = [];
    const push = (s) => s && built.push(s);
    const pickArray = (v) =>
      Array.isArray(v) ? v : Array.isArray(v?.content) ? v.content : [];

    // 정규화 적용되는 섹션들
    push(
      makeSection(
        "experiences",
        pickArray(dto.experiences ?? dto.experienceList).map(
          normalizeExperience
        )
      )
    );
    push(
      makeSection(
        "activities",
        pickArray(dto.activities ?? dto.activityList).map(normalizeActivity)
      )
    );

    // 나머지는 원래대로
    push(makeSection("educations", dto.educations ?? dto.educationList));
    push(
      makeSection(
        "skills",
        (dto.skills ?? dto.skillList ?? []).map(normalizeSkill)
      )
    );
    push(makeSection("projects", dto.projects ?? dto.projectList));
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
          const items = cfg.normalize ? raw.map(cfg.normalize) : raw;
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
    return sortSections(Array.from(map.values()));
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
    const createdId =
      typeof res.data === "number" ? res.data : Number(res.data?.id);
    setResumeId(createdId);
    navigate(`/resumes/${createdId}`, { replace: true });
    return createdId;
  };

  /* ---------- 프로필 로드 ---------- */
  const sectionRefs = useRef({});
  const [pendingFocusId, setPendingFocusId] = useState(null);
  const focusSection = (id) => setPendingFocusId(id);

  useEffect(() => {
    if (!pendingFocusId) return;
    const el = sectionRefs.current[pendingFocusId];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      const input = el.querySelector(
        'input, textarea, select, [contenteditable="true"], button'
      );
      if (input) input.focus({ preventScroll: true });
      setPendingFocusId(null);
    }
  }, [sections, pendingFocusId]);

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

  // ✅ 새 작성 진입 시 학력 섹션 1개 기본 생성 + 포커스
  useEffect(() => {
    if (resumeId) return;
    if (sections.length > 0) return;

    const preset = location.state?.presetSections;
    if (Array.isArray(preset) && preset.length > 0) {
      setSections(sortSections(preset));
      setEditingSections((prev) => {
        const next = { ...prev };
        preset.forEach((s) => (next[s.id] = true));
        return next;
      });
      const targetType = location.state?.presetFocusSectionType || "educations";
      const target = preset.find((s) => s.type === targetType) || preset[0];
      if (target) setTimeout(() => focusSection(target.id), 0);
      return;
    }

    const newSecId = `educations-${Date.now()}`;
    setSections(
      sortSections([
        {
          id: newSecId,
          type: "educations",
          data: [{ subId: `educations-item-${Date.now()}` }],
        },
      ])
    );
    setEditingSections((prev) => ({ ...prev, [newSecId]: true }));
    setTimeout(() => focusSection(newSecId), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, sections.length, location.state]);

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
    const snapshot = JSON.parse(JSON.stringify(target));
    setSectionBeforeEdit((prev) => ({ ...prev, [sectionId]: snapshot }));
    setEditingSections((prev) => ({ ...prev, [sectionId]: true }));
    focusSection(sectionId);
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
      const existSec = sections.find((s) => s.type === sectionType);
      setSections((prev) =>
        sortSections(
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
        )
      );
      setEditingSections((prev) => ({ ...prev, [existSec.id]: true }));
      focusSection(existSec.id);
    } else {
      const newSectionId = `${sectionType}-${Date.now()}`;
      setSections((prev) =>
        sortSections([
          ...prev,
          {
            id: newSectionId,
            type: sectionType,
            data: [{ subId: `${sectionType}-item-${Date.now()}` }],
          },
        ])
      );
      handleEditSection(newSectionId);
      setEditingSections((prev) => ({ ...prev, [newSectionId]: true }));
      focusSection(newSectionId);
    }
  };

  const handleRemoveSection = (sectionIdParam) =>
    setSections((prev) =>
      sortSections(prev.filter((s) => s.id !== sectionIdParam))
    );

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
      sortSections(
        prev
          .map((s) => {
            if (s.id !== sectionIdParam) return s;
            const rest = (s.data || []).filter((it) => it.subId !== subId);
            return rest.length > 0 ? { ...s, data: rest } : null;
          })
          .filter(Boolean)
      )
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

  // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ이력서 페이지 메인 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
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

  /* ---------- 이력서 메타 ---------- */
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

    // 섹션별 프론트 밸리데이션
    if (sec.type === "experiences") {
      const items = sec.data || [];
      for (let i = 0; i < items.length; i++) {
        const p = cfg.toPayload(items[i]);
        if (!hasAnyValue(p)) continue;
        const msg = validateExperiencePayload(p, i);
        if (msg) return alert(msg);
      }
    }

    if (sec.type === "educations") {
      const items = sec.data || [];
      for (let i = 0; i < items.length; i++) {
        const p = cfg.toPayload(items[i]);
        if (!hasAnyValue(p)) continue;
        const msg = validateEducationPayload(p, i);
        if (msg) return alert(msg);
      }
    }

    if (sec.type === "projects") {
      const items = sec.data || [];
      for (let i = 0; i < items.length; i++) {
        if (!items[i]?.projectName?.trim())
          return alert(`프로젝트 #${i + 1}: 프로젝트명은 필수입니다.`);
      }
    }

    if (sec.type === "certifications") {
      const items = sec.data || [];
      for (let i = 0; i < items.length; i++) {
        const p = cfg.toPayload(items[i]);
        if (!hasAnyValue(p)) continue;
        const msg = validateCertificationPayload(p, i);
        if (msg) return alert(msg);
      }
    }
    if (sec.type === "languages") {
      const items = sec.data || [];
      for (let i = 0; i < items.length; i++) {
        const p = cfg.toPayload(items[i]);
        if (!hasAnyValue(p)) continue;
        if (!p.language) return alert(`외국어 #${i + 1}: 언어는 필수입니다.`);
      }
    }
    if (sec.type === "portfolios") {
      const items = sec.data || [];
      for (let i = 0; i < items.length; i++) {
        const p = cfg.toPayload(items[i]);
        if (!hasAnyValue(p)) continue;
        if (!p.title) return alert(`포트폴리오 #${i + 1}: 제목은 필수입니다.`);
        if (!p.url) return alert(`포트폴리오 #${i + 1}: URL은 필수입니다.`);
        if (p.url && !/^https?:\/\/[\w.-]/i.test(p.url)) {
          return alert(`포트폴리오 #${i + 1}: URL 형식이 올바르지 않습니다.`);
        }
      }
    }

    try {
      await Promise.all(
        (sec.data || []).map(async (it) => {
          // UPDATE
          if (it.id) {
            if (!cfg.update) return;
            const urlForUpdate =
              cfg.update.length === 2
                ? cfg.update(rid, it.id)
                : cfg.update(it.id);
            const up = cfg.toPayload ? cfg.toPayload(it) : stripMeta(it);
            if (sec.type === "certifications") {
              const msg = validateCertificationPayload(up);
              if (msg) throw new Error(msg);
            } else {
              if (!hasAnyValue(up)) return;
            }
            await axios.put(urlForUpdate, up);
            return;
          }

          // CREATE
          if (!cfg.create) return;
          const reqPayload = cfg.toPayload ? cfg.toPayload(it) : stripMeta(it);

          if (sec.type === "skills") {
            let res;
            if (reqPayload.skillId) {
              res = await axios.post(cfg.create(rid), null, {
                params: { skillId: reqPayload.skillId },
                validateStatus: () => true,
              });
            } else if (reqPayload.name) {
              const created = await axios.post(
                `${API}/skills`,
                {
                  name: reqPayload.name,
                  categoryId: reqPayload.categoryId ?? null,
                  isVerified: false,
                },
                { validateStatus: () => true }
              );
              if (created.status < 200 || created.status >= 300) throw created;
              const sid =
                typeof created.data === "number"
                  ? created.data
                  : created.data?.id;
              if (!sid) throw new Error("생성된 스킬 ID를 찾을 수 없어요.");

              res = await axios.post(cfg.create(rid), null, {
                params: { skillId: sid },
                validateStatus: () => true,
              });
            } else {
              return;
            }

            if (
              !((res.status >= 200 && res.status < 300) || res.status === 409)
            ) {
              throw res;
            }

            const body = res.data;
            const newId =
              typeof body === "number"
                ? body
                : body?.id ?? body?.resumeSkillId ?? null;

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
            return;
          }

          if (sec.type === "certifications") {
            const msg = validateCertificationPayload(reqPayload);
            if (msg) throw new Error(msg);
          } else {
            if (!hasAnyValue(reqPayload)) return;
          }

          const res = await axios.post(cfg.create(rid), reqPayload, {
            validateStatus: () => true,
          });
          if (res.status < 200 || res.status >= 300) throw res;

          const body = res.data;
          const newId =
            typeof body === "number"
              ? body
              : body?.id ??
                body?.resumeCertificationId ??
                body?.activityId ??
                null;

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
        })
      );

      // 저장 후 해당 섹션 재로드
      
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
          const items = cfg.normalize ? raw.map(cfg.normalize) : raw;

          const refreshedData = (items || []).map((it, idx) => ({
            subId: `${sec.type}-item-${Date.now()}-${idx}`,
            ...it,
          }));

          setSections((prev) =>
            sortSections(
              prev.map((s) =>
                s.id === sectionIdParam ? { ...s, data: refreshedData } : s
              )
            )
          );
        }
      }

      await axios.put(`${API}/resumes/${rid}`, buildResumePayload());
      handleSaveSection(sectionIdParam);
      focusSection(sectionIdParam);
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
        navigate("/resumes", { replace: true });
        alert("이력서 작성이 완료되었습니다!");
      } else {
        await axios.put(`${API}/resumes/${resumeId}`, buildResumePayload());
        alert("이력서가 저장되었습니다.");
        navigate("/resumes", { replace: true });
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
        profile={userProfile}
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
                <section
                  key={section.id}
                  className="editor-section"
                  ref={(el) => {
                    if (el) sectionRefs.current[section.id] = el;
                    else delete sectionRefs.current[section.id];
                  }}
                >
                  <div className="section-header">
                    <h2>
                      {title}
                      {required && (
                        <span
                          className={`required-text ${
                            isEditing ? "active" : ""
                          }`}
                        >
                          (필수)
                        </span>
                      )}
                    </h2>
                    <div className="section-header-actions">
                      {isEditing ? (
                        <>
                          <button
                            className="action-btn primary"
                            onClick={async () => {
                              await saveSection(section.id);
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
