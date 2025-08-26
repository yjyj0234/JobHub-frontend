import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin, Briefcase, Building2, CalendarDays, DollarSign, Star, Users, CheckCircle2, Eye
} from "lucide-react";
import "../css/JobApplication.css";
import PolicyModal from "./PolicyModal";


function prettySize(bytes) {
  if (typeof bytes !== "number") return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)}MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)}KB`;
}

function prettyDate(s) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  } catch {
    return "-";
  }
}
function ddays(closeType, closeDate) {
  if (!closeDate || closeType === "UNTIL_FILLED" || closeType === "CONTINUOUS") return null;
  const end = new Date(closeDate);
  const diff = Math.ceil((end.getTime() - Date.now()) / (1000*60*60*24));
  return diff;
}

// 첫 번째로 "정의되어 있고 빈문자 아님" 값을 선택
const _pickFirst = (...vals) => vals.find(v => v !== undefined && v !== null && v !== "");

// undefined/null → "" 로
const _asStr = (v) => (v === undefined || v === null) ? "" : String(v);

// 응답이 { data: {...} } 또는 { profile: {...} } 형태여도 꺼내기
const _unwrapProfile = (raw) => {
  if (!raw || typeof raw !== "object") return {};
  if (raw.data && typeof raw.data === "object") return raw.data;
  if (raw.profile && typeof raw.profile === "object") return raw.profile;
  return raw; // 평면 구조
};

// 다양한 키 케이스를 커버해서 name/email/phone을 뽑아냄
function normalizeProfileFields(rawProfile, meFallback) {
  const p = _unwrapProfile(rawProfile) || {};

  const name = _pickFirst(
    p.name, p.fullName, p.username, p.displayName, p.nickName, p.nickname,
    meFallback?.name
  );
  const email = _pickFirst(
    p.email, p.mail, p.primaryEmail,
    meFallback?.email
  );
  const phone = _pickFirst(
    p.phone, p.phoneNumber, p.mobile, p.mobilePhone, p.tel, p.contact, p.cell, p.cellphone
  );

  return {
    name: _asStr(name),
    email: _asStr(email),
    phone: _asStr(phone),
  };
}
//지역표시
// ✅ getLocationText 버그 수정 버전
function getLocationText(job) {
  const remote = job?.isRemote === true || job?.is_remote === 1;

  const regionFromArray = Array.isArray(job?.regions) ? job.regions[0] : null;

  let fromLocations = null;
  if (Array.isArray(job?.locations) && job.locations.length > 0) {
    const first = job.locations[0];
    fromLocations =
      first?.name ??
      first?.fullName ??
      first?.regionName ??
      first?.city ??
      null;
  }

  const single =
    job?.location ??
    job?.region ??
    job?.locationName ??
    job?.regionName ??
    null;

  let base =
    (typeof regionFromArray === "string" && regionFromArray.trim()) ? regionFromArray.trim() :
    (typeof fromLocations === "string" && fromLocations.trim()) ? fromLocations.trim() :
    (typeof single === "string" && single.trim()) ? single.trim() :
    "-";

  if (remote && base !== "-") base = `${base} (재택근무 가능)`;
  return base;
}


export default function JobApplication() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);

  // 폼 상태
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    linkGithub: "",
    linkLinkedIn: "",
    linkPortfolio: "",
    expectedSalary: "",
    availableFrom: "",
    coverLetter: "",
    agree: false,
  });
  // 저장된 이력서(서버) 관련

//내 프로필 관련
  const [profile, setProfile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

// 내 이력서 목록
const [resumes, setResumes] = useState([]); // [{id, fileName, size, url, updatedAt}, ...]
const [resumesLoading, setResumesLoading] = useState(false);
const [selectedResumeId, setSelectedResumeId] = useState(null); // 라디오 선택용

const [auth, setAuth] = useState(null);
const [profileLoading, setProfileLoading] = useState(false);

// 내 정보 표시/수정 토글 (원하면 유지)
const [editContact, setEditContact] = useState(false);

// 하이픈을 '비분리 하이픈(-)'으로 바꿔 줄바꿈을 막음
const inlinePhone = (s) => (s ? String(s).replace(/-/g, "\u2011") : "");

// === 상단에 유틸 추가 ===
const mapExperienceLevel = (x) => {
  switch (x) {
    case "ENTRY": return "신입";
    case "JUNIOR": return "주니어";
    case "MID": return "미들";
    case "SENIOR": return "시니어";
    case "LEAD": return "리드급";
    case "EXECUTIVE": return "임원";
    default: return x || "";
  }
};

const mapEducationLevel = (e) => {
  switch (e) {
    case "ANY": return "학력무관";
    case "HIGH_SCHOOL": return "고졸";
    case "COLLEGE": return "전문대졸(2년제)";
    case "UNIVERSITY": return "대졸(4년제)";
    case "MASTER": return "석사";
    case "PHD": return "박사";
    default: return e || "";
  }
};
const [policyOpen, setPolicyOpen] = useState(false);
const [policyType, setPolicyType] = useState("COLLECTION");
const openPolicy = (type) => { setPolicyType(type); setPolicyOpen(true); };

const resumeName = (r) => r?.fileName ?? r?.title ?? `이력서 #${r?.id}`;
const resumeUpdatedAt = (r) => r?.updatedAt ?? r?.updated_at ?? r?.modifiedAt ?? r?.modified_at;


  // 채용공고 및 유저간단정보 로드
