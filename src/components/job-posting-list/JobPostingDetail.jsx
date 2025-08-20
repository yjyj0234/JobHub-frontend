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
  Clock,
} from "lucide-react";
import "../css/JobPostingList.css";
import "../css/JobPostingDetail.css";
import DOMPurify from "dompurify";

const BACKEND_ORIGIN = "http://localhost:8080";

function toViewerUrlFromAny(src) {
  if (!src) return src;
  if (/^\/?api\/files\/view\?/.test(src)) {
    return `${BACKEND_ORIGIN}${src.startsWith("/") ? src : `/${src}`}`;
  }
  try {
    const u = new URL(src);
    if (/s3[.-].*amazonaws\.com$/i.test(u.host)) {
      const key = u.pathname.replace(/^\/+/, "");
      return `${BACKEND_ORIGIN}/api/files/view?key=${encodeURIComponent(key)}`;
    }
  } catch {}
  if (/^(?:public|private)\//i.test(src)) {
    return `${BACKEND_ORIGIN}/api/files/view?key=${encodeURIComponent(src)}`;
  }
  if (src.startsWith("s3://")) {
    const parts = src.split("/");
    const key = parts.slice(3).join("/");
    return `${BACKEND_ORIGIN}/api/files/view?key=${encodeURIComponent(key)}`;
  }
  if (src.startsWith("/")) {
    return `${BACKEND_ORIGIN}${src}`;
  }
  return src;
}

function rewriteDescriptionHtml(rawHtml) {
  if (!rawHtml) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(String(rawHtml), "text/html");
    doc.querySelectorAll("img").forEach((img) => {
      const original = img.getAttribute("src") || "";
      const fixed = toViewerUrlFromAny(original);
      if (fixed) img.setAttribute("src", fixed);
      img.setAttribute("loading", "lazy");
      img.setAttribute("referrerpolicy", "no-referrer");
      img.removeAttribute("onerror");
      img.removeAttribute("onload");
    });
    return doc.body.innerHTML;
  } catch {
    return String(rawHtml);
  }
}

const JobPostingDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const didFetchRef = useRef({ lastId: null, done: false });

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
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
        }
        const data = await res.json();
        setJob(mapApiJobToUi(data));
      } catch (e) {
        console.error("[JobDetail] fetch error:", e);
        setError("상세 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJobDetail();
  }, [id]);

  const mapCloseType = (t) => {
    switch (t) {
      case "DEADLINE": return "마감일";
      case "UNTIL_FILLED": return "채용시 마감";
      case "CONTINUOUS": return "상시채용";
      case "PERIODIC": return "정기채용";
      default: return "";
    }
  };

  const mapEmploymentType = (t) => {
    switch (t) {
      case "FULL_TIME": return "정규직";
      case "CONTRACT": return "계약직";
      case "INTERN": return "인턴";
      case "PART_TIME": return "파트타임";
      case "FREELANCE": return "프리랜서";
      default: return t || "";
    }
  };

  const mapEducationLevel = (e) => {
    switch (e) {
      case "ANY": return "학력무관";
      case "HIGH_SCHOOL": return "고졸";
      case "COLLEGE": return "전문대졸";
      case "UNIVERSITY": return "대졸(4년)";
      case "MASTER": return "석사";
      case "PHD": return "박사";
      default: return e || "";
    }
  };

  const mapExperienceLevel = (x) => {
    switch (x) {
      case "ENTRY": return "신입";
      case "JUNIOR": return "주니어";
      case "MID": return "미들";
      case "SENIOR": return "시니어";
      case "LEAD": return "리드";
      case "EXECUTIVE": return "임원";
      default: return x || "";
    }
  };

  const formatSalaryRange = (min, max, type) => {
    if (type === "NEGOTIABLE" || type === "UNDISCLOSED") return "협의";
    const toKrw = (n) =>
      typeof n === "number" && !Number.isNaN(n) ? n.toLocaleString() : "";
    const unit =
      type === "ANNUAL" ? "만원" :
      type === "MONTHLY" ? "만원/월" :
      type === "HOURLY" ? "원/시" : "";
    if (min && max) return `${toKrw(min)} ~ ${toKrw(max)}${unit}`;
    if (min && !max) return `${toKrw(min)}${unit} 이상`;
    if (!min && max) return `${toKrw(max)}${unit} 이하`;
    return "협의";
  };

  const normalizeConditions = (cond) => {
    if (!cond) return null;
    const c = cond || {};
    const pick = (...vals) => vals.find((v) => v !== undefined && v !== null);
    return {
      employment_type: pick(c.employment_type, c.employmentType),
      education_level: pick(c.education_level, c.educationLevel),
      experience_level: pick(c.experience_level, c.experienceLevel),
      min_experience_years: pick(c.min_experience_years, c.minExperienceYears),
      max_experience_years: pick(c.max_experience_years, c.maxExperienceYears),
      salary_type: pick(c.salary_type, c.salaryType),
      min_salary: pick(c.min_salary, c.minSalary),
      max_salary: pick(c.max_salary, c.maxSalary),
      work_schedule: pick(c.work_schedule, c.workSchedule),
      etc: pick(c.etc),
    };
  };

  const normalizeCategories = (j) => {
    const raw = j.categories ?? j.jobCategories ?? j.job_posting_categories ?? [];
    return (raw || []).map((c) => {
      const categoryId = c.categoryId ?? c.category_id ?? c.category?.id ?? c.id;
      const name = c.name ?? c.categoryName ?? c.category?.name ?? null;
      const isPrimaryRaw = c.isPrimary ?? c.is_primary;
      const isPrimary =
        typeof isPrimaryRaw === "number" ? isPrimaryRaw === 1 : !!isPrimaryRaw;
      return { categoryId, name, isPrimary };
    });
  };

  const mapApiJobToUi = (j) => ({
    id: j.id,
    title: j.title,
    company: j.companyName ?? j.company_name ?? j.company?.name ?? j.company,
    logo: j.companyLogo ?? j.logo ?? j.company?.logo ?? j.company?.logoUrl,
    locations:
      j.locations ??
      (j.regions ? (j.regions ?? []).map((name, idx) => ({ name, isPrimary: idx === 0 })) : []),
    categories: normalizeCategories(j),
    conditions: normalizeConditions(j.conditions),
    closeType: j.closeType ?? j.close_type,
    closeDate: j.closeDate ?? j.close_date,
    skills: j.skills ?? [],
    views: j.viewCount ?? j.view_count ?? 0,
    applications: j.applicationCount ?? j.application_count ?? 0,
    description: j.description ?? j.desc ?? "",
    responsibilities: j.responsibilities ?? [],
    qualifications: j.qualifications ?? [],
    preferences: j.preferences ?? [],
    benefits: j.benefits ?? [],
    homepage: j.homepage ?? j.companyHomepage ?? j.company_homepage ?? j.company?.homepage ?? "",
  });

  const closeLabel = useMemo(() => {
    if (!job) return "";
    const typeText = mapCloseType(job.closeType);
    if (job.closeType === "CONTINUOUS") return typeText;
    if (job.closeType === "UNTIL_FILLED") return typeText;
    if (job.closeType === "PERIODIC") return typeText;
    if (job.closeType === "DEADLINE" && job.closeDate)
      return `~ ${String(job.closeDate).substring(0, 10)}`;
    return typeText || "";
  }, [job]);

  const employmentLabel = useMemo(
    () => mapEmploymentType(job?.conditions?.employment_type),
    [job]
  );
  const educationLabel = useMemo(
    () => mapEducationLevel(job?.conditions?.education_level),
    [job]
  );
  const experienceLevelLabel = useMemo(
    () => mapExperienceLevel(job?.conditions?.experience_level),
    [job]
  );
  const experienceYearsLabel = useMemo(() => {
    const min = job?.conditions?.min_experience_years;
    const max = job?.conditions?.max_experience_years;
    if (min === 0 && (max === 0 || max == null)) return "신입";
    if (min != null && max != null) return `경력 ${min}~${max}년`;
    if (min != null && max == null) return `경력 ${min}년 이상`;
    if (min == null && max != null) return `경력 ${max}년 이하`;
    return experienceLevelLabel || "";
  }, [job, experienceLevelLabel]);

  const salaryText = useMemo(
    () =>
      formatSalaryRange(
        job?.conditions?.min_salary,
        job?.conditions?.max_salary,
        job?.conditions?.salary_type
      ),
    [job]
  );

  const safeDescriptionHTML = useMemo(() => {
    const rewritten = rewriteDescriptionHtml(job?.description || "");
    return DOMPurify.sanitize(rewritten, {
      ADD_TAGS: ["img", "figure", "figcaption"],
      ADD_ATTR: ["src","alt","title","width","height","srcset","sizes","loading","referrerpolicy"],
      ADD_DATA_URI_TAGS: ["img"],
    });
  }, [job?.description]);

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
    {/* === 제목 행 === */}
    <div className="title-row">
      <div className="title-left">
        <div className="company-logo-box small">
          {job.logo ? (
            <img
              src={job.logo}
              alt={`${job.company} 로고`}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            (job.company?.[0] ?? "").toUpperCase()
          )}
        </div>

        <div className="title-area">
          <h1 className="job-title">{job.title}</h1>
          <div className="company-line">
            <span className="company-name">{job.company}</span>
            {closeLabel && <span className="deadline-badge">{closeLabel}</span>}
          </div>
        </div>
      </div>

      {/* 오른쪽 지원 버튼 */}
      <div className="title-cta">
        <button className="apply-button">지원하기</button>
      </div>
    </div>
  </div>

  {/* === 메타 박스 (연봉/근무지역 등) === */}
  <div className="meta-wrapper">
    <div className="meta-row">
      {/* 1. 연봉 */}
      <span className="meta">
        <DollarSign size={16} /> {salaryText}
      </span>

        {/* 2. 근무지역 */}
          {(job.locations ?? []).length > 0 && (
        <span className="meta">
          <MapPin size={16} />{" "}
          {(job.locations || [])
            .map((l) => l.name ?? l.regionName ?? l.regionId)
            .filter(Boolean)
            .join(" / ")}
        </span>
      )}
    
      {/* 3. 근무형태  */}
      <span className="meta">
        <Briefcase size={16} /> {employmentLabel}
      </span>

      {/* 4. 경력 */}
      <span className="meta">
        <Building2 size={16} /> {experienceYearsLabel}
      </span>
      {/* 5. 학력 */}
      <span className="meta">
        <CalendarDays size={16} /> {educationLabel}
      </span>

       {/* 6. 근무시간 (work_schedule) */}
      <span className="meta">
        <Clock size={16} /> {job?.conditions?.work_schedule || "협의"}
      </span>
    </div>
  </div>
