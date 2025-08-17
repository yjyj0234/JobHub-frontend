import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Building2,
  CalendarDays,
  DollarSign,
  Star,
  Users,
  Globe2,
  CheckCircle2,
} from "lucide-react";
import "../css/JobPostingList.css";
import "../css/JobPostingDetail.css";

const JobPostingDetail = () => {

  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const didFetchRef=useRef({ lastId: null, done: false });
// ...existing code...
useEffect(() => {
  const fetchJobDetail = async () => {
    if (didFetchRef.current.lastId !== id) {
      didFetchRef.current = { lastId: id, done: false };
    }
    if (didFetchRef.current.done) return;
    didFetchRef.current.done = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/jobs/${id}`, {
        credentials: "include",
        headers: { Accept: "application/json" }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
      }
      const data = await res.json();
      // 조회수 1씩 증가 (setJob에서만 증가)
      setJob(prev => {
        const newData = mapApiJobToUi(data);
        newData.views = (newData.views ?? 0) + 1;
        return newData;
      });
    } catch (e) {
      console.error("[JobDetail] fetch error:", e);
      setError("상세 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };
  if (id) fetchJobDetail();
}, [id]);
// ...existing code...
  // === ENUM/코드 → 라벨 매핑 ===
  const mapCloseType = (t) => {
    switch (t) {
      case "DEADLINE":
        return "마감일";
      case "UNTIL_FILLED":
        return "채용시 마감";
      case "CONTINUOUS":
        return "상시채용";
      case "PERIODIC":
        return "정기채용";
      default:
        return "";
    }
  };

  const mapEmploymentType = (t) => {
    switch (t) {
      case "FULL_TIME":
        return "정규직";
      case "CONTRACT":
        return "계약직";
      case "INTERN":
        return "인턴";
      case "PART_TIME":
        return "파트타임";
      case "FREELANCE":
        return "프리랜서";
      default:
        return t || "";
    }
  };

  const mapEducationLevel = (e) => {
    switch (e) {
      case "ANY":
        return "학력무관";
      case "HIGH_SCHOOL":
        return "고졸";
      case "COLLEGE":
        return "전문대졸";
      case "UNIVERSITY":
        return "대졸(4년)";
      case "MASTER":
        return "석사";
      case "PHD":
        return "박사";
      default:
        return e || "";
    }
  };

  const mapExperienceLevel = (x) => {
    switch (x) {
      case "ENTRY":
        return "신입";
      case "JUNIOR":
        return "주니어";
      case "MID":
        return "미들";
      case "SENIOR":
        return "시니어";
      case "LEAD":
        return "리드";
      case "EXECUTIVE":
        return "임원";
      default:
        return x || "";
    }
  };

  const formatSalaryRange = (min, max, type) => {
    if (type === "NEGOTIABLE" || type === "UNDISCLOSED") return "협의";
    const toKrw = (n) =>
      typeof n === "number" && !Number.isNaN(n) ? n.toLocaleString() : "";
    const unit = type === "ANNUAL" ? "만원" : type === "MONTHLY" ? "만원/월" : type === "HOURLY" ? "원/시" : "";
    if (min && max) return `${toKrw(min)} ~ ${toKrw(max)}${unit}`;
    if (min && !max) return `${toKrw(min)}${unit} 이상`;
    if (!min && max) return `${toKrw(max)}${unit} 이하`;
    return "협의";
  };

  // UI 매핑 헬퍼 (백엔드 스키마 호환)
  const mapApiJobToUi = (j) => ({
    id: j.id,
    title: j.title,
    company: j.companyName,
    logo: j.companyLogo,
    // locations: [{ regionId, name?, isPrimary }]
    locations: j.locations ?? (j.regions ? (j.regions ?? []).map((name, idx) => ({ name, isPrimary: idx === 0 })) : []),
    // categories: [{ categoryId, name?, isPrimary }]
    categories: j.categories ?? j.jobCategories ?? [],
    // conditions: from job_posting_conditions
    conditions: j.conditions ?? {
      employment_type: j.employmentType,
      education_level: j.education,
      experience_level: j.experienceLevel,
      min_experience_years: j.minExperienceYears,
      max_experience_years: j.maxExperienceYears,
      salary_type: j.salaryType,
      min_salary: j.minSalary,
      max_salary: j.maxSalary,
      work_schedule: j.workSchedule,
      etc: j.etc,
    },
    closeType: j.closeType,
    closeDate: j.closeDate,
    skills: j.skills ?? [],
    views: j.viewCount ?? 0,
    applications: j.applicationCount ?? 0,
    description: j.description ?? "",
    responsibilities: j.responsibilities ?? [],
    qualifications: j.qualifications ?? [],
    preferences: j.preferences ?? [],
    benefits: j.benefits ?? [],
    homepage: j.homepage ?? "",
  });


  const closeLabel = useMemo(() => {
    if (!job) return "";
    const typeText = mapCloseType(job.closeType);
    if (job.closeType === "CONTINUOUS") return typeText; // 상시채용
    if (job.closeType === "UNTIL_FILLED") return typeText; // 채용시 마감
    if (job.closeType === "PERIODIC") return typeText; // 정기채용
    if (job.closeType === "DEADLINE" && job.closeDate)
      return `~ ${String(job.closeDate).substring(0, 10)}`;
    return typeText || "";
  }, [job]);

  const employmentLabel = useMemo(() => mapEmploymentType(job?.conditions?.employment_type), [job]);
  const educationLabel = useMemo(() => mapEducationLevel(job?.conditions?.education_level), [job]);
  const experienceLevelLabel = useMemo(() => mapExperienceLevel(job?.conditions?.experience_level), [job]);
  const experienceYearsLabel = useMemo(() => {
    const min = job?.conditions?.min_experience_years;
    const max = job?.conditions?.max_experience_years;
    if (min === 0 && (max === 0 || max == null)) return "신입";
    if (min != null && max != null) return `경력 ${min}~${max}년`;
    if (min != null && max == null) return `경력 ${min}년 이상`;
    if (min == null && max != null) return `경력 ${max}년 이하`;
    return experienceLevelLabel || "";
  }, [job, experienceLevelLabel]);
  const salaryText = useMemo(() =>
    formatSalaryRange(
      job?.conditions?.min_salary,
      job?.conditions?.max_salary,
      job?.conditions?.salary_type
    ), [job]
  );

  if (loading) {
    return (
      <div className="job-detail-container">
        <div className="detail-header skeleton" />
        <div className="detail-body">
          <div className="main-col">
            <div className="card skeleton" style={{ height: 300 }} />
          </div>
          <aside className="side-col">
            <div className="card skeleton" style={{ height: 200 }} />
          </aside>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="error-text">상세 정보를 불러오지 못했습니다.</p>;
  }

  if (!job) return null;

  return (
    <div className="job-detail-container">
      <div className="detail-header">
        <div className="detail-inner">
          <div className="company-logo-box large">
            {job.logo ?? job.company?.[0] ?? ""}
          </div>
          <div className="title-area">
            <h1 className="job-title">{job.title}</h1>
            <div className="company-line">
              <span className="company-name">{job.company}</span>
              {closeLabel && <span className="deadline-badge">{closeLabel}</span>}
            </div>
            <div className="meta-row">
              {((job.locations ?? []).length > 0) && (
                <span className="meta">
                  <MapPin size={16} /> {(job.locations || []).map((l) => l.name ?? l.regionName ?? l.regionId).filter(Boolean).join(' / ')}
                </span>
              )}
              <span className="meta">
                <Briefcase size={16} /> {employmentLabel}
              </span>
              <span className="meta">
                <Building2 size={16} /> {experienceYearsLabel}
              </span>
              <span className="meta">
                <CalendarDays size={16} /> {educationLabel}
              </span>
            </div>
          </div>
          <div className="cta-area">
            <div className="salary-chip">
              <DollarSign size={16} /> {salaryText}
            </div>
            <button className="apply-button">지원하기</button>
          </div>
        </div>
      </div>

      <div className="detail-body">
        <div className="main-col">
          {/* 소개 */}
          {job.description && (
            <section className="card section">
              <h2 className="section-title">회사/포지션 소개</h2>
              <p className="desc-text">{job.description}</p>
            </section>
          )}

          {/* 자격요건 */}
          {(job.qualifications?.length ?? 0) > 0 && (
            <section className="card section">
              <h2 className="section-title">자격요건</h2>
              <ul className="check-list">
                {job.qualifications.map((q, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={18} />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 담당업무 */}
          {(job.responsibilities?.length ?? 0) > 0 && (
            <section className="card section">
              <h2 className="section-title">담당업무</h2>
              <ul className="check-list">
                {job.responsibilities.map((r, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={18} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 우대사항 */}
          {(job.preferences?.length ?? 0) > 0 && (
            <section className="card section">
              <h2 className="section-title">우대사항</h2>
              <ul className="check-list">
                {job.preferences.map((p, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={18} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 복지 및 혜택 */}
          {(job.benefits?.length ?? 0) > 0 && (
            <section className="card section">
              <h2 className="section-title">복지 및 혜택</h2>
              <ul className="benefit-grid">
                {job.benefits.map((b, idx) => (
                  <li key={idx} className="benefit-item">
                    <Star size={16} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="side-col">
          <div className="card side-card">
            <div className="side-row">
              <Users size={16} />
              <span>지원자수</span>
              <strong>{job.applications?.toLocaleString?.() ?? 0}</strong>
            </div>
            <div className="side-row">
              <EyeIcon />
              <span>조회수</span>
              <strong>{job.views?.toLocaleString?.() ?? 0}</strong>
            </div>
            <div className="side-row">
              <CalendarDays size={16} />
              <span>마감</span>
              <strong>{closeLabel || "상시채용"}</strong>
            </div>
            {job.conditions?.work_schedule && (
              <div className="side-row">
                <CalendarDays size={16} />
                <span>근무형태</span>
                <strong>{job.conditions.work_schedule}</strong>
              </div>
            )}
            {job.homepage && (
              <a className="link-button" href={job.homepage} target="_blank" rel="noreferrer">
                <Globe2 size={16} /> 회사 홈페이지
              </a>
            )}
            <button className="apply-button wide">지금 지원하기</button>
          </div>

          {(job.categories?.length ?? 0) > 0 && (
            <div className="card side-card">
              <h3 className="side-title">직무 카테고리</h3>
              <div className="skill-tags">
                {(job.categories || []).map((c, idx) => (
                  <span key={idx} className="skill-tag">
                    {c.name || c.categoryName || (c.categoryId ? `카테고리 #${c.categoryId}` : "")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(job.skills?.length ?? 0) > 0 && (
            <div className="card side-card">
              <h3 className="side-title">필수/우대 기술</h3>
              <div className="skill-tags">
                {job.skills.map((s) => (
                  <span key={s} className="skill-tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default JobPostingDetail;
 
