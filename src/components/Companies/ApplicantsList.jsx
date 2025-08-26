// src/components/ApplicantsList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../css/ApplicantsList.css";
// Resume 미리보기 및 섹션 컴포넌트들 (타이틀만 사용)
import {
  ExperienceForm,
  EducationForm,
  AwardForm,
  CertificationForm,
  LanguageForm,
  PortfolioForm,
  SkillForm,
  ProjectForm,
  ActivityForm,
} from "../Resume/index.js";

// 프로덕션 환경에서는 상대 경로 사용하여 nginx 프록시를 통해 백엔드 호출
axios.defaults.baseURL = "http://3.39.250.64:8080";
axios.defaults.withCredentials = true;

/* ================= 섹션 정의 (미리보기 헤더 타이틀) ================= */
const sectionComponents = {
  experiences: { title: "경력", component: ExperienceForm },
  educations:  { title: "학력", component: EducationForm },
  skills:      { title: "기술", component: SkillForm },
  projects:    { title: "프로젝트", component: ProjectForm },
  activities:  { title: "대외활동", component: ActivityForm },
  awards:      { title: "수상", component: AwardForm },
  certifications: { title: "자격증", component: CertificationForm },
  languages:   { title: "외국어", component: LanguageForm },
  portfolios:  { title: "포트폴리오", component: PortfolioForm },
};

/* ================= 공통 유틸 ================= */
// KST(Asia/Seoul) 기준 날짜/시간 분리
const kstDateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}); // en-CA → YYYY-MM-DD 형태
const kstTimeFmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatKST(value) {
  if (!value) return { date: "-", time: "" };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: String(value), time: "" };
  return { date: kstDateFmt.format(d), time: kstTimeFmt.format(d) };
}
function onlyDate(v) {
  return formatKST(v).date; // 없으면 "-" 반환됨
}
// === 링크/기간/문단 유틸 (전역) ===
const isUrl = (s) => {
  if (!s) return false;
  try { const u = new URL(s); return ["http:", "https:"].includes(u.protocol); } catch { return false; }
};
const LinkText = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>
    {children || href}
  </a>
);

const fmtPeriod = (s, e) => {
  return `${onlyDate(s)} ~ ${e ? onlyDate(e) : "진행중"}`;
};

const Para = ({ text }) => (
  <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, margin: "6px 0" }}>{text || "-"}</p>
);

const SECTION_ORDER = ["educations","skills","projects","experiences","certifications","activities","awards","languages","portfolios","links"];
const SECTION_ORDER_INDEX = Object.fromEntries(SECTION_ORDER.map((t, i) => [t, i]));
const sortSections = (arr=[]) => [...arr].sort((a,b) => (SECTION_ORDER_INDEX[a.type]??999)-(SECTION_ORDER_INDEX[b.type]??999));
const makeSection = (type, items=[]) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    data: items.map((it, idx)=>({ subId: `${type}-item-${Date.now()}-${idx}`, ...it })),
  };
};
const pickArray = (v) => Array.isArray(v) ? v : Array.isArray(v?.content) ? v.content : [];

/* ================= 상태 배지 ================= */
const STATUS_LABEL = {
  APPLIED: "지원 완료",
  VIEWED: "서류 열람",
  INTERVIEW_REQUEST: "면접 요청",
  OFFERED: "채용 제안",
  HIRED: "채용 확정",
  REJECTED: "불합격",
};
const StatusBadge = ({ status }) => {
  const cls = (status || "").toLowerCase();
  return <span className={`status-badge ${cls}`}>{STATUS_LABEL[status] || status}</span>;
};
// ===== 공통 섹션 레이아웃 =====
const SectionBox = ({ title, children }) => (
  <section className="al-card">
    <h3 className="al-card-title">{title}</h3>
    {children}
  </section>
);
const Row = ({ label, value, strong }) => (
  <div className="al-row">
    <div className="al-row-label">{label}</div>
    <div className={`al-row-value${strong ? " strong" : ""}`}>{value}</div>
  </div>
);

// ===== 프로필 =====
const ProfileBlock = ({ profile, app }) => (
  <SectionBox title="프로필">
    <Row label="이름" value={app?.applicantName || profile?.name || "-"} strong />
    <Row label="한 줄 소개" value={<Para text={profile?.summary || profile?.headline || ""} />} />
    <Row label="연락처" value={
      <>
        {app?.applicantEmail && <div>{app.applicantEmail}</div>}
        {profile?.phone && <div>{profile.phone}</div>}
        {profile?.website && isUrl(profile.website) && <div><LinkText href={profile.website} /></div>}
      </>
    } />
  </SectionBox>
);

