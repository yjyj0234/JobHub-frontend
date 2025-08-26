// src/components/resume/ResumeListPage.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FilePlus,
  Link as LinkIcon,
  FileText,
  MoreVertical,
  Trash2,
  Copy,
  User as UserIcon,
  User,
  Phone,
  MapPin,
  Calendar,
  Save,
  X,
  Camera,
  Pencil,
} from "lucide-react";
import "../css/ResumeListPage.css";
import "../css/ResumeEditorPage.css"; // 프로필 헤더 스타일 재사용

import { useAuth } from "../context/AuthContext.jsx";
import { Modal } from "../UI/index.js";
import { Bot } from "lucide-react";

/* ---------------------- 공통 설정 ---------------------- */
const API_BASE_URL = "/api"; // 백엔드 표준 프리픽스
const API = API_BASE_URL; // ProfileHeader/RegionPicker에서 그대로 사용
axios.defaults.withCredentials = true;

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

/* ---------------------- 지역 선택 팝업 ---------------------- */
const RegionPicker = ({ initial, onSelect, onClose }) => {
  const [sido, setSido] = useState([]);
  const [sigungu, setSigungu] = useState([]);
  const [selectedSido, setSelectedSido] = useState(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [flatRegions, setFlatRegions] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/search/regions`);
        setSido(res.data?.regions || []);
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

/* ---------------------- 에디터의 ProfileHeader 그대로 ---------------------- */
const ProfileHeader = ({ profile, onUpdate, onSave }) => {
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile);
  const [isUploading, setIsUploading] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

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

      const response = await fetch("/api/upload", {
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
        imageUrl = `${imageUrl}`;
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
                    return `${url}`;
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

      {/* <div className="profile-info-wide">
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
      </div> */}
    </div>
  );
};

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

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const openModal = (type) => setModalContent(type);
  const closeModal = () => setModalContent(null);

  /* ---------------------- 프로필 저장 (에디터와 동일) ---------------------- */
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
      await axios.put(`${API_BASE_URL}/profile/${uid}`, payload);
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

  /* ---------------------- 내 프로필 로드 ---------------------- */
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthed) {
        setProfile(null);
        return;
      }
      const uid = getUid(user);
      if (!uid) return;
      setProfileLoading(true);
      setProfileError("");
      try {
        const { data, status } = await axios.get(
          `${API_BASE_URL}/profile/${uid}`,
          {
            validateStatus: (s) => s === 200 || s === 404 || s === 204,
          }
        );
        if (status === 200 && data) {
          setProfile({
            name: data?.name ?? (user?.email || ""),
            phone: data?.phone ?? "",
            birthDate: data?.birthDate ?? "",
            profileImageUrl: data?.profileImageUrl ?? "",
            headline: data?.headline ?? "",
            summary: data?.summary ?? "",
            regionId: typeof data?.regionId === "number" ? data.regionId : null,
            regionName: data?.regionName ?? "",
          });
        } else if (status === 404 || status === 204) {
          setProfile({
            name: user?.email || "",
            phone: "",
            birthDate: "",
            profileImageUrl: "",
            headline: "프로필 정보 없음",
            summary: "",
            regionId: null,
            regionName: "",
          });
        } else {
          setProfileError("프로필을 불러오지 못했어요.");
        }
      } catch (e) {
        console.error("[ResumeList] profile fetch error:", e);
        setProfileError("프로필을 불러오지 못했어요.");
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [isAuthed, user]);

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
    } catch (_) {}
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
        {/* ▷ 상단에 에디터의 프로필 헤더 그대로 표시 */}
        {isAuthed && profile && (
          <ProfileHeader
            profile={profile}
            onUpdate={(p) => setProfile(p)}
            onSave={handleSaveProfile}
          />
        )}
        {isAuthed && profileLoading && (
          <div className="phc-root">
            <div className="phc-skeleton" />
          </div>
        )}
        {isAuthed && profileError && (
          <div className="phc-root">
            <div className="phc-error">{profileError}</div>
          </div>
        )}

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