useEffect(() => {
  (async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) 공고
      const r1 = await fetch(`/api/jobs/${jobId}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!r1.ok) throw new Error(`HTTP ${r1.status}`);
      const jobPayload = await r1.json();
      setJob(jobPayload);

      // 2) auth/me (id/email 등)
      let me = null;
      try {
        const r2 = await fetch("/api/auth/me", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (r2.ok) me = await r2.json();
      } catch {}
      setAuth(me);

      // 3) profile/me (이름/연락처/이메일)
// 3) profile/me (이름/연락처/이메일)
setProfileLoading(true);
try {
  let profileDto = null;

  const rP = await fetch("/api/profile/me", {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (rP.ok) {
    profileDto = await rP.json();
  } else if (rP.status === 403 && me?.id) {
    // 🔁 Fallback: me가 403이면 owner endpoint로 시도
    const rP2 = await fetch(`/api/profile/${me.id}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (rP2.ok) profileDto = await rP2.json();
  }

  if (profileDto) {
    const normalized = normalizeProfileFields(profileDto, me);
    setProfile(profileDto);
    setForm(prev => ({
      ...prev,
      name: normalized.name || prev.name || "",
      email: normalized.email || prev.email || "",
      phone: normalized.phone || prev.phone || "",
    }));
  } else {
    // 프로필 실패 시 최소한 이메일만 채움
    setForm(prev => ({
      ...prev,
      email: me?.email ?? prev.email ?? "",
    }));
  }
} finally {
  setProfileLoading(false);
}

      // 4) 내 이력서 목록
      try {
        setResumesLoading(true);
        const r3 = await fetch("/api/resumes", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (r3.ok) {
          const list = await r3.json();
          const arr = Array.isArray(list) ? list : [];
              // ✅ 공개 이력서만 노출 (서버 tinyint(1)→ 0/1 또는 boolean 모두 대응)
          const visible = arr.filter(r =>
            r.is_public === 1 || r.is_public === '1' || r.is_public === true || r.isPublic === true
          );
          setResumes(visible);
          setSelectedResumeId(visible.length > 0 ? visible[0].id : null);
        } else {
          setResumes([]);
          setSelectedResumeId(null);

        }
      } finally {
        setResumesLoading(false);
      }
    } catch (e) {
      console.error(e);
      setError("입사지원 페이지를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  })();
}, [jobId]);

async function saveProfileIfNeeded() {
  if (!auth?.id) return;
  const dto = {
    name: form.name?.trim() || "",
    email: form.email?.trim() || "",
    phone: form.phone?.trim() || "",
  };
  try {
    await fetch(`/api/profile/${auth.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(dto),
    });
  } catch {}
}
  const dday = useMemo(() => ddays(job?.closeType, job?.closeDate), [job]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

const isValid = useMemo(() => {
  return (
    form.name.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    !!selectedResumeId &&
    form.agree
  );
}, [form, selectedResumeId]);

const handleSubmit = async () => {
  await saveProfileIfNeeded();

  if (!isValid) return;
  setSubmitting(true);
  try {
    const fd = new FormData();
    fd.append("jobId", jobId);
    fd.append("name", form.name.trim());
    fd.append("email", form.email.trim());
    fd.append("phone", form.phone.trim());
    fd.append("coverLetter", form.coverLetter ?? "");
    fd.append("linkGithub", form.linkGithub ?? "");
    fd.append("linkLinkedIn", form.linkLinkedIn ?? "");
    fd.append("linkPortfolio", form.linkPortfolio ?? "");
    fd.append("expectedSalary", form.expectedSalary ?? "");
    fd.append("availableFrom", form.availableFrom ?? "");
    fd.append("resumeId", String(selectedResumeId));  

    const res = await fetch("/api/applications", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
       // ✅ 409는 사용자 안내만 하고 종료
    if (res.status === 409) {
      alert("이미 이 공고에 지원하셨습니다. 지원내역에서 확인해주세요.");
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await res.json();

    alert("지원이 완료되었습니다.");
    navigate(`/jobpostinglist/${jobId}`);
  } catch (e) {
    
    console.error(e);
    alert("지원 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  } finally {
    setSubmitting(false);
  }
};


const handleSaveDraft = async () => {
  try {
    const res = await fetch("/api/applications/draft", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, ...form, resumeId: selectedResumeId }), // ✅
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    alert("임시저장 했습니다.");
  } catch (e) {
    console.error(e);
    alert("임시저장에 실패했습니다.");
  }
};

  if (loading) return <div className="apply-page-container"><p className="loading-text">불러오는 중...</p></div>;
  if (error) return <div className="apply-page-container"><p className="error-text">{error}</p></div>;
  if (!job) return null;

  if (!auth) {
  return (
    <div className="apply-page-container">
      <p className="error-text">로그인이 필요합니다.</p>
      <Link className="btn outline" to="/">이전페이지</Link>
    </div>
  );
}
    if (auth && auth.role && auth.role !== "USER") {
    return (
      <div className="apply-page-container">
        <p className="error-text">개인 사용자만 지원할 수 있습니다.</p>
      </div>
    );
  }
  return (
    <div className="apply-page-container">
      <header className="apply-header">
        <div className="apply-header-inner">
          <h1 className="apply-title">입사지원</h1>
          <p className="apply-subtitle">채용 공고에 필요한 정보를 입력하고 지원서를 제출하세요.</p>
        </div>
      </header>

      <div className="apply-content">
        {/* 좌측: 폼 */}
        <main className="apply-form">
          {/* 섹션: 지원자 정보 */}
    {/* === 공고 정보 카드 === */}
        <section className="apply-card jobinfo-card">
          <div className="jobinfo-company">{job?.companyName ?? "-"}</div>
          <h2 className="jobinfo-title">{job?.title ?? "-"}</h2>
          <div className="jobinfo-meta">
            {mapExperienceLevel(job?.conditions?.experience_level) || "경력 정보 없음"}
            <span className="pipe">|</span>
            {mapEducationLevel(job?.conditions?.education_level) || "학력 정보 없음"}
            <span className="pipe">|</span>
              {getLocationText(job)}
          </div>
           <ul className="job-meta">

              <li><CalendarDays size={16}/>시작일 {prettyDate(job?.openDate) || "-"}</li>
              {job?.closeType !== "CONTINUOUS" && (
                <li><CalendarDays size={16}/>마감일 {prettyDate(job?.closeDate) || "미정"}</li>
              )}
            </ul>
        </section>

   {/* === 내 정보 카드(표시만) === */}
<section className="apply-card myinfo-card">
  <h2 className="apply-card-title">내 정보</h2>
  <div className="myinfo-grid myinfo-inline"> {/* ← inline 레이아웃용 클래스 */}
    <div className="myinfo-row">
      <strong className="label">이름</strong>
      <span className="value nowrap">{form.name || "-"}</span>
    </div>
    <div className="myinfo-row">
      <strong className="label">이메일</strong>
      <span className="value nowrap">{form.email || "-"}</span>
    </div>
    <div className="myinfo-row">
      <strong className="label">연락처</strong>
      <span className="value nowrap">{form.phone || "-"}</span>
    </div>
  </div>
  {/* 필요하면 “정보 수정” 버튼을 두고, 클릭 시 입력창으로 토글하는 로직 추가 가능 */}
</section>

 <section className="apply-card">
  <h2 className="apply-card-title">
    이력서 선택
  </h2>

    {resumesLoading ? (
    <p className="muted">이력서를 불러오는 중…</p>
  ) : resumes.length === 0 ? (
    <div className="empty-resume">
      <p className="muted">등록된 이력서가 없습니다.</p>
      {/* 👉 실제 이력서 관리 경로로 바꿔줘 */}
      <Link className="btn outline" to="/resumes">이력서 관리로 가기</Link>
    </div>
  ) : (
    <ul className="resume-list">
      {resumes.map((r) => {
      const selected = selectedResumeId === r.id;
      return (
        <li
          key={r.id}
          className={`resume-item selectable ${selected ? "is-selected" : ""}`}
          onClick={() => setSelectedResumeId(r.id)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedResumeId(r.id); } }}
          tabIndex={0}
          role="button"
          aria-pressed={selected ? "true" : "false"}
        >
          <div className="resume-line">
            <span className="resume-file">
              <span className="name">{resumeName(r)}</span>
              {typeof r.completion_rate === "number" && (
                <span className="size"> · 완성도 {r.completion_rate}%</span>
              )}
              {r.status && <span className="size"> · {r.status}</span>}
            </span>
          </div>
          <div className="resume-sub">
            업데이트: {prettyDate(resumeUpdatedAt(r))}
            {r.url && (
              <> · <a className="link" href={r.url} target="_blank" rel="noreferrer">미리보기</a></>
            )}
          </div>
        </li>
      );
    })}
  </ul>
)}
  <div className="resume-actions">
    {/* 👉 실제 이력서 관리 경로로 바꿔줘 */}
    <Link className="btn tiny" to="/resumes">이력서 관리</Link>
  </div>
</section>
          {/* 동의 */}
          <section className="apply-card">
            <label className="agree-line">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
              <span>개인정보 수집 및 이용에 동의합니다.     
                  <button type="button" className="link-btn" onClick={() => openPolicy('COLLECTION')}>전문 보기</button>
              </span>
            </label>
          </section>

          

        {preview && (
  <section className="apply-card preview">
    <h2 className="apply-card-title">미리보기</h2>
    <div className="preview-grid">
      <div>
        <h3>지원자</h3>
        <p className="nowrap">{form.name} · {form.email} · {inlinePhone(form.phone)}</p>
        {(form.linkGithub || form.linkLinkedIn || form.linkPortfolio) && (
          <ul className="link-list">
            {form.linkGithub && <li>GitHub: {form.linkGithub}</li>}
            {form.linkLinkedIn && <li>LinkedIn: {form.linkLinkedIn}</li>}
            {form.linkPortfolio && <li>Portfolio: {form.linkPortfolio}</li>}
          </ul>
        )}
        {(form.expectedSalary || form.availableFrom) && (
          <p className="muted">희망연봉: {form.expectedSalary || "-"} / 입사 가능일: {form.availableFrom || "-"}</p>
        )}
      </div>
      <div>
        <h3>이력서</h3>
        {selectedResumeId ? (
          <div className="preview-cl">
            선택한 이력서: <strong>
              {resumes.find(r => r.id === selectedResumeId)?.fileName ?? `이력서 #${selectedResumeId}`}
            </strong>
            {resumes.find(r => r.id === selectedResumeId)?.url && (
              <> · <a className="link" href={resumes.find(r => r.id === selectedResumeId)?.url} target="_blank" rel="noreferrer">미리보기</a></>
            )}
          </div>
        ) : (
          <div className="preview-cl muted">선택된 이력서가 없습니다.</div>
        )}
      </div>
    </div>
  </section>
)}
                 <PolicyModal
                  open={policyOpen}
                  type={policyType}
                  onClose={() => setPolicyOpen(false)}/>
        </main>

        {/* 우측: 공고 요약(스티키) */}
        <aside className="apply-sidebar">
   
          <div className="tip-card">
            <h4>지원 팁</h4>
            <ul>
              <li>프로젝트 결과물 링크(GitHub/배포 URL)를 포함하세요.</li>
              <li>자기소개서는 역할/문제/행동/결과 순으로 간결하게.</li>
              <li>파일명에 이름_지원직무를 포함하면 좋아요.</li>
            </ul>
          </div>
               {/* ✅ 큰 화면에서 버튼을 지원팁 아래로 */}
     <div className="action-stack">
       <button type="button" className="btn outline" onClick={()=>setPreview((v)=>!v)} disabled={submitting}>
         <Eye size={16} /> 미리보기
       </button>
       <button
         type="button"
         className="btn primary"
         disabled={!isValid || submitting}
         onClick={handleSubmit}
       >
         {submitting ? "제출 중..." : "제출하기"}
       </button>
     </div>
        </aside>
      </div>
    </div>
  );
}