// ===== 학력 =====
// 학력
const EducationBlock = ({ items = [] }) => (
  <SectionBox title="학력">
    {(!items || items.length === 0) ? (
      <EmptyNote />
    ) : items.map((ed) => (
      <div key={ed.subId} style={{ padding:"8px 0" }}>
        <div style={{ fontWeight:600 }}>{ed.schoolName} {ed.degree ? `· ${ed.degree}` : ""}</div>
        <div style={{ color:"#666" }}>{ed.major || "-"}</div>
        <div style={{ fontSize:13, color:"#888" }}>{fmtPeriod(ed.admissionDate, ed.graduationDate)}</div>
        {(ed.gpa || ed.maxGpa) && <div style={{ marginTop:4 }}>학점: {ed.gpa} / {ed.maxGpa || "-"}</div>}
      </div>
    ))}
  </SectionBox>
);

// 기술
const SkillsBlock = ({ items = [] }) => {
  const flat = items[0]?.skills || [];
  return (
    <SectionBox title="기술">
      {flat.length === 0 ? (
        <EmptyNote />
      ) : (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {flat.map((s) => (
            <span key={s.subId || s.id || s.name}
                  style={{ padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:999 }}>
              {s.name}
            </span>
          ))}
        </div>
      )}
    </SectionBox>
  );
};

// 프로젝트
const ProjectsBlock = ({ items = [] }) => (
  <SectionBox title="프로젝트">
    {(!items || items.length === 0) ? (
      <EmptyNote />
    ) : items.map((p) => (
      <div key={p.subId} style={{ padding:"10px 0" }}>
        <div style={{ fontWeight:600 }}>{p.projectName} {p.organization ? `(${p.organization})` : ""}</div>
        <div style={{ fontSize:13, color:"#888" }}>{fmtPeriod(p.startDate, p.endDate || (p.ongoing ? null : null))}</div>
        {p.projectUrl && isUrl(p.projectUrl) && <div style={{ marginTop:6 }}>링크: <LinkText href={p.projectUrl} /></div>}
        {Array.isArray(p.techStack) && p.techStack.length > 0 && (
          <div style={{ marginTop:6 }}>사용 기술: {p.techStack.join(", ")}</div>
        )}
        {p.description && <Para text={p.description} />}
      </div>
    ))}
  </SectionBox>
);

// 경력
const ExperiencesBlock = ({ items = [] }) => (
  <SectionBox title="경력">
    {(!items || items.length === 0) ? (
      <EmptyNote />
    ) : items.map((x) => (
      <div key={x.subId} style={{ padding:"10px 0" }}>
        <div style={{ fontWeight:600 }}>{x.companyName} · {x.position}</div>
        <div style={{ fontSize:13, color:"#888" }}>{fmtPeriod(x.startDate, x.endDate)}</div>
        {x.employmentType && <div style={{ marginTop:4 }}>고용형태: {x.employmentType}</div>}
        {x.achievements && <Para text={x.achievements} />}
        {(!x.achievements && x.description) && <Para text={x.description} />}
      </div>
    ))}
  </SectionBox>
);

// 자격증
const CertificationsBlock = ({ items = [] }) => (
  <SectionBox title="자격증">
    {(!items || items.length === 0) ? (
      <EmptyNote />
    ) : items.map((c) => (
      <div key={c.subId} style={{ padding:"8px 0" }}>
        <div style={{ fontWeight:600 }}>{c.certificationName}</div>
        <div style={{ color:"#666" }}>{c.issuingOrganization || "-"}</div>
        <div style={{ fontSize:13, color:"#888" }}>
          취득일: {c.issueDate ? onlyDate(c.issueDate) : "-"}
          {c.expiryDate ? ` · 만료: ${onlyDate(c.expiryDate)}` : ""}
        </div>
        {c.certificationNumber && <div>자격번호: {c.certificationNumber}</div>}
      </div>
    ))}
  </SectionBox>
);

