// src/pages/Jobposting.jsx
import React, { useState, useRef, useEffect } from "react";
import "../css/Jobposting.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SelectedJobTags from "../Companies/SelectedJobTags.jsx";
import AttachmentUploader from "./AttachmentUploader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
// CKEditor 5 (v42+ 올인원)
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Plugin,                 // ✅ 커스텀 플러그인 베이스
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  BlockQuote,
  FontSize,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  FileRepository        // ✅ 의존성 선언용
} from "ckeditor5";

// 전역 axios
axios.defaults.baseURL = "http://localhost:8080";
const API_AUTH_ME = "/auth/me";

// ✅ "COMPANY" / "ROLE_COMPANY" 모두 허용
const isCompanyRole = (role) => {
  const r = (role ?? "").toString().toUpperCase();
  return r === "COMPANY" || r === "ROLE_COMPANY";
};
//쿠키 포함시킨다
axios.defaults.withCredentials = true;


// datetime-local -> 'YYYY-MM-DDTHH:mm:ss' (타임존 없는 LocalDateTime 문자열)
function toLocalDateTimeString(value) {
  if (!value) return null;
  // value 예: '2025-08-12T09:30'
  return value.length === 16 ? `${value}:00` : value; // 초 없으면 :00 붙임
}


// ===== 커스텀 업로드 어댑터 =====
class UploadAdapter {
  constructor(loader, setAttachments) {
    this.loader = loader;
    this.setAttachments = setAttachments;
  }
  async upload() {
    const file = await this.loader.file;
    const fd = new FormData();
    fd.append("files", file);
    const res = await axios.post("/api/uploads", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true
    });
    const up = (res.data?.files || [])[0];
    if (!up) throw new Error("Upload failed");
    // 첨부 목록 저장(원하면 서버에 함께 전송)
    this.setAttachments(prev => [up, ...prev]);
    // CKEditor가 사용할 표시 URL(프리사인드)
    return { default: up.url };
  }
  abort() {}
}

// ✅ 클래스 플러그인 + requires 로 순서 보장
class CustomUploadAdapterPlugin extends Plugin {
  static get requires() {
    return [ FileRepository ];
  }
  static get pluginName() {
    return "CustomUploadAdapterPlugin";
  }
  init() {
    const editor = this.editor;
    const setAttachments = editor.config.get("jobhubSetAttachments");
    editor.plugins.get("FileRepository").createUploadAdapter = loader =>
      new UploadAdapter(loader, setAttachments);
  }
}