</div>


      <div className="detail-body">
        <div className="main-col-full">
          {/* 상세설명 상단에 조회수 뱃지 */}
          {job.description && (
            <section className="card section">
              <div className="view-count-wrapper">
                <div className="view-count">
                  <EyeIcon />
                  <span>조회수 {job.views?.toLocaleString?.() ?? 0}</span>
                </div>
              </div>
              <h2 className="section-title">상세 설명</h2>
              <div
                className="desc-text"
                dangerouslySetInnerHTML={{ __html: safeDescriptionHTML }}
              />
            </section>
          )}

          {/* 추가 정보를 2열 그리드로 배치 */}
          <div className="info-grid">
            <div className="info-left">
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
            </div>

            <div className="info-right">
              {/* 사이드 정보를 오른쪽 컬럼에 */}
              <section className="card section">
                <h2 className="section-title">채용 정보</h2>
                <div className="side-row">
                  <Users size={16} />
                  <span>지원자수</span>
                  <strong>{job.applications?.toLocaleString?.() ?? 0}</strong>
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
                  <a
                    className="link-button"
                    href={job.homepage}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Globe2 size={16} /> 회사 홈페이지
                  </a>
                )}
              </section>
            </div>
          </div>

          {((job.preferences?.length ?? 0) > 0 || !!job.conditions?.etc) && (
            <section className="card section">
              <h2 className="section-title">우대사항</h2>
              <ul className="check-list">
                {job.conditions?.etc && (
                  <li>
                    <CheckCircle2 size={18} />
                    <span>{job.conditions.etc}</span>
                  </li>
                )}
                {(job.preferences || []).map((p, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={18} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

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

          {/* ✅ 항상 본문 끝에 노출되는 넓은 CTA */}
     {(job.categories?.length ?? 0) > 0 && (
  <section className="card section">
    <h2 className="section-title">직무 카테고리</h2>
    <div className="skill-tags">
      {(job.categories || []).map((c, idx) => (
        <span key={idx} className="skill-tag">
          {c.name ||
            c.categoryName ||
            (c.categoryId ? `카테고리 #${c.categoryId}` : "")}
        </span>
      ))}
    </div>
  </section>
)}

{/* ✅ CTA: 본문 맨 끝에 위치 */}
<section className="card section">
  <button className="apply-button wide">지금 지원하기</button>
</section>
        </div>
      </div>
    </div>
  );
};

const EyeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default JobPostingDetail;
