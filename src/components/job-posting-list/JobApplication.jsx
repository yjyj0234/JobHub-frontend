import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin, Briefcase, Building2, CalendarDays, DollarSign, Star, Users, CheckCircle2, Upload as UploadIcon, Eye
} from "lucide-react";
import "../css/JobApplication.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

function prettyDate(s) {
  if (!s) return "";
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toISOString().slice(0,10);
  } catch { return s; }
}

function ddays(closeType, closeDate) {
  if (!closeDate || closeType === "UNTIL_FILLED" || closeType === "CONTINUOUS") return null;
  const end = new Date(closeDate);
  const diff = Math.ceil((end.getTime() - Date.now()) / (1000*60*60*24));
  return diff;
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
  const [savedResume, setSavedResume] = useState(null);   // { id, fileName, size, url, updatedAt } 가정
  const [useSavedResume, setUseSavedResume] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  // 채용공고 및 유저간단정보 로드
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 공고 요약
        const r1 = await fetch(`http://localhost:8080/api/jobs/${jobId}`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!r1.ok) throw new Error(`HTTP ${r1.status}`);
        const jobPayload = await r1.json();

        // (선택) 프로필 자동채움
        let userPayload = {};
        try {
          const r2 = await fetch("http://localhost:8080/auth/me", {
            credentials: "include",
            headers: { Accept: "application/json" },
          });
          if (r2.ok) userPayload = await r2.json();
        } catch {}

        setJob(jobPayload);
        setForm((prev) => ({
          ...prev,
          name: userPayload?.name ?? prev.name,
          email: userPayload?.email ?? prev.email,
          phone: userPayload?.phone ?? prev.phone,
        }));
      } catch (e) {
        console.error(e);
        setError("입사지원 페이지를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  const dday = useMemo(() => ddays(job?.closeType, job?.closeDate), [job]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onDrop = (fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setResumeError("PDF, DOC, DOCX만 업로드 가능합니다.");
      setResumeFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setResumeError("최대 10MB까지 업로드 가능합니다.");
      setResumeFile(null);
      return;
    }
    setResumeError("");
    setResumeFile(file);
  };

  const handleFileChange = (e) => onDrop(e.target.files);

  const onDropZone = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.files?.length) onDrop(e.dataTransfer.files);
  };

  const isValid = useMemo(() => {
    return (
      form.name.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      resumeFile &&
      form.agree
    );
  }, [form, resumeFile]);

  const handleSubmit = async () => {
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
      fd.append("resume", resumeFile);

      const res = await fetch("http://localhost:8080/api/applications", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      // 성공 후 완료 페이지/모달/토스트 처리
      alert("지원이 완료되었습니다.");
      navigate(`/jobpostinglist/${jobId}`); // 또는 /applications/complete?savedId=...
    } catch (e) {
      console.error(e);
      alert("지원 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/applications/draft", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, ...form, hasResume: !!resumeFile }),
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
          <section className="apply-card">
            <h2 className="apply-card-title">지원자 정보</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>이름 <span className="req">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="홍길동" />
              </div>
              <div className="form-field">
                <label>이메일 <span className="req">*</span></label>
                <input name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
              </div>
              <div className="form-field">
                <label>연락처 <span className="req">*</span></label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="010-0000-0000" />
              </div>
            </div>
          </section>

          {/* 섹션: 이력서/파일 업로드 */}
          <section className="apply-card">
        <h2 className="apply-card-title">이력서 <span className="muted">(PDF, DOC, DOCX / 10MB)</span></h2>

          {/* 저장된 이력서 선택 */}
          <div className="resume-select">
            <label className="resume-option">
              <input
                type="radio"
                name="resumeSource"
                checked={!!savedResume && useSavedResume}
                onChange={() => savedResume && setUseSavedResume(true)}
               disabled={!savedResume}
              />
              <div className="resume-existing">
                <div className="resume-existing-title">저장된 이력서 사용</div>
                {savedResume ? (
                  <div className="resume-existing-meta">
                    <span className="file-chip">
                      {savedResume.fileName}
                      {typeof savedResume.size === "number" && (
                        <span className="file-size">({(savedResume.size/1024/1024).toFixed(1)}MB)</span>
                      )}
                    </span>
                    <div className="resume-existing-sub">
                      최근 업데이트: {prettyDate(savedResume.updatedAt) || "-"}
                      {savedResume.url && (
                        <> · <a className="link" href={savedResume.url} target="_blank" rel="noreferrer">미리보기</a></>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="resume-existing-empty muted">저장된 이력서가 없습니다.</div>
                )}
              </div>
            </label>

            {/* 새 파일 업로드 */}
            <label className="resume-option">
              <input
                type="radio"
                name="resumeSource"
                checked={!useSavedResume}
                onChange={() => setUseSavedResume(false)}
              />
              <div className="resume-upload">
                <div
                  className={`dropzone ${useSavedResume ? "disabled" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e)=>{ if(!useSavedResume) onDropZone(e); }}
                  aria-disabled={useSavedResume ? "true" : "false"}
                >
                  <UploadIcon size={24} />
                  <p className="dz-title">파일을 드래그하여 업로드</p>
                  <p className="dz-sub">또는 <label className="dz-browse">찾아보기<input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" hidden/></label></p>
                  {!useSavedResume && resumeFile && (
                    <div className="file-chip">{resumeFile.name} <span className="file-size">({(resumeFile.size/1024/1024).toFixed(1)}MB)</span></div>
                  )}
                  {!useSavedResume && resumeError && <p className="error-text small">{resumeError}</p>}
                 {useSavedResume && <p className="muted" style={{marginTop:8}}>상단 “저장된 이력서 사용”이 선택되어 있습니다.</p>}
                </div>
              </div>
            </label>
          </div>
          </section>

          {/* 섹션: 링크/추가 정보 */}
          <section className="apply-card">
            <h2 className="apply-card-title">링크 & 추가정보</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>GitHub</label>
                <input name="linkGithub" value={form.linkGithub} onChange={handleChange} placeholder="https://github.com/username" />
              </div>
              <div className="form-field">
                <label>LinkedIn</label>
                <input name="linkLinkedIn" value={form.linkLinkedIn} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
              </div>
              <div className="form-field">
                <label>포트폴리오</label>
                <input name="linkPortfolio" value={form.linkPortfolio} onChange={handleChange} placeholder="https://your.site" />
              </div>
              <div className="form-field">
                <label>희망연봉</label>
                <input name="expectedSalary" value={form.expectedSalary} onChange={handleChange} placeholder="예: 4,500만원" />
              </div>
              <div className="form-field">
                <label>입사 가능일</label>
                <input type="date" name="availableFrom" value={form.availableFrom} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* 동의 */}
          <section className="apply-card">
            <label className="agree-line">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
              <span>개인정보 수집 및 이용에 동의합니다. <Link to="#" onClick={(e)=>e.preventDefault()} className="link">전문 보기</Link></span>
            </label>
          </section>

          

          {preview && (
            <section className="apply-card preview">
              <h2 className="apply-card-title">미리보기</h2>
              <div className="preview-grid">
                <div>
                  <h3>지원자</h3>
                  <p>{form.name} · {form.email} · {form.phone}</p>
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
                  {useSavedResume && savedResume?.id ? (
                    <div className="preview-cl">
                      저장된 이력서 사용: <strong>{savedResume.fileName}</strong>
                      {savedResume.url && <> · <a className="link" href={savedResume.url} target="_blank" rel="noreferrer">미리보기</a></>}
                    </div>
                  ) : resumeFile ? (
                    <div className="preview-cl">
                      새 파일: <strong>{resumeFile.name}</strong> <span className="file-size">({(resumeFile.size/1024/1024).toFixed(1)}MB)</span>
                    </div>
                  ) : (
                    <div className="preview-cl muted">선택된 이력서가 없습니다.</div>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>

        {/* 우측: 공고 요약(스티키) */}
        <aside className="apply-sidebar">
          <div className="job-summary-card">
            <div className="job-summary-header">
              <div className="logo-fallback">{(job?.companyName ?? "C")[0]}</div>
              <div>
                <div className="company-name">{job?.companyName}</div>
                <div className="job-title">{job?.title}</div>
              </div>
            </div>
            <ul className="job-meta">
              <li><MapPin size={16}/>{(job?.regions ?? [])[0] ?? "-"}</li>
              <li><Briefcase size={16}/>{job?.employmentType ?? "-"}</li>
              <li><CalendarDays size={16}/>시작일 {prettyDate(job?.openDate) || "-"}</li>
              {job?.closeType !== "CONTINUOUS" && (
                <li><CalendarDays size={16}/>마감일 {prettyDate(job?.closeDate) || "미정"}</li>
              )}
              <li><DollarSign size={16}/>{job?.salaryLabel ?? "급여 협의"}</li>
              <li><Users size={16}/>지원자 {job?.applicationCount ?? 0}명</li>
            </ul>
            {dday != null && (
              <div className={`dday ${dday <= 3 ? "urgent" : ""}`}>
                D-{dday}
              </div>
            )}
            <Link className="back-link" to={`/jobpostinglist/${jobId}`}>← 공고 상세로 돌아가기</Link>
          </div>

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
       <button type="button" className="btn ghost" onClick={handleSaveDraft} disabled={submitting}>임시저장</button>
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