// 대외활동
const ActivitiesBlock = ({ items = [] }) => (
  <SectionBox title="대외활동">
    {(!items || items.length === 0) ? (
      <EmptyNote />
    ) : items.map((a) => (
      <div key={a.subId} style={{ padding:"8px 0" }}>
        <div style={{ fontWeight:600 }}>{a.activityName} {a.organization ? `· ${a.organization}` : ""}</div>
        <div style={{ fontSize:13, color:"#888" }}>{fmtPeriod(a.startDate, a.endDate)}</div>
        {a.description && <Para text={a.description} />}
      </div>
    ))}
  </SectionBox>
);

// 수상
const AwardsBlock = ({ items = [] }) => (
  <SectionBox title="수상 경력">
    {(!items || items.length === 0) ? (
      <EmptyNote />
    ) : items.map((w) => (
      <div key={w.subId} style={{ padding:"8px 0" }}>
        <div style={{ fontWeight:600 }}>{w.awardName}</div>
        <div style={{ color:"#666" }}>{w.organization || "-"}</div>
        {w.awardDate && <div style={{ fontSize:13, color:"#888" }}>{onlyDate(w.awardDate)}</div>}
        {w.description && <Para text={w.description} />}
      </div>
    ))}
  </SectionBox>
);

// 외국어
const LanguagesBlock = ({ items = [] }) => (
  <SectionBox title="외국어">
    {(!items || items.length === 0) ? (
      <EmptyNote />
    ) : items.map((l) => (
      <div key={l.subId} style={{ padding:"8px 0" }}>
        <div style={{ fontWeight:600 }}>{l.language} {l.proficiencyLevel ? `· ${l.proficiencyLevel}` : ""}</div>
        {(l.testName || l.testScore || l.testDate) && (
          <div style={{ color:"#666" }}>
            시험: {l.testName || "-"} / 점수: {l.testScore || "-"} / 일자: {l.testDate ? onlyDate(l.testDate) : "-"}
          </div>
        )}
      </div>
    ))}
  </SectionBox>
);