const Jobposting = () => {
  const navigate = useNavigate();

  // ✅ StrictMode(개발 모드) 이중 마운트 대비: 부작용 1회 가드
  const ranAuthCheck = useRef(false);
  const ranFetch = useRef(false);
  const loggedRef = useRef(false);

  //로그인 유저정보
  const {isLoggedIn, user} = useAuth();
  // 직무
  const [isPrimary, setIsPrimary] = useState(true);
  const [jobCategories, setJobCategories] = useState([]);
  const [jobKeywords, setJobKeywords] = useState([]);
  const [selectedJobMid, setSelectedJobMid] = useState("");
  const [selectedJobCode, setSelectedJobCode] = useState("");
  const [selectedJobs, setSelectedJobs] = useState([]);

  // 지역
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [subLocations, setSubLocations] = useState([]);
  const [selectedSubLocation, setSelectedSubLocation] = useState("");

  // 본문/첨부
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const editorRef = useRef(null);
  const uploaderRef = useRef(null);

  //마감 유형이 채용 시 마감(UNTIL_FILLED), 상시채용(CONTINUOUS) 이면 
  // 시작/마감 일시 입력칸 비활성화
  const [closeTypeState, setCloseTypeState] = useState("DEADLINE");
  const isDateDisabled = closeTypeState === "UNTIL_FILLED" || closeTypeState === "CONTINUOUS";
 //력 레벨이 신입(ENTRY) 이면 최소/최대 경력 입력 비활성화 +
 //  제출 시 자동으로 min=0, max=null 처리
  const [experienceLevelState, setExperienceLevelState] = useState("ENTRY");
  const isExperienceDisabled = experienceLevelState === "ENTRY";

  // 급여 유형 상태 추가
  const [salaryType, setSalaryType] = useState("ANNUAL");

  //로그인 유무에 따른 navi
useEffect(()=>{
  // 로그인/권한 체크: 페이지 진입 시 1회만 실행 (StrictMode 중복 차단)
  if (ranAuthCheck.current) return;
  ranAuthCheck.current = true;
  if(!isLoggedIn){
    alert("로그인이 필요합니다.");
    navigate("/", { replace: true });
    return;
  }
  if (!isCompanyRole(user?.role)) {
    alert("기업 회원만 접근할 수 있습니다.");
    navigate("/", { replace: true });
    
  }
   // ✅ 로깅 개선: useEffect에서 API 호출로 최신 정보를 가져와서 로그 출력
    const logAuthInfo = async () => {
      try {
        const res = await axios.get(API_AUTH_ME, { withCredentials: true });
        const serverUser = res.data;
        const role= serverUser?.role ?? user?.role;
        const roleNorm = isCompanyRole(role) ? "COMPANY" : (role ?? "UNKNOWN");

        const authId = serverUser?.id ?? serverUser?.userId ?? serverUser?.email;
        console.log(`[auth] authenticated user (role: ${roleNorm}, id: ${authId}, companyId: ${serverUser?.companyId ?? '(server decides)'})`);
      } catch (err) {
        console.warn("[auth] Failed to fetch user info from API. Using AuthContext user instead.");
        const authId = user?.id ?? user?.userId ?? user?.email;
        const roleNorm = isCompanyRole(user?.role) ? "COMPANY" : (user?.role ?? "UNKNOWN");
        console.log(`[auth] authenticated user (role: ${roleNorm}, id: ${authId}, companyId: ${user?.companyId ?? '(server decides)'})`);      }
    };
    logAuthInfo();
  }, [isLoggedIn, user, navigate]);
//데이터 로딩
useEffect(()=>{
  if(!isLoggedIn || !isCompanyRole(user?.role)){
    return;
  }
  
  let cancelled=false;
  (async () =>{
    try{
      const [catsRes,regsRes]=await Promise.all([
        axios.get("/api/search/job-categories"),
        axios.get("/api/search/regions")
      ]);
      if(cancelled) return;
      const cats= (catsRes.data?.categories || []).map(c => ({ ...c, id: String(c.id) }));
      const regs= (regsRes.data?.regions || []).map(r => ({ ...r, id: String(r.id) }));
      setJobCategories(cats);
      setLocations(regs);
    }catch(err){
      console.error(err);
    }
  })();
  return () => { cancelled=true; };
},[isLoggedIn,user]);


  // 대분류 변경 -> 소분류 로딩
    const handleJobMidChange = async (e) => {
    const parentId = e.target.value;
    setSelectedJobMid(parentId);
    setSelectedJobCode("");
    setJobKeywords([]);
    if (!parentId) return;

    try {
      const res = await axios.get("/api/search/job-categories", { params: { parentId } });
      const list = (res.data?.categories || []).map(c => ({ ...c, id: String(c.id) }));
      setJobKeywords(list);
      setSelectedJobCode(list[0]?.id || "");
    } catch (err) {
      console.error(err);
    }
  };

  // 직무 추가
  const addJob = () => {
    if (!selectedJobMid || !selectedJobCode) return;
    const mainCategory = jobCategories.find(c => c.id === selectedJobMid);
    const subCategory  = jobKeywords.find(k => k.id === selectedJobCode);
    if (!mainCategory || !subCategory) return;

    const newJob = {
      id: `${selectedJobMid}-${selectedJobCode}`,
      mainCategory: mainCategory.name,
      subCategory: subCategory.name,
      mainCategoryId: selectedJobMid,
      subCategoryId: selectedJobCode,
      isPrimary
    };

    setSelectedJobs(prev => {
      if (prev.some(j => j.id === newJob.id)) return prev;
      let next = [...prev, newJob];
      if (newJob.isPrimary) next = next.map(j => ({ ...j, isPrimary: j.id === newJob.id }));
      if (!next.some(j => j.isPrimary)) next = next.map((j, idx) => ({ ...j, isPrimary: idx === 0 }));
      return next;
    });

    if (isPrimary) setIsPrimary(false);
    setSelectedJobMid("");
    setSelectedJobCode("");
    setJobKeywords([]);
  };

  const setPrimaryJob = (jobId) =>
    setSelectedJobs(prev => prev.map(j => ({ ...j, isPrimary: j.id === jobId })));

  const removeJob = (jobId) => {
    setSelectedJobs(prev => {
      const removed = prev.find(j => j.id === jobId);
      let next = prev.filter(j => j.id !== jobId);
      if (removed?.isPrimary && next.length > 0) {
        next = next.map((j, idx) => ({ ...j, isPrimary: idx === 0 }));
      }
      return next;
    });
  };

  // 지역 변경
  const handleLocationChange = (e) => {
    const parentId = e.target.value;
    setSelectedLocation(parentId);
    setSelectedSubLocation("");
    setSubLocations([]);

    if (!parentId) return;
    axios.get("/api/search/regions", { params: { parentId } })
      .then(res => {
        const list = (res.data?.regions || []).map(r => ({ ...r, id: String(r.id) }));
        setSubLocations(list);
        setSelectedSubLocation(list[0]?.id || "");
      })
      .catch(console.error);
  };

  // 제출
// ✅ 교체용: handleSubmit (companyId/createdBy 전혀 사용 안 함)
const handleSubmit = async (e) => {
  e.preventDefault();

  // 1) 권한 체크
  if (!isLoggedIn || !isCompanyRole(user?.role)) {
    alert("로그인이 필요합니다. 또는 기업 회원만 등록할 수 있습니다.");
    return;
  }

  // 2) 대표 직무 보정 및 변환
  let jobs = selectedJobs;
  if (!jobs.some(j => j.isPrimary) && jobs.length > 0) {
    jobs = jobs.map((j, idx) => ({ ...j, isPrimary: idx === 0 }));
  }
  const categories = jobs.map(j => ({
    categoryId: Number(j.subCategoryId),
    isPrimary: !!j.isPrimary
  }));
  const firstPrimaryIdx = jobs.findIndex(j => j.isPrimary === true);
  if (firstPrimaryIdx > -1) {
    jobs = jobs.map((j, i) => ({ ...j, isPrimary: i === firstPrimaryIdx }));
  }

  // 3) 지역
  const regions = {
    sidoId: selectedLocation ? Number(selectedLocation) : null,
    sigunguId: selectedSubLocation ? Number(selectedSubLocation) : null
  };

  // 4) 기본/상태/날짜
  const title = document.getElementById("title")?.value || "";
  const status = document.getElementById("status")?.value || "DRAFT";
  const closeType = closeTypeState;
  const experienceLevel = experienceLevelState;

  const openDate = (closeType === "UNTIL_FILLED" || closeType === "CONTINUOUS")
    ? null
    : toLocalDateTimeString(document.getElementById("open_date")?.value);

  const closeDate = (closeType === "UNTIL_FILLED" || closeType === "CONTINUOUS")
    ? null
    : toLocalDateTimeString(document.getElementById("close_date")?.value);

  // 5) 조건값
  const minExperienceYearsInput = Number(document.getElementById("min_experience_years")?.value || 0);
  const maxExperienceYearsRaw = document.getElementById("max_experience_years")?.value;

  let minSalary = null, maxSalary = null;
  if (salaryType === "MONTHLY" || salaryType === "HOURLY") {
    const salaryAmount = document.getElementById("salary_amount")?.value;
    if (salaryAmount) {
      minSalary = Number(salaryAmount);
      maxSalary = Number(salaryAmount);
    }
  } else {
    const minSalaryRaw = document.getElementById("min_salary")?.value;
    const maxSalaryRaw = document.getElementById("max_salary")?.value;
    minSalary = minSalaryRaw ? Number(minSalaryRaw) : null;
    maxSalary = maxSalaryRaw ? Number(maxSalaryRaw) : null;
  }

  const employmentType = document.getElementById("employment_type")?.value || "FULL_TIME";
  const educationLevel = document.getElementById("education_level")?.value || "ANY";

  const workDaysPerWeekVal = document.getElementById("work_days_per_week")?.value;
  const workStartTimeVal = document.getElementById("work_start_time")?.value;
  const workEndTimeVal = document.getElementById("work_end_time")?.value;
  const isFlexibleChecked = document.getElementById("is_flexible")?.checked || false;

  const workSchedule = [
    workDaysPerWeekVal ? `주 ${Number(workDaysPerWeekVal)}일` : null,
    workStartTimeVal && workEndTimeVal ? `${workStartTimeVal}~${workEndTimeVal}` : null,
    `탄력근무 ${isFlexibleChecked ? "가능" : "불가"}`
  ].filter(Boolean).join(", ");

  const etc = document.getElementById("etc")?.value || "";

  const minExperienceYears = (experienceLevel === "ENTRY") ? 0 : minExperienceYearsInput;
  const maxExperienceYears = (experienceLevel === "ENTRY") ? null : (maxExperienceYearsRaw ? Number(maxExperienceYearsRaw) : null);

  // 6) 서버로 보낼 payload (companyId/createdBy 없음!)
  const payload = {
    title, status, closeType,
    isRemote: document.getElementById("is_remote")?.checked || false,
    openDate, closeDate,
    searchText: title,
    description,
    regions,
    categories,
    conditions: {
      minExperienceYears,
      maxExperienceYears,
      minSalary,
      maxSalary,
      salaryType,
      employmentType,
      experienceLevel,
      educationLevel,
      workSchedule,
      etc
    }
  };

  try {
    const res = await axios.post("/api/postings", payload, { withCredentials: true });
    const newId = res.data?.id ?? res.data;
    alert(`등록 완료! ID=${newId}`);
    // ✅ 홈으로 이동
    navigate("/", { replace: true });
  } catch (err) {
    console.error("[/api/postings] create failed:", err);
    alert("등록 중 오류가 발생했습니다.");
  }
};

  return (
    <div className="jobposting-container large">
      <h2 className="jobposting-title">채용공고 등록</h2>

      <form className="jobposting-form" onSubmit={handleSubmit}>
        {/* 직무 분류 */}
        <fieldset className="form-section">
          <legend>직무 분류</legend>

          <div className="form-group-inline" style={{ gap: "10px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="job_mid_cd">직무 대분류</label>
              <select id="job_mid_cd" value={selectedJobMid} onChange={handleJobMidChange}>
                <option value="">대분류 선택</option>
                {jobCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="job_cd">세부 직무/키워드</label>
              <select
                id="job_cd"
                value={selectedJobCode}
                onChange={(e) => setSelectedJobCode(e.target.value)}
                disabled={!selectedJobMid}
              >
                <option value="">세부 직무 선택</option>
                {jobKeywords.map(k => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: 8 }}>
              <label>
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                />
                &nbsp;이 직무를 대표(주 직무)로 사용
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "10px" }}>
            <button
              type="button"
              onClick={addJob}
              disabled={!selectedJobMid || !selectedJobCode}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              직무 추가
            </button>
          </div>

          <SelectedJobTags
            selectedJobs={selectedJobs}
            onSetPrimary={setPrimaryJob}
            onRemove={removeJob}
          />
        </fieldset>

        {/* 기본 정보 */}
        <fieldset className="form-section">
          <legend>기본 정보</legend>

          <div className="form-group">
            <label htmlFor="title">공고 제목</label>
            <input type="text" id="title" name="title" placeholder="예: 프론트엔드 개발자" />
          </div>

          <div className="form-group">
            <label htmlFor="description">상세 설명</label>

            <CKEditor
              editor={ClassicEditor}
              data={description}
              config={{
                licenseKey: "GPL",
                // ✅ 필요한 플러그인들을 명시적으로 등록
                plugins: [
                  Essentials,
                  Paragraph,
                  Heading,
                  Bold,
                  Italic,
                  Underline,
                  Link,
                  List,
                  BlockQuote,
                  FontSize,
                  Image,
                  ImageCaption,
                  ImageStyle,
                  ImageToolbar,
                  ImageUpload,
                  FileRepository
                ],
                // ✅ 커스텀 업로드 플러그인은 extraPlugins로
                extraPlugins: [ CustomUploadAdapterPlugin ],
                // 커스텀 플러그인에서 쓸 setter를 config로 전달
                jobhubSetAttachments: setAttachments,
                toolbar: [
                  "undo","redo","|",
                  "heading","|",
                  "bold","italic","underline","|",
                  "fontSize","|",
                  "link","|",
                  "bulletedList","numberedList","blockQuote","|",
                  "uploadImage"
                ],
                fontSize: {
                  options: [10, 12, 14, 16, 18, 24, 32, "default"]
                },
                image: {
                  toolbar: [
                    "imageTextAlternative","|",
                    "imageStyle:inline","imageStyle:block","imageStyle:side"
                  ]
                }
              }}
              onReady={(editor) => { editorRef.current = editor; }}
              onChange={(_, editor) => setDescription(editor.getData())}
              onError={(e) => console.error("CKEditor error:", e)}
            />

            {/* (선택) 첨부 목록/추가 업로더 – 본문 삽입은 CKEditor에서 처리 */}
            <div style={{ marginTop: 12 }}>
              <AttachmentUploader
                ref={uploaderRef}
                value={attachments}
                onChange={setAttachments}
                uploadUrl="/api/uploads"
                maxSizeMB={20}
                autoInsertSingle={false}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
              />
            </div>
          </div>

          {/* 근무 지역 */}
          <div className="form-group">
            <label>근무 지역</label>
            <div className="form-group-inline" style={{ gap: 10 }}>
              <select
                value={selectedLocation}
                onChange={handleLocationChange}
                style={{ flex: 1 }}
              >
                <option value="">시/도 선택</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>

              <select
                value={selectedSubLocation}
                onChange={(e) => setSelectedSubLocation(e.target.value)}
                disabled={!selectedLocation}
                style={{ flex: 1 }}
              >
                <option value="">시/군/구 선택</option>
                {subLocations.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="is_remote">
              <input type="checkbox" id="is_remote" name="is_remote" /> 재택근무 가능
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="status">공고 상태</label>
            <select id="status" name="status" defaultValue="DRAFT">
              <option value="DRAFT">임시저장</option>
              <option value="OPEN">공개</option>
              <option value="CLOSED">마감</option>
              <option value="EXPIRED">만료</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="close_type">마감 유형</label>
            <select id="close_type" name="close_type" value={closeTypeState}
            onChange={(e)=>setCloseTypeState(e.target.value)}>
              <option value="DEADLINE">마감일</option>
              <option value="UNTIL_FILLED">채용 시 마감</option>
              <option value="CONTINUOUS">상시채용</option>
              <option value="PERIODIC">정기채용</option>
            </select>
          </div>

          <div className="form-group-inline">
            <div className="form-group">
               <label htmlFor="open_date">공고 시작일시</label>
              <input type="datetime-local" id="open_date" name="open_date"
                disabled={isDateDisabled}/>
            </div>
            <div className="form-group">
              <label htmlFor="close_date">공고 마감일시</label>
              <input type="datetime-local" id="close_date" name="close_date"
                disabled={isDateDisabled}/>
            </div>
          </div>
        </fieldset>

        {/* 채용 조건 */}
       <fieldset className="form-section">
          <legend>채용 조건</legend>
          
        <div className="form-group">
          <label htmlFor="education_level">학력</label>
          <select id="education_level" name="education_level" defaultValue="ANY">
            <option value="ANY">무관</option>
            <option value="HIGH_SCHOOL">고졸</option>
            <option value="UNIVERSITY">대졸</option>
            <option value="COLLEGE">전문대졸</option>
            <option value="MASTER">석사</option>
            <option value="PHD">박사</option>
          </select>
        </div>

          {/* 경력 레벨 - 맨 위 */}
          <div className="form-group">
            <label htmlFor="experience_level">경력 레벨</label>
            <select
              id="experience_level"
              name="experience_level"
              value={experienceLevelState}
              onChange={(e) => setExperienceLevelState(e.target.value)}
            >
              <option value="ENTRY">신입</option>
              <option value="JUNIOR">주니어</option>
              <option value="MID">미드</option>
              <option value="SENIOR">시니어</option>
              <option value="LEAD">리드</option>
              <option value="EXECUTIVE">임원</option>
            </select>
          </div>

        {/* 신입이면 비활성화 */}
        <div className="form-group-inline">
          <div className="form-group">
            <label htmlFor="min_experience_years">최소 경력 (년)</label>
            <input
              type="number"
              id="min_experience_years"
              name="min_experience_years"
              min="0"
              disabled={isExperienceDisabled}
            />
          </div>
          <div className="form-group">
            <label htmlFor="max_experience_years">최대 경력 (년)</label>
            <input
              type="number"
              id="max_experience_years"
              name="max_experience_years"
              min="0"
              disabled={isExperienceDisabled}
            />
          </div>
        </div>

        {/* 급여 유형 선택 */}
         <div className="form-group">
          <label htmlFor="salary_type">급여 유형</label>
          <select 
            id="salary_type" 
            name="salary_type" 
            value={salaryType}
            onChange={(e) => setSalaryType(e.target.value)}
          >
            <option value="ANNUAL">연봉</option>
            <option value="MONTHLY">월급</option>
            <option value="HOURLY">시급</option>
            <option value="NEGOTIABLE">협의</option>
            <option value="UNDISCLOSED">비공개</option>
          </select>
        </div>

        {salaryType === "MONTHLY" || salaryType === "HOURLY" ? (
          <div className="form-group">
            <label htmlFor="salary_amount">
              {salaryType === "MONTHLY" ? "월급 (만원)" : "시급 (원)"}
            </label>
            <input type="number" id="salary_amount" name="salary_amount" min="0" />
          </div>
        ) : (
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="min_salary">최소 연봉 (만원)</label>
              <input type="number" id="min_salary" name="min_salary" min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="max_salary">최대 연봉 (만원)</label>
              <input type="number" id="max_salary" name="max_salary" min="0" />
            </div>
          </div>
        )}

       

        <div className="form-group">
          <label htmlFor="employment_type">고용 형태</label>
          <select id="employment_type" name="employment_type" defaultValue="FULL_TIME">
            <option value="FULL_TIME">정규직</option>
            <option value="PART_TIME">파트타임</option>
            <option value="CONTRACT">계약직</option>
            <option value="INTERN">인턴</option>
            <option value="FREELANCE">프리랜서</option>
          </select>
        </div>

        <div className="form-group">
          <label>근무 형태/스케줄</label>
          <div className="form-group-inline">
				<div className="form-group" style={{ minWidth: 120 }}>
					<label htmlFor="work_days_per_week">근무일수</label>
					<div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
						<span>주</span>
						<input type="number" id="work_days_per_week" name="work_days_per_week" min="1" max="7" placeholder="예: 5" style={{ width: 64 }} />
						<span>일</span>
					</div>
				</div>&nbsp;
            <div className="form-group" style={{ minWidth: 160 }}>
              <label htmlFor="work_start_time">시작 시간</label>
              <input type="time" id="work_start_time" name="work_start_time" />
            </div>
            <div className="form-group" style={{ minWidth: 160 }}>
              <label htmlFor="work_end_time">종료 시간</label>
              <input type="time" id="work_end_time" name="work_end_time" />
            </div>
            
          </div>
          <div className="form-group" >
              <label htmlFor="is_flexible">
                <input type="checkbox" id="is_flexible" name="is_flexible" /> 탄력근무 가능
              </label>
            </div>
        </div>

        <div className="form-group">
          <label htmlFor="etc">우대사항</label>
          <input type="text" id="etc" name="etc" placeholder="예: 관련 자격증, 외국어 능력 등" />
        </div>
      </fieldset>

        <button type="submit" className="cta-button large">등록하기</button>
      </form>
    </div>
  );
};

export default Jobposting;
