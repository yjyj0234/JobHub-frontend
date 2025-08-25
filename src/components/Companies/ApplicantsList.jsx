import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../css/Jobposting.css";

axios.defaults.baseURL = "http://localhost:8080";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const STATUS_OPTIONS = [
  "APPLIED",
  "VIEWED",
  "INTERVIEW_REQUEST",
  "OFFERED",
  "HIRED",
  "REJECTED",
];

async function markApplicationViewed(appId) {
  await axios.patch(`/api/applications/${appId}/view`, null, { withCredentials: true });
}

async function updateApplicationStatus(appId, nextStatus) {
  await axios.patch(
    `/api/applications/${appId}/status`,
    { status: nextStatus },
    { withCredentials: true }
  );
}

const ApplicantsList = () => {
  const { user, isAuthed } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [postings, setPostings] = useState([]);
  const [selectedPostingId, setSelectedPostingId] = useState(searchParams.get("postingId") || "");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 회사 식별자: companyId 우선, 없으면 사용자 id
  const companyId = useMemo(() => {
    return user?.companyId ?? user?.id ?? null;
  }, [user]);

  // 로그인/권한 기본 가드
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

  useEffect(() => {
    let alive = true;
    setError("");
    (async () => {
      try {
        // ✅ 회사가 등록한 공고 목록 (경로/방식 수정)
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
    return () => {
      alive = false;
    };
  }, [companyId]); // eslint-disable-line react-hooks/exhaustive-deps

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

      // 구조 파악용 — 개발 중 잠깐 켜두면 좋아요
      console.log("[applications] raw response:", res.data);

      const list = res.data?.items ?? res.data?.applications ?? res.data ?? [];

      const normalized = list.map((a) => {
        const user = a.user ?? a.applicant ?? {};
        const resume = a.resume ?? {};

        // snake_case 대응
        const snake = (k) =>
          a[k] ??
          a[k.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase())] ??
          resume[k] ??
          resume[k?.replace?.(/[A-Z]/g, (m) => "_" + m.toLowerCase())] ??
          user[k] ??
          user[k?.replace?.(/[A-Z]/g, (m) => "_" + m.toLowerCase())];

        return {
          id: String(a.id ?? a.applicationId ?? snake("applicationId") ?? snake("application_id") ?? ""),
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

  return () => {
    alive = false;
  };
}, [selectedPostingId]);

  const handleOpenResume = async (application) => {
    try {
      await markApplicationViewed(application.id);
      setApplicants((prev) =>
        prev.map((x) =>
          x.id === application.id
            ? {
                ...x,
                status: x.status === "APPLIED" ? "VIEWED" : x.status,
                viewedAt: new Date().toISOString(),
              }
            : x
        )
      );
      if (application.resumeUrl) {
        window.open(application.resumeUrl, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      console.error(e);
      alert("열람 처리 중 문제가 발생했습니다.");
    }
  };

  const handleStatusChange = async (application, nextStatus) => {
    try {
      await updateApplicationStatus(application.id, nextStatus);
      setApplicants((prev) =>
        prev.map((x) => (x.id === application.id ? { ...x, status: nextStatus } : x))
      );
    } catch (e) {
      console.error(e);
      alert("상태 변경에 실패했습니다.");
    }
  };

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
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
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
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>{a.applicantName}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>{a.applicantEmail}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                                {a.resumeTitle ? (
                        <>
                          {/* 제목 자체를 클릭해서 열람 */}
                          <button
                            type="button"
                            onClick={() => handleOpenResume(a)}
                            style={{ all: "unset", cursor: "pointer", color: "#2563eb", textDecoration: "underline" }}
                            title="이력서 미리보기 (열람 처리됨)"
                          >
                            {a.resumeTitle}
                          </button>
                        </>
                      ) : (
                        <span style={{ color: "#777" }}>제목 없음</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                                          {formatDate(a.appliedAt)}

                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      {/* 열람일 */}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      {a.viewedAt ? formatDate(a.viewedAt) : "-"}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      <select value={a.status} onChange={(e) => handleStatusChange(a, e.target.value)}>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default ApplicantsList;