// 포트폴리오
const PortfoliosBlock = ({ items = [] }) => (
  <SectionBox title="포트폴리오">
    {(!items || items.length === 0) ? (
      <EmptyNote />
    ) : items.map((p) => (
      <div key={p.subId} style={{ padding:"8px 0" }}>
        <div style={{ fontWeight:600 }}>{p.title} {p.portfolioType ? `· ${p.portfolioType}` : ""}</div>
        {p.url && isUrl(p.url) && <div><LinkText href={p.url} /></div>}
        {p.description && <Para text={p.description} />}
      </div>
    ))}
  </SectionBox>
);
const LinksBlock = ({ items = [] }) => (
  <SectionBox title="첨부 링크">
    <ul style={{ paddingLeft: 18, margin: 0 }}>
      {items.map((it) => (
        <li key={it.subId} style={{ margin: "6px 0" }}>
          <a
            href={it.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2563eb", textDecoration: "underline", wordBreak: "break-all" }}
          >
            {it.label || it.url}
          </a>
        </li>
      ))}
    </ul>
  </SectionBox>
);


/* ================= 섹션 정규화 (컨트롤러 DTO → 미리보기 필드) ================= */
const normalizeEducation = (r={}) => ({
  id: r.id ?? r.educationId ?? null,
  schoolName: r.schoolName ?? r.school ?? "",
  major: r.major ?? "",
  degree: r.degree ?? "",
  admissionDate: r.admissionDate ?? r.startDate ?? null,
  graduationDate: r.graduationDate ?? r.endDate ?? null,
  gpa: r.gpa ?? null,
  maxGpa: r.maxGpa ?? null,
});

const normalizeExperience = (r={}) => ({
  id: r.id ?? r.experienceId ?? null,
  companyName: r.companyName ?? r.company ?? "",
  position: r.position ?? r.role ?? "",
  employmentType: r.employmentType ?? null,
  startDate: r.startDate ?? null,
  endDate: r.endDate ?? null,
  description: r.description ?? r.desc ?? "",
  achievements: r.achievements ?? "",
});

const normalizeSkill = (r={}) => ({
  id: r.id ?? r.resumeSkillId ?? null,          // 링크 PK
  skillId: r.skillId ?? r.skill?.id ?? null,    // 스킬 PK
  name: r.name ?? r.skillName ?? r.skill?.name ?? "",
  categoryId: r.categoryId ?? r.category?.id ?? r.skill?.categoryId ?? null,
});

const normalizeProject = (r={}) => ({
  id: r.id ?? r.projectId ?? null,
  projectName: r.projectName ?? r.name ?? "",
  organization: r.organization ?? r.projectOrg ?? "",
  role: r.role ?? "",
  startDate: r.startDate ?? null,
  endDate: r.endDate ?? null,
  ongoing: Boolean(r.ongoing ?? false),
  projectUrl: r.projectUrl ?? r.url ?? "",
  description: r.description ?? r.desc ?? "",
  techStack: Array.isArray(r.techStack)
    ? r.techStack
    : (r.techStack ? String(r.techStack).split(",").map(s=>s.trim()).filter(Boolean) : []),
});

const normalizeAward = (r={}) => ({
  id: r.id ?? r.awardId ?? null,
  awardName: r.awardName ?? r.awardTitle ?? "",
  organization: r.organization ?? r.awardingInstitution ?? "",
  awardDate: r.awardDate ?? null,
  description: r.description ?? r.desc ?? "",
});

const normalizeCertification = (r={}) => ({
  id: r.id ?? r.certificationId ?? null,
  certificationName: r.certificationName ?? "",
  issuingOrganization: r.issuingOrganization ?? "",
  issueDate: r.issueDate ?? null,
  expiryDate: r.expiryDate ?? null,
  certificationNumber: r.certificationNumber ?? null,
});

const normalizeLanguage = (r={}) => ({
  id: r.id ?? r.languageId ?? null,
  language: r.language ?? "",
  proficiencyLevel: r.proficiencyLevel ?? r.fluency ?? "",
  testName: r.testName ?? "",
  testScore: r.testScore ?? "",
  testDate: r.testDate ?? null,
});

const normalizeActivity = (r={}) => ({
  id: r.id ?? r.activityId ?? null,
  activityName: r.activityName ?? r.name ?? r.title ?? "",
  organization: r.organization ?? r.org ?? r.company ?? "",
  role: r.role ?? r.position ?? "",
  startDate: r.startDate ?? r.beginDate ?? null,
  endDate: r.endDate ?? r.finishDate ?? null,
  description: r.description ?? r.desc ?? "",
});

const normalizePortfolio = (r={}) => ({
  id: r.id ?? r.portfolioId ?? null,
  title: r.title ?? r.name ?? "",
  url: r.url ?? r.link ?? "",
  description: r.description ?? r.desc ?? "",
  portfolioType: r.portfolioType ?? r.type ?? "",
});

// 공통 빈 안내
const EmptyNote = ({ text = "등록하지 않았습니다." }) => (
  <div style={{ padding: "6px 0", color: "#9ca3af", fontSize: 14 }}>{text}</div>
);

/* ================= 엔드포인트 맵 (컨트롤러 반영) ================= */
const API = "/api";
const SECTION_API = {
  // Page<EducationResponse>
  educations: { list: (rid) => `${API}/resumes/${rid}/educations`, normalize: normalizeEducation },
  // List<ExperienceResponse>
  experiences: { list: (rid) => `${API}/resumes/${rid}/experiences`, normalize: normalizeExperience },
  // List<ResumeSkillResponse>
  skills: { list: (rid) => `${API}/resumes/${rid}/skills`, normalize: normalizeSkill, isSkill: true },
  // List<ResumeProjectResponse>
  projects: { list: (rid) => `${API}/resumes/${rid}/projects`, normalize: normalizeProject },
  // Page<ActivityResponse>
  activities: { list: (rid) => `${API}/resumes/${rid}/activities`, normalize: normalizeActivity },
  // List<ResumeAwardResponse>
  awards: { list: (rid) => `${API}/resumes/${rid}/awards`, normalize: normalizeAward },
  // List<ResumeCertificationResponse>
  certifications: { list: (rid) => `${API}/resumes/${rid}/certifications`, normalize: normalizeCertification },
  // List<ResumeLanguageDto>
  languages: { list: (rid) => `${API}/resumes/${rid}/languages`, normalize: normalizeLanguage },
  // List<ResumePortfolioDto>
  portfolios: { list: (rid) => `${API}/resumes/${rid}/portfolios`, normalize: normalizePortfolio },
};

/* ================= API helpers ================= */
async function markApplicationViewed(appId) {
  await axios.patch(`/api/applications/${appId}/view`, null, { withCredentials: true });
}
async function updateApplicationStatus(appId, nextStatus) {
  await axios.patch(`/api/applications/${appId}/status`, { status: nextStatus }, { withCredentials: true });
}

/* ================= 메인 ================= */
const ApplicantsList = () => {
  const { user, isAuthed } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [postings, setPostings] = useState([]);
  const [selectedPostingId, setSelectedPostingId] = useState(searchParams.get("postingId") || "");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 미리보기 상태
  const [preview, setPreview] = useState({
    open: false,
    app: null,             // application 원본
    mode: "page",          // "page" | "file"
    resumeTitle: "",
    profile: null,
    sections: [],
    fileUrl: null,
    fileViewerUrl: null,
  });

  const companyId = useMemo(() => user?.companyId ?? user?.id ?? null, [user]);

  /* ============ 이력서 로딩 (파일 우선 → 섹션별 API) ============ */
 // ApplicantsList.jsx 안의 loadResumeForPreview 전체 교체
const loadResumeForPreview = async (rid, application) => {
  const toAbs = (u) =>
    !u ? "" : u.startsWith("/api/") ? `${axios.defaults.baseURL}${u}` : u;
   // 파일 URL 계산만 해두고, 페이지형으로 링크만 노출할 것
  const rawUrl = application?.resumeUrl
    ? toAbs(application.resumeUrl)
    : application?.resumeFileKey
    ? `${axios.defaults.baseURL}/api/files/view?key=${encodeURIComponent(application.resumeFileKey)}&disposition=inline`
    : null;


  // iframe 금지 도메인(대표 예시)
  const EMBED_DENY = [
    /(^|\.)github\.com$/i,
    /(^|\.)raw\.githubusercontent\.com$/i,
    /(^|\.)notion\.so$/i,
    /(^|\.)docs\.google\.com$/i,
    /(^|\.)drive\.google\.com$/i,
  ];
  const urlHost = (u) => {
    try {
      return new URL(u).host;
    } catch {
      return "";
    }
  };
  const isDenied = (u) => EMBED_DENY.some((re) => re.test(urlHost(u)));


  // 2) resumeId가 없으면 최소 정보만
 if (!rid) {
  return {
    mode: "page",
    title: application?.resumeTitle || "이력서",
    profile: { name: application?.applicantName || "" },
    sections: rawUrl
      ? [{
          id: `links-${Date.now()}`,
          type: "links",
          data: [{ subId: `links-item-${Date.now()}`, label: "첨부 파일", url: rawUrl }],
        }]
      : [],
  };
}

// 섹션 호출 (403/404 등은 조용히 무시)
const entries = Object.entries(SECTION_API);
const results = await Promise.all(
  entries.map(async ([type, cfg]) => {
    try {
      const res = await axios.get(cfg.list(rid), {
        withCredentials: true,
        validateStatus: () => true, // 어떤 코드든 받아서 직접 분기
      });
      if (res.status !== 200) return null; // 401/403/404 등은 skip

      const raw = pickArray(res.data);
      const normalized = cfg.normalize ? raw.map(cfg.normalize) : raw;
      if (!normalized?.length) return null;

      if (cfg.isSkill) {
        const flat = normalized
          .map(normalizeSkill)
          .filter((s) => (s.name || "").trim().length > 0);
        if (!flat.length) return null;
        return {
          id: `skills-${Date.now()}`,
          type: "skills",
          data: [{ subId: `skills-item-${Date.now()}`, skills: flat }],
        };
      }

      return makeSection(type, normalized);
    } catch {
      return null; // 네트워크 예외도 조용히 skip
    }
  })
);

  const sections = sortSections(results.filter(Boolean));

return {
  mode: "page",
  title: application?.resumeTitle || "이력서",
  profile: { name: application?.applicantName || "" },
  sections: rawUrl
    ? sortSections([
        ...sections,
        { id: `links-${Date.now()}`, type: "links",
          data: [{ subId: `links-item-${Date.now()}`, label: "첨부 파일", url: rawUrl }] },
      ])
    : sections,
};
};


  /* ============ 권한 가드 ============ */
  if (!isAuthed) {
    return (
      <div className="jobposting-container large">
        <h2 className="jobposting-title">지원자 리스트</h2>
        <p>로그인이 필요합니다.</p>
      </div>
    );
  }
  if (!companyId || (user?.role || "").toString().toUpperCase() !== "COMPANY") {
    return (
      <div className="jobposting-container large">
        <h2 className="jobposting-title">지원자 리스트</h2>
        <p>회사 정보가 없습니다. 기업 회원으로 로그인했는지 확인해주세요.</p>
      </div>
    );
  }

  /* ============ 회사 공고 로드 ============ */
  useEffect(() => {
    let alive = true;
    setError("");
    (async () => {
      try {
        const res = await axios.get("/api/company/postings", {
          withCredentials: true,
          validateStatus: (s) => s >= 200 && s < 300,
        });
        const list = res.data ?? [];
        const normalized = list.map((p) => ({
          id: String(p.id ?? p.postingId ?? ""),
          title: p.title ?? "제목 없음",
          status: p.status ?? "",
          createdAt: p.createdAt ?? p.openDate ?? null,
        }));
        if (!alive) return;
        setPostings(normalized);
        if (!selectedPostingId && normalized.length > 0) {
          const firstId = normalized[0].id;
          setSelectedPostingId(firstId);
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("postingId", firstId);
            return next;
          });
        }
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("공고 목록을 불러오는 중 오류가 발생했습니다.");
      }
    })();
    return () => { alive = false; };
  }, [companyId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ============ 지원자 로드 ============ */
  useEffect(() => {
    if (!selectedPostingId) {
      setApplicants([]);
      return;
    }
    let alive = true;
    setError("");
    setLoading(true);

    (async () => {
      try {
        const res = await axios.get("/api/applications", {
          params: { postingId: selectedPostingId },
          withCredentials: true,
          validateStatus: (s) => s >= 200 && s < 300,
        });

        const list = res.data?.items ?? res.data?.applications ?? res.data ?? [];
        const normalized = list.map((a) => {
          const user = a.user ?? a.applicant ?? {};
          const resume = a.resume ?? {};
          const snake = (k) =>
            a[k] ??
            a[k.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase())] ??
            resume[k] ??
            resume[k?.replace?.(/[A-Z]/g, (m) => "_" + m.toLowerCase())] ??
            user[k] ??
            user[k?.replace?.(/[A-Z]/g, (m) => "_" + m.toLowerCase())];

          return {
            id: String(a.id ?? a.applicationId ?? snake("applicationId") ?? snake("application_id") ?? ""),
            applicantId: user.id ?? user.userId ?? snake("userId") ?? snake("user_id") ?? null,
            applicantName:
              a.applicantName ?? a.userName ?? a.name ?? user.name ?? snake("applicantName") ?? snake("applicant_name") ?? "이름 없음",
            applicantEmail:
              a.applicantEmail ?? a.email ?? user.email ?? snake("applicantEmail") ?? snake("applicant_email") ?? "-",
            resumeId: a.resumeId ?? resume.id ?? snake("resumeId") ?? snake("resume_id") ?? null,
            resumeTitle: a.resumeTitle ?? resume.title ?? snake("resumeTitle") ?? snake("resume_title") ?? "-",
            resumeFileKey: a.resumeFileKey ?? resume.fileKey ?? snake("resumeFileKey") ?? snake("resume_file_key") ?? null,
            resumeUrl: a.resumeUrl ?? resume.fileUrl ?? resume.url ?? snake("resumeUrl") ?? snake("resume_url") ?? null,
            status: a.status ?? "APPLIED",
            appliedAt: a.appliedAt ?? a.createdAt ?? snake("appliedAt") ?? snake("applied_at") ?? null,
            viewedAt: a.viewedAt ?? a.viewdAt ?? null,
          };
        });

        if (!alive) return;
        setApplicants(normalized);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setError("지원자 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [selectedPostingId]);

  /* ============ 이벤트 핸들러 ============ */
  const handleOpenResume = async (application) => {
    try {
      await markApplicationViewed(application.id);

      // 리스트 즉시 반영
      setApplicants(prev =>
        prev.map(x =>
          x.id === application.id
            ? { ...x, status: x.status === "APPLIED" ? "VIEWED" : x.status, viewedAt: new Date().toISOString() }
            : x
        )
      );

      const previewData = await loadResumeForPreview(application.resumeId, application);

      setPreview({
        open: true,
        mode: previewData.mode || "page",
        app: {
          ...application,
          status: application.status === "APPLIED" ? "VIEWED" : application.status,
          viewedAt: new Date().toISOString(),
        },
        resumeTitle: previewData.title,
        profile: previewData.profile,
        sections: previewData.sections,
        fileUrl: previewData.fileUrl || null,
        fileViewerUrl: previewData.fileViewerUrl || null,
      });
    } catch (e) {
      console.error(e);
      alert("열람 처리 중 문제가 발생했습니다.");
    }
  };

  //네이게이션 추가
  const navigate = useNavigate();

  const handleStatusChange = async (application, nextStatus) => {
    try {
      await updateApplicationStatus(application.id, nextStatus);
      setApplicants(prev =>
        prev.map(x => (x.id === application.id ? { ...x, status: nextStatus } : x))
      );
      // 모달 동기화 (안전 가드)
      setPreview((p) =>
        p.open && p.app && p.app.id === application.id
          ? { ...p, app: { ...p.app, status: nextStatus } }
          : p
      );
    } catch (e) {
      console.error(e);
      alert("상태 변경에 실패했습니다.");
    }
  };

    const handleInterview = async (application, nextStatus) => {
    try {
      await updateApplicationStatus(application.id, nextStatus);
      setApplicants(prev =>
        prev.map(x => (x.id === application.id ? { ...x, status: nextStatus } : x))
      );
      // 모달 동기화 (안전 가드)
      setPreview((p) =>
        p.open && p.app && p.app.id === application.id
          ? { ...p, app: { ...p.app, status: nextStatus } }
          : p
      );
      navigate(`/chat/invites/${application.applicantId}?name=${encodeURIComponent(application.applicantName)}`); //면접제안 페이지로 이동 (userid,이름 넘겨주기)
    } catch (e) {
      console.error(e);
      alert("상태 변경에 실패했습니다.");
    }
  };

  // ESC로 모달 닫기 (파일 상태까지 초기화)
  useEffect(() => {
    if (!preview.open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setPreview({
          open: false,
          app: null,
          mode: "page",
          resumeTitle: "",
          profile: null,
          sections: [],
          fileUrl: null,
          fileViewerUrl: null,
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview.open]);

  /* ============ 렌더링 ============ */
  return (
    <div className="jobposting-container large">
      <h2 className="jobposting-title">지원자 리스트</h2>

      <fieldset className="form-section">
        <legend>공고 선택</legend>
        <div className="form-group">
          <label htmlFor="postingSelect">내 공고</label>
          <select
            id="postingSelect"
            value={selectedPostingId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedPostingId(id);
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                if (id) next.set("postingId", id);
                else next.delete("postingId");
                return next;
              });
            }}
          >
            {postings.length === 0 && <option value="">등록한 공고가 없습니다</option>}
            {postings.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>지원자 목록</legend>
        {error && <div style={{ color: "#b00020", marginBottom: 12 }}>{error}</div>}
        {loading ? (
          <div>불러오는 중...</div>
        ) : applicants.length === 0 ? (
          <div>현재 지원자가 없습니다.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #eee" }}>이름</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #eee" }}>이메일</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #eee" }}>이력서</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #eee" }}>지원일</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #eee" }}>열람일</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #eee" }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.id}>
                        <td
                          style={{
                            padding: "10px 8px",
                            borderBottom: "1px solid #f3f3f3",
                            fontSize: "16px",
                            whiteSpace: "nowrap",
                            maxWidth: 160,          // 필요 시 조절
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                          title={a.applicantName}   // 말줄임 시 툴팁
                        >
                          {a.applicantName}
                        </td>                    
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3",fontSize:"12px" }}>{a.applicantEmail}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      {a.resumeTitle ? (
                        <button
                          type="button"
                          onClick={() => handleOpenResume(a)}
                          style={{ all: "unset", cursor: "pointer", color: "#2563eb", textDecoration: "underline" }}
                          title="이력서 미리보기 (열람 처리됨)"
                        >
                          {a.resumeTitle}
                        </button>
                      ) : (
                        <span style={{ color: "#777" }}>제목 없음</span>
                      )}
                    </td>
                 <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                  {(() => {
                    const { date, time } = formatKST(a.appliedAt);
                    return (
                      <>
                        <div>{date}</div>
                        {time && <div style={{ fontSize: 12, color: "#666" }}>{time}</div>}
                      </>
                    );
                  })()}
                </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                  {a.viewedAt ? (() => {
                    const { date, time } = formatKST(a.viewedAt);
                    return (
                      <>
                        <div>{date}</div>
                        {time && <div style={{ fontSize: 12, color: "#666" }}>{time}</div>}
                      </>
                    );
                  })() : "-"}
                </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </fieldset>

    {/* ======= 페이지형 이력서 미리보기 모달 (커스텀) ======= */}
{preview.open && preview.mode === "page" && (
  <>
    <div className="preview-modal-overlay" onClick={() =>
      setPreview({ open:false, app:null, mode:"page", resumeTitle:"", profile:null, sections:[], fileUrl:null, fileViewerUrl:null })
    }>
      <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          
          <h1>{preview.resumeTitle || "이력서"}</h1>
          <div className="export-actions">
            {/* 필요시 'PDF로 내보내기' 등 확장 */}
            <button className="close-btn" onClick={() =>
              setPreview({ open:false, app:null, mode:"page", resumeTitle:"", profile:null, sections:[], fileUrl:null, fileViewerUrl:null })
            } aria-label="닫기">&times;</button>
          </div>
        </div>

      <div className="preview-scroll">
        <ProfileBlock profile={preview.profile} app={preview.app} />

          {/* 섹션별 렌더 */}
          {preview.sections.map((sec) => {
            const t = sec.type;
            const data = sec.data || [];
            if (t === "educations") return <EducationBlock key={sec.id} items={data} />;
            if (t === "skills") return <SkillsBlock key={sec.id} items={data} />;
            if (t === "projects") return <ProjectsBlock key={sec.id} items={data} />;
            if (t === "experiences") return <ExperiencesBlock key={sec.id} items={data} />;
            if (t === "certifications") return <CertificationsBlock key={sec.id} items={data} />;
            if (t === "activities") return <ActivitiesBlock key={sec.id} items={data} />;
            if (t === "awards") return <AwardsBlock key={sec.id} items={data} />;
            if (t === "languages") return <LanguagesBlock key={sec.id} items={data} />;
            if (t === "portfolios") return <PortfoliosBlock key={sec.id} items={data} />;
            if (t === "links") return <LinksBlock key={sec.id} items={data} />;

            // 알 수 없는 섹션은 텍스트로 폴백
            return (
              <SectionBox key={sec.id} title={t}>
                <Para text={JSON.stringify(data, null, 2)} />
              </SectionBox>
            );
          })}
        </div>
      </div>
    </div>

    {/* 상태 액션바 (그대로 유지) */}
    <div className="al-actionbar-fixed">
      <div className="al-actionbar-left">
        <span>지원자: <strong>{preview.app?.applicantName}</strong></span>
        <span>현재 상태: <StatusBadge status={preview.app?.status} /></span>
      </div>
      <div className="al-actionbar-right">
        <button className="al-btn" onClick={() => handleInterview(preview.app, "INTERVIEW_REQUEST")}
                disabled={preview.app?.status === "INTERVIEW_REQUEST"}>면접요청</button>
        <button className="al-btn" onClick={() => handleStatusChange(preview.app, "OFFERED")}
                disabled={preview.app?.status === "OFFERED"}>채용 제안</button>
        <button className="al-btn" onClick={() => handleStatusChange(preview.app, "HIRED")}
                disabled={preview.app?.status === "HIRED"}>채용확정</button>
        <button className="al-btn danger" onClick={() => handleStatusChange(preview.app, "REJECTED")}
                disabled={preview.app?.status === "REJECTED"}>불합격</button>
      </div>
    </div>
  </>
)}


      {/* 액션바 최소 스타일(공통) */}
      <style>{`
        .al-actionbar-fixed{
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 16px;
          width: min(800px, 94vw);
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,.12);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          z-index: 2147483647;
        }
        .al-actionbar-left{
          display: flex; align-items: center; gap: 16px;
          font-size: 14px; color: #374151;
        }
        .al-actionbar-right{ display: flex; gap: 8px; flex-wrap: wrap; }
        .al-btn{
          padding: 8px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          font-size: 13px;
          transition: all .2s;
        }
        .al-btn:hover:not(:disabled){ background: #f9fafb; border-color: #d1d5db; }
        .al-btn:disabled{ opacity:.5; cursor: not-allowed; }
        .al-btn.danger{ border-color:#fecaca; background:#fef2f2; color:#dc2626; }
        .al-btn.danger:hover:not(:disabled){ background:#fee2e2; }
      `}</style>
    </div>
  );
};

export default ApplicantsList;
