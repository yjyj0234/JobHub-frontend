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
import DOMPurify from "dompurify";

// ✅ (추가) 백엔드/S3 호스트는 컴포넌트 바깥 상수로 선언 (렌더마다 재생성 방지)
const BACKEND_ORIGIN = "http://localhost:8080";
const S3_HOST = "https://myproject-buckets.s3.ap-northeast-2.amazonaws.com";

// ✅ (추가) 상세설명 HTML 안의 <img src>를 절대경로/https로 보정하는 유틸
function rewriteDescriptionHtml(rawHtml) {
  if (!rawHtml) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(String(rawHtml), "text/html");

    doc.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!src) return;

      // 이미 http/https면 그대로 둠
      if (/^https?:\/\//i.test(src)) {
        // nothing
      }
      // /files/... 같은 앱 상대 경로는 백엔드 호스트 붙임
      else if (src.startsWith("/")) {
        img.setAttribute("src", `${BACKEND_ORIGIN}${src}`);
      }
      // s3://bucket/key → https://bucket.s3.region.amazonaws.com/key 로 변환
      else if (src.startsWith("s3://")) {
        const [, , ...rest] = src.split("/"); // ['s3:', '', 'bucket', 'key', ...]
        const key = rest.slice(1).join("/");  // bucket 뒤부터 key
        img.setAttribute("src", `${S3_HOST}/${key}`);
      }

      // 보안/성능 기본 속성
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

  // === API 호출 ===
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
    const unit =
      type === "ANNUAL"
        ? "만원"
        : type === "MONTHLY"
        ? "만원/월"
        : type === "HOURLY"
        ? "원/시"
        : "";
    if (min && max) return `${toKrw(min)} ~ ${toKrw(max)}${unit}`;
    if (min && !max) return `${toKrw(min)}${unit} 이상`;
    if (!min && max) return `${toKrw(max)}${unit} 이하`;
    return "협의";
  };

  // === API 응답 정규화 ===
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
    // ✅ (변경) 로고는 URL이면 <img>로 렌더할 수 있도록 URL을 그대로 둔다
    logo: j.companyLogo ?? j.logo ?? j.company?.logo ?? j.company?.logoUrl,
    locations: j.locations ??
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

  // === 메모(항상 최상위에 위치; 조건부 return보다 위) ===
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

  // ✅ (추가) 상세설명 HTML을 항상 메모로 준비(훅 순서 문제 방지: 조건부 return보다 위)
  const safeDescriptionHTML = useMemo(() => {
    const rewritten = rewriteDescriptionHtml(job?.description || "");
    return DOMPurify.sanitize(rewritten, {
      ADD_TAGS: ["img", "figure", "figcaption"],
      ADD_ATTR: [
        "src",
        "alt",
        "title",
        "width",
        "height",
        "srcset",
        "sizes",
        "loading",
        "referrerpolicy",
      ],
      ADD_DATA_URI_TAGS: ["img"],
    });
  }, [job?.description]);

  // === 조건부 렌더 ===
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
          {/* ✅ (변경) 로고를 <img>로 렌더, 실패 시 이니셜로 폴백 */}
          <div className="company-logo-box large">
            {job.logo ? (
              <img
                src={job.logo}
                alt={`${job.company} 로고`}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
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
            <div className="meta-row">
              {(job.locations ?? []).length > 0 && (
                <span className="meta">
                  <MapPin size={16} />{" "}
                  {(job.locations || [])
                    .map((l) => l.name ?? l.regionName ?? l.regionId)
                    .filter(Boolean)
                    .join(" / ")}
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
          {/* ✅ (변경) 상세설명: HTML 렌더 + 이미지 허용 */}
          {job.description && (
            <section className="card section">
              <h2 className="section-title">상세 설명</h2>
              <div
                className="desc-text"
                dangerouslySetInnerHTML={{ __html: safeDescriptionHTML }}
              />
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

          {/* 우대사항 (조건의 etc도 함께 표시) */}
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
              <a
                className="link-button"
                href={job.homepage}
                target="_blank"
                rel="noreferrer"
              >
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
                    {c.name ||
                      c.categoryName ||
                      (c.categoryId ? `카테고리 #${c.categoryId}` : "")}
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
