import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../css/Jobposting.css";

axios.defaults.baseURL = "http://localhost:8080";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const ApplicantsList = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [postings, setPostings] = useState([]);
  const [selectedPostingId, setSelectedPostingId] = useState(searchParams.get("postingId") || "");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const companyId = useMemo(() => {
    // 백엔드 스펙에 따라 companyId 또는 userId 사용
    return user?.companyId ?? user?.userId ?? null;
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn || !companyId) return;
    setError("");
    (async () => {
      try {
        // 회사가 등록한 공고 목록 불러오기
        // 예상 API: GET /api/postings?companyId=123
        const res = await axios.get("/api/postings", {
          params: { companyId },
          withCredentials: true,
        });
        const list = res.data?.items ?? res.data?.postings ?? res.data ?? [];
        const normalized = list.map((p) => ({
          id: String(p.id ?? p.postingId ?? ""),
          title: p.title ?? "제목 없음",
          status: p.status ?? "",
          createdAt: p.createdAt ?? p.openDate ?? null,
        }));
        setPostings(normalized);
        if (!selectedPostingId && normalized.length > 0) {
          setSelectedPostingId(normalized[0].id);
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("postingId", normalized[0].id);
            return next;
          });
        }
      } catch (e) {
        console.error(e);
        setError("공고 목록을 불러오는 중 오류가 발생했습니다.");
      }
    })();
  }, [isLoggedIn, companyId]);

  useEffect(() => {
    if (!selectedPostingId) {
      setApplicants([]);
      return;
    }
    setError("");
    setLoading(true);
    (async () => {
      try {
        // 특정 공고의 지원자 목록
        // 예상 API: GET /api/applications?postingId=ID
        const res = await axios.get("/api/applications", {
          params: { postingId: selectedPostingId },
          withCredentials: true,
        });
        const list = res.data?.items ?? res.data?.applications ?? res.data ?? [];
        const normalized = list.map((a) => ({
          id: String(a.id ?? a.applicationId ?? ""),
          applicantName: a.applicantName ?? a.userName ?? a.name ?? "이름 없음",
          applicantEmail: a.applicantEmail ?? a.email ?? "-",
          resumeTitle: a.resumeTitle ?? a.resume?.title ?? "-",
          resumeUrl: a.resumeUrl ?? a.resume?.fileUrl ?? null,
          status: a.status ?? "APPLIED",
          appliedAt: a.appliedAt ?? a.createdAt ?? null,
        }));
        setApplicants(normalized);
      } catch (e) {
        console.error(e);
        setError("지원자 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedPostingId]);

  if (!isLoggedIn) {
    return (
      <div className="jobposting-container large">
        <h2 className="jobposting-title">지원자 리스트</h2>
        <p>로그인이 필요합니다.</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="jobposting-container large">
        <h2 className="jobposting-title">지원자 리스트</h2>
        <p>회사 정보가 없습니다. 회사 계정으로 로그인했는지 확인해주세요.</p>
      </div>
    );
  }

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
        {error && (
          <div style={{ color: "#b00020", marginBottom: 12 }}>{error}</div>
        )}
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
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #eee" }}>상태</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #eee" }}>지원일</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #eee" }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.id}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>{a.applicantName}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>{a.applicantEmail}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>{a.resumeTitle}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>{a.status}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>{formatDate(a.appliedAt)}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f3f3f3" }}>
                      {a.resumeUrl ? (
                        <a
                          href={a.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#2563eb" }}
                        >
                          이력서 보기
                        </a>
                      ) : (
                        <span style={{ color: "#777" }}>이력서 없음</span>
                      )}
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


