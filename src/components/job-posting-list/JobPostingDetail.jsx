import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Building,
  CalendarDays,
  DollarSign,
  Star,
  Users,
  Globe,
  CheckCircle2,
  Clock,
} from "lucide-react";
import "../css/JobPostingList.css";
import "../css/JobPostingDetail.css";
import DOMPurify from "dompurify";
import { useAuth } from "../context/AuthContext";

/** =========================
 *  ✅ D-day 계산 유틸 (컴포넌트 밖)
 *  - DEADLINE, PERIODIC 둘 다 D-day/마감 처리
 *  - "YYYY-MM-DD HH:mm:ss" 같은 포맷도 정확히 파싱
 *  - 마감 '시각'을 지나면 즉시 마감
 *  ========================= */
const COUNTDOWN_TYPES = new Set(["DEADLINE", "PERIODIC"]);
function parseClose(v) {
  if (!v) return null;
  if (typeof v === "string" && v.indexOf("T") === -1) {
    const d = new Date(v.replace(" ", "T"));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** D-day/마감여부 계산
 *  반환: { daysLeft, deadlineBadge, isDeadlineClosed }
 *   - isDeadlineClosed: 마감시각(now >= close) 지나면 true
 *   - deadlineBadge: "D-DAY" 또는 "D-n"(n<=14) 혹은 ""
 */
function getDeadlineInfo(j) {
  if (!j || !COUNTDOWN_TYPES.has(j.closeType)) {
    return { daysLeft: null, deadlineBadge: "", isDeadlineClosed: false };
  }
  const close = parseClose(j.closeDate);
  if (!close) {
    return { daysLeft: null, deadlineBadge: "", isDeadlineClosed: false };
  }

  const now = new Date();

  // ⬇️ 마감 '시각'을 지나면 즉시 마감 처리
  if (now.getTime() >= close.getTime()) {
    return { daysLeft: -1, deadlineBadge: "", isDeadlineClosed: true };
  }

  // ⬇️ D는 '날짜' 기준: 마감일 당일이면 D-DAY
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(close.getFullYear(), close.getMonth(), close.getDate());
  const diffMs = deadlineDay - today;
  const daysLeft = Math.floor(diffMs / 86400000);

  let deadlineBadge = "";
  if (daysLeft === 0) {
    deadlineBadge = "D-DAY";
  }  else if (daysLeft > 0 && daysLeft <= 14) deadlineBadge = `D-${daysLeft}`;
  return { daysLeft, deadlineBadge, isDeadlineClosed: false };
}
function formatDateTime(v) {
  const d = parseClose(v);
  if (!d) return "-";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

/** 백엔드 Origin (프리사인/프록시 뷰어 등에서 사용) */
const BACKEND_ORIGIN = "";

/** 다양한 형태의 이미지 src를 실제 뷰어 URL로 정규화 */
function toViewerUrlFromAny(src) {
  if (!src) return src;

  // 이미 백엔드 뷰어 경로면 절대주소로 변환
  if (/^\/?api\/files\/view\?/.test(src)) {
    return `${BACKEND_ORIGIN}${src.startsWith("/") ? src : `/${src}`}`;
  }

  // s3 도메인 → 뷰어 프록시로
  try {
    const u = new URL(src);
    if (/s3[.-].*amazonaws\.com$/i.test(u.host)) {
      const key = u.pathname.replace(/^\/+/, "");
      return `${BACKEND_ORIGIN}/api/files/view?key=${encodeURIComponent(key)}`;
    }
  } catch {}

  // 버킷 키 형태 → 뷰어 프록시
  if (/^(?:public|private)\//i.test(src)) {
    return `${BACKEND_ORIGIN}/api/files/view?key=${encodeURIComponent(src)}`;
  }

  // s3:// 버킷 키 → 뷰어 프록시
  if (src.startsWith("s3://")) {
    const parts = src.split("/");
    const key = parts.slice(3).join("/");
    return `${BACKEND_ORIGIN}/api/files/view?key=${encodeURIComponent(key)}`;
  }

  // 서버 상대경로 → 절대경로
  if (src.startsWith("/")) {
    return `${BACKEND_ORIGIN}${src}`;
  }

  // 그 외(절대 URL 등) 그대로
  return src;
}

/** 상세설명 HTML 안의 <img> src를 안전/지연로딩 속성으로 교체 */
function rewriteDescriptionHtml(rawHtml) {
  if (!rawHtml) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(String(rawHtml), "text/html");
    doc.querySelectorAll("img").forEach((img) => {
      const original = img.getAttribute("src") || "";
      const fixed = toViewerUrlFromAny(original);
      if (fixed) img.setAttribute("src", fixed);
      //img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");   // 추가하면 렌더 안정화에 도움
      img.setAttribute("referrerpolicy", "no-referrer");
      img.removeAttribute("onerror");
      img.removeAttribute("onload");
    });
    return doc.body.innerHTML;
  } catch {
    // 파싱 실패 시 원문 그대로 반환
    return String(rawHtml);
  }
}

const JobPostingDetail = ({ onLoginClick }) => {
  const { id } = useParams();
  const { isAuthed, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false); // 회사 소유자 여부
  // 동일 id로 중복 fetch 방지
  const didFetchRef = useRef({ lastId: null, done: false });
  const navigate = useNavigate();
  /** 상세 데이터 로드 */
  useEffect(() => {
    const fetchJobDetail = async () => {
      // id 바뀌면 플래그 리셋
      if (didFetchRef.current.lastId !== id) {
        didFetchRef.current = { lastId: id, done: false };
      }
      if (didFetchRef.current.done) return;
      didFetchRef.current.done = true;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/jobs/${id}?_=${Date.now()}`, {
          credentials: "include",
          headers: { Accept: "application/json", "Cache-Control": "no-cache"},
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
        }
        const data = await res.json();
        
        console.log("[DEBUG] API Response:", data);
        
        const mappedJob = mapApiJobToUi(data);
        
        console.log("[DEBUG] Mapped Job:", mappedJob);
        console.log("[DEBUG] Company Owner ID:", mappedJob.companyOwnerId);
        
        setJob(mappedJob);
        
        // 🔥 더 자세한 디버깅 로그 추가
        console.log("[DEBUG] User Info:", user);
        console.log("[DEBUG] Is Authenticated:", isAuthed);
        console.log("[DEBUG] User Role:", user?.role);
        console.log("[DEBUG] User ID:", user?.id);
        
        // 회사 소유자 여부 확인
        if (isAuthed && user?.role === "COMPANY" && mappedJob.companyOwnerId) {
          // 🔥 타입 변환으로 비교 (숫자 vs 문자열 문제 해결)
          const userId = Number(user.id);
          const ownerId = Number(mappedJob.companyOwnerId);
          const isOwnerCheck = userId === ownerId;
          
          console.log("[DEBUG] === 소유자 확인 ===");
          console.log("[DEBUG] User ID (original):", user.id, "Type:", typeof user.id);
          console.log("[DEBUG] User ID (converted):", userId, "Type:", typeof userId);
          console.log("[DEBUG] Owner ID (original):", mappedJob.companyOwnerId, "Type:", typeof mappedJob.companyOwnerId);
          console.log("[DEBUG] Owner ID (converted):", ownerId, "Type:", typeof ownerId);
          console.log("[DEBUG] Is Owner Check:", isOwnerCheck);
          console.log("[DEBUG] === 소유자 확인 끝 ===");
          
          setIsOwner(isOwnerCheck);
        } else {
          console.log("[DEBUG] 소유자 확인 조건 불만족:");
          console.log("  - isAuthed:", isAuthed);
          console.log("  - user.role === 'COMPANY':", user?.role === "COMPANY");
          console.log("  - mappedJob.companyOwnerId exists:", !!mappedJob.companyOwnerId);
          setIsOwner(false);
        }
      } catch (e) {
        console.error("[JobDetail] fetch error:", e);
        setError("상세 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchJobDetail();
  }, [id, isAuthed, user]);

  /** 즐겨찾기 */
  const [fav, setFav] = useState(false);
  useEffect(() => {
    try {
      setFav(localStorage.getItem(`fav_job_${id}`) === "1");
    } catch {}
  }, [id]);

   /** ⏱️ 실시간 카운트다운을 위한 now 타임스탬프 (1초마다 갱신) */
  const [nowTs, setNowTs] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /** 마감 타입 라벨 */
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

  /** 고용형태 라벨 */
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

  /** 학력 라벨 */
  const mapEducationLevel = (e) => {
    switch (e) {
      case "ANY":
        return "학력무관";
      case "HIGH_SCHOOL":
        return "고졸";
      case "COLLEGE":
        return "전문대졸(2년제)";
      case "UNIVERSITY":
        return "대졸(4년제)";
      case "MASTER":
        return "석사";
      case "PHD":
        return "박사";
      default:
        return e || "";
    }
  };

  /** 경력 레벨 라벨 */
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
        return "리드급";
      case "EXECUTIVE":
        return "임원";
      default:
        return x || "";
    }
  };

  /** 급여 범위 포맷팅 */
  const formatSalaryRange = (min, max, rawType) => {
    const type = (rawType || "").toUpperCase();
    if (type === "NEGOTIABLE" || type === "UNDISCLOSED") return "협의 후 결정";

    const prefix =
      type === "ANNUAL"
        ? "연봉 "
        : type === "MONTHLY"
        ? "월급 "
        : type === "HOURLY"
        ? "시급 "
        : "";

    const unit =
      type === "ANNUAL"
        ? "만원"
        : type === "MONTHLY"
        ? "만원"
        : type === "HOURLY"
        ? "원"
        : "";

    const toKrw = (n) =>
      typeof n === "number" && !Number.isNaN(n) ? n.toLocaleString() : "";

    if (min && max) return `${prefix}${toKrw(min)} ~ ${toKrw(max)}${unit}`;
    if (min && !max) return `${prefix}${toKrw(min)}${unit} 이상`;
    if (!min && max) return `${prefix}${toKrw(max)}${unit} 이하`;
    return "협의 후 결정";
  };

  /** conditions 중첩 객체 정규화 (snake/camel 혼재 호환) */
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

  /** 카테고리 정규화 */
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

  /**
   * 지역 정규화
   * - 백엔드가 합성된 전체 이름("서울특별시 강남구")을 locations[0].name으로 내려옴
   * - 단일 표시 정책에 맞춰 첫 항목만 사용
   */
 const normalizeLocations = (j) => {
  const src = j?.locations ?? [];
  if (!Array.isArray(src) || src.length === 0) return []; // 빈 배열 유지
  if (src.every(v => typeof v === "string")) {
    const first = (src[0] || "").trim();
    return first ? [{ name: first, isPrimary: true }] : [];
  }
  const o = src[0] || {};
  const name = (o?.name || "").trim();
  return name ? [{ name, isPrimary: !!o?.isPrimary }] : [];
};

  /** API 응답 → UI 모델 매핑 */
  const mapApiJobToUi = (j) => {
    return {
      id: j.id,
      title: j.title,
      company: j.companyName ?? j.company_name ?? j.company?.name ?? j.company,
      logo: j.companyLogo ?? j.logo ?? j.company?.logo ?? j.company?.logoUrl,
      companyId: j.companyId,
      companyOwnerId: j.companyOwnerId, // 이제 백엔드에서 제대로 전달됨
      locations: normalizeLocations(j),
      categories: normalizeCategories(j),
      conditions: normalizeConditions(j.conditions),
      closeType: j.closeType ?? j.close_type,
      closeDate: j.closeDate ?? j.close_date,
      openDate: j.openDate ?? j.open_date,
      skills: j.skills ?? [],
      views: j.viewCount ?? j.view_count ?? 0,
      applications: j.applicationCount ?? j.application_count ?? 0,
      description: j.description ?? j.desc ?? "",
      responsibilities: j.responsibilities ?? [],
      qualifications: j.qualifications ?? [],
      preferences: j.preferences ?? [],
      benefits: j.benefits ?? [],
      homepage:
        j.homepage ?? j.companyHomepage ?? j.company_homepage ?? j.company?.homepage ?? "",
      isRemote: j.isRemote === true || j.is_remote === 1,
      status: j.status ?? j.jobStatus ?? j.state,
    };
  };

  /** 마감 라벨 계산 */
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

  // YYYY-MM-DD 포맷 (표시용)
const closeDateStr = useMemo(() => {
  if (!job?.closeDate) return "";
  const d = new Date(job.closeDate);
  // 로컬 날짜 기준 YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}, [job?.closeDate]);


   const locationText = useMemo(() => {
   const first = job?.locations?.[0];
  const name = (first?.name ?? "").trim();
  // 지역이 등록 안 되어있으면 "지역 미등록"
  if (!name) return "지역 미등록";
  return job?.isRemote ? `${name} (재택근무 가능)` : name;
}, [job]);


  /** 경력년수 라벨(명시적 범위/이상/이하 우선) */
  const experienceYearsLabel = useMemo(() => {
    const min = job?.conditions?.min_experience_years;
    const max = job?.conditions?.max_experience_years;
    if (min === 0 && (max === 0 || max == null)) return "신입";
    if (min != null && max != null) return `경력 ${min}~${max}년`;
    if (min != null && max == null) return `경력 ${min}년 이상`;
    if (min == null && max != null) return `경력 ${max}년 이하`;
    return experienceLevelLabel || "";
  }, [job, experienceLevelLabel]);

  /** 급여 라벨 */
  const salaryText = useMemo(
    () =>
      formatSalaryRange(
        job?.conditions?.min_salary,
        job?.conditions?.max_salary,
        job?.conditions?.salary_type
      ),
    [job]
  );

  /** 상세설명 HTML을 안전하게 표출 */
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
// ⬇️ 기존 computeDaysLeft/deadlineBadge 대신 이걸 사용
 const { daysLeft, deadlineBadge, isDeadlineClosed } = useMemo(
    () => getDeadlineInfo(job, nowTs),
    [job, nowTs]
  );
 /** ✅ 시작일/마감일 문자열 + 실시간 남은 시간(H/M/S) */
  const openDateStr = useMemo(() => formatDateTime(job?.openDate), [job?.openDate]);
  const closeDateTimeStr = useMemo(
    () => formatDateTime(job?.closeDate),
    [job?.closeDate]
  );
  const timeLeftText = useMemo(() => {
    const close = parseClose(job?.closeDate);
    if (!close) return "-";
    const now = new Date(nowTs);
    const diff = close.getTime() - now.getTime();
    if (diff <= 0) return "마감";
    const hh = Math.floor(diff / 3600000);
    const mm = Math.floor((diff % 3600000) / 60000);
    const ss = Math.floor((diff % 60000) / 1000);
    return `${hh}시간 ${String(mm).padStart(2, "0")}분 ${String(ss).padStart(
      2,
      "0"
    )}초`;
  }, [job?.closeDate, nowTs]);

  /** 로딩 Skeleton */
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

  /** 에러 표시 */
  if (error) {
    return <p className="error-text">상세 정보를 불러오지 못했습니다.</p>;
  }
  if (!job) return null;




// ⬇️ 기존 isClosed 계산에 반영
const isClosedByStatus = (() => {
  const s = (job?.status ?? "").toString().toUpperCase();
  return s === "CLOSED" || s === "EXPIRED";
})();

const isClosed = isClosedByStatus || isDeadlineClosed;
// 마감 콜아웃 표시 조건 (DEADLINE이고, 남은 날이 0~14)


  /** 즐겨찾기 토글 */
  const toggleFav = () => {
    const next = !fav;
    setFav(next);
    try {
      localStorage.setItem(`fav_job_${id}`, next ? "1" : "0");
    } catch {}
  };

  // 지원하기 버튼 눌렀을때 상황별 
  const handleApplyClick = () => {
    //로그인 안된 경우
    if (!isAuthed) {
      alert("로그인이 필요합니다.");
      //전역 이벤트(openLoginModal)
      window.dispatchEvent(new CustomEvent('openLoginModal'));
      return;
    }
    // 로그인 했지만 다른 회사인 경우
    if (user?.role === "COMPANY") {
      if (!isOwner) {
        alert("해당 공고문을 올린 회사가 아닙니다.");
        return;
      }
      handleJobClose();
    } else {
      handleJobApply();
    }
  };

  const handleJobApply = () => {
    navigate(`/apply/${job.id}`);
    // TODO: 실제 지원 API 호출
  };
// 공고를 올린 회사로 로그인
  const handleJobClose = () => {
    if (window.confirm("정말로 이 채용공고를 마감하시겠습니까?")) {
      console.log("마감하기 클릭");
      // TODO: 실제 마감 API 호출
    }
  };

  const getButtonText = () => {
    if (user?.role === "COMPANY") {
      return isOwner ? "마감하기" : "권한 없음";
    }
    return "지원하기";
  };

  const getWideButtonText = () => {
    if (user?.role === "COMPANY") {
      return isOwner ? "지금 마감하기" : "권한이 없습니다";
    }
    return "지금 지원하기";
  };

  const isButtonDisabled = () => {
    if (isClosed) return true;
    if (user?.role === "COMPANY" && !isOwner) return true;
    return false;
  };

  const getButtonTitle = () => {
    if (isClosed) return "마감된 공고입니다.";
    if (user?.role === "COMPANY" && !isOwner) return "해당 공고문을 올린 회사가 아닙니다.";
    return undefined;
  };

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
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  (job.company?.[0] ?? "").toUpperCase()
                )}
              </div>

              <div className="title-area">
                <div className="title-head">
                  <h1 className="job-title">{job.title}</h1>
                  {isClosed && <span className="title-closed">마감된 공고입니다.</span>}
                </div>
                <div className="company-line">
                 <Link 
  to={`/companies/${job.companyId}`} 
  className="company-name company-link"
  onClick={(e) => e.stopPropagation()}
>
  {job.company}
</Link>
                  {closeLabel && <span className="deadline-badge">{closeLabel}</span>}
                </div>
              </div>
            </div>

            {/* 오른쪽 지원 버튼/즐겨찾기 */}
            <div className="title-cta">
              <button
                type="button"
                className="fav-toggle"
                aria-pressed={fav}
                data-active={fav ? "true" : "false"}
                onClick={toggleFav}
                title={fav ? "즐겨찾기 해제" : "즐겨찾기"}
              >
                <Star />
              </button>
              <button
                className="apply-button"
                data-deadline={deadlineBadge}
                disabled={isButtonDisabled()}
                aria-disabled={isButtonDisabled()}
                onClick={handleApplyClick}
                title={getButtonTitle()}
              >
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>

        {/* === 메타 박스 (연봉/지역/형태/경력/학력/근무시간) === */}
        <div className="meta-wrapper">
          <div className="meta-row">
            {/* 1. 급여 */}
            <span className="meta">
              <DollarSign size={16} /> {salaryText}
            </span>

            {/* 2. 지역 (라벨 없이 지역명만) */}
            {locationText && (
              <span className="meta">
                <MapPin size={16} /> {locationText}
              </span>
            )}

            {/* 3. 근무형태 */}
            <span className="meta">
              <Briefcase size={16} /> {employmentLabel}
            </span>

            {/* 4. 경력 */}
            <span className="meta">
              <Building size={16} /> {experienceYearsLabel}
            </span>

            {/* 5. 학력 */}
            <span className="meta">
              <CalendarDays size={16} /> {educationLabel}
            </span>

            {/* 6. 근무시간 */}
            <span className="meta">
              <Clock size={16} /> {job?.conditions?.work_schedule || "협의"}
            </span>
          </div>
        </div>
      </div>

      {/* === 본문 === */}
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
              <hr />
              <div
                className="desc-text"
                dangerouslySetInnerHTML={{ __html: safeDescriptionHTML }}
              />
            </section>
          )}

          {/* 추가 정보를 2열로 */}
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
              {/* 사이드 정보 */}
              <section className="card section">
                <h2 className="section-title">기타 및 우대사항</h2>
                <div className="side-row" style={{ borderBottom: 0, paddingTop: 0 }}>
                  <CheckCircle2 size={16} />
                  <span style={{ gridColumn: "2 / span 2" }}>
                    {job?.conditions?.etc || "등록된 내용이 없습니다."}
                  </span>
                </div>
                
                {job.homepage && (
                  <a
                    className="link-button"
                    href={job.homepage}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Globe size={16} /> 회사 홈페이지
                  </a>
                )}
              </section>
            </div>
          </div>

          {/* 직무 카테고리 */}
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

          {/* CTA */}

<section className="card section">
  <div className="cta-row">
    {/* 좌측: 날짜 + 버튼 */}
    <div className="cta-tile cta-tile-left">
          <div className="cta-dates">
        <div className="field-row">
        <span className="field-chip field-chip-info">시작일</span>
        <span className="field-value">{openDateStr}</span>
      </div>
      <div className="field-row">
        <span className="field-chip field-chip-danger">마감일</span>
        <span className="field-value">{closeDateTimeStr}</span>
        </div>
       <div className="field-row time-left-row">
      <span className="field-value time-left">남은시간</span>
      <span className="field-value time-left" data-closed={isClosed ? "1" : "0"}>
        {COUNTDOWN_TYPES.has(job.closeType) ? timeLeftText : "-"}
      </span>
        </div>
      </div>

      <button
        className="apply-button wide"
        disabled={isButtonDisabled()}
        title={getButtonTitle()}
        onClick={handleApplyClick} 
      >
        {getWideButtonText()}
      </button>
    </div>

    {/* 우측: 지원자수 */}
    <div className="cta-tile cta-tile-stats" aria-label="지원자 수">
      <div className="stats-title">지원자 수</div>
      <div className="stats-line">
        <span className="stats-number">
          {job.applications?.toLocaleString?.() ?? 0}
        </span>
        <span className="stats-unit">명</span>
      </div>
    </div>
  </div>
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
