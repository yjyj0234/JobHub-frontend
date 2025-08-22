import React, { useMemo, useState } from "react";

/**
 * 백엔드 응답 포맷 가정:
 * POST /api/proofread  { text: string }
 * -> { corrected: string, issues: [{ start: number, end: number, original: string, suggestion: string, message: string, type: 'SPELL'|'SPACING'|'STYLE' }]}
 */

const MAX_LEN = 10000;

function escapeHtml(s = "") {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHighlightedHtml(text, issues) {
  if (!text) return "";
  if (!Array.isArray(issues) || issues.length === 0) return escapeHtml(text);

  // 겹치는 구간 최소 가정(일반적으로 API는 겹치지 않게 내려줌)
  const ranges = issues
    .filter(it => Number.isFinite(it.start) && Number.isFinite(it.end) && it.end > it.start)
    .sort((a, b) => a.start - b.start);

  let html = "";
  let cursor = 0;

  ranges.forEach((r) => {
    const { start, end, message, type, suggestion } = r;
    // 앞쪽 평문
    if (cursor < start) {
      html += escapeHtml(text.slice(cursor, start));
    }
    // 문제 구간
    const bad = text.slice(start, end);
    const title = escapeHtml(
      [type || "ISSUE", message ? `: ${message}` : "", suggestion ? ` → ${suggestion}` : ""]
        .join("")
        .trim()
    );
    html += `<mark class="hl-bad" title="${title}">${escapeHtml(bad)}</mark>`;
    cursor = end;
  });

  // 남은 꼬리
  if (cursor < text.length) {
    html += escapeHtml(text.slice(cursor));
  }
  return html;
}

export default function CoachingAI() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { corrected, issues: [] }
  const [error, setError] = useState("");

  const chars = text.length;
  const over = chars > MAX_LEN;

  const canSubmit = !loading && !over && text.trim().length > 0;

  const highlightedOriginal = useMemo(() => {
    return buildHighlightedHtml(text, result?.issues || []);
  }, [text, result]);

  const handleCheck = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/proofread", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${t ? `- ${t}` : ""}`);
      }

      const data = await res.json();
      // 안전망
      setResult({
        corrected: typeof data.corrected === "string" ? data.corrected : "",
        issues: Array.isArray(data.issues) ? data.issues : [],
      });
    } catch (e) {
      console.error(e);
      setError("검사 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result?.corrected || "");
      alert("교정된 문장이 복사되었습니다.");
    } catch {
      alert("복사에 실패했습니다. 수동으로 복사해 주세요.");
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError("");
  };

  return (
    <div className="prf-container">
      <div className="prf-header">
        <div className="prf-icon">✍️</div>
        <div>
          <h1 className="prf-title">맞춤법 · 띄어쓰기 검사</h1>
          <p className="prf-sub">자소서·이메일을 붙여넣고 한 번에 교정해 보세요.</p>
        </div>
      </div>

      <div className="prf-grid">
        {/* 입력 카드 */}
        <section className="prf-card">
          <div className="prf-card-head">
            <h2>입력</h2>
            <div className={`prf-counter ${over ? "over" : ""}`}>
              {chars.toLocaleString()} / {MAX_LEN.toLocaleString()}자
            </div>
          </div>

          <textarea
            className="prf-textarea"
            placeholder="여기에 글을 붙여넣으세요. (최대 10,000자)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_LEN + 2000} // UX: 살짝 초과 입력되도 카운터 경고로 안내
          />

          <div className="prf-actions">
            <button className="btn ghost" type="button" onClick={handleClear} disabled={!text}>
              비우기
            </button>
            <button className="btn primary" type="button" onClick={handleCheck} disabled={!canSubmit}>
              {loading ? "검사 중..." : "검사하기"}
            </button>
          </div>

          {error && <div className="prf-error">{error}</div>}
        </section>

        {/* 결과 카드 */}
        <section className="prf-card">
          <div className="prf-card-head">
            <h2>결과</h2>
            {result?.corrected && (
              <button className="btn outline sm" onClick={handleCopy}>교정문 복사</button>
            )}
          </div>

          {!result && !loading && (
            <div className="prf-placeholder">검사 결과가 여기에 표시됩니다.</div>
          )}

          {/* 교정문 */}
          {result?.corrected && (
            <>
              <div className="prf-block">
                <div className="prf-label">교정된 문장</div>
                <textarea
                  className="prf-textarea small"
                  value={result.corrected}
                  readOnly
                />
              </div>

              <div className="prf-block">
                <div className="prf-label">문제 구간(원문 기준 하이라이트)</div>
                <div
                  className="prf-preview"
                  dangerouslySetInnerHTML={{ __html: highlightedOriginal }}
                />
              </div>
            </>
          )}

          {/* 이슈 리스트 */}
          {result?.issues?.length > 0 && (
            <div className="prf-issues">
              <div className="prf-issues-head">
                발견된 항목 <strong>{result.issues.length}</strong>건
              </div>
              <ul className="prf-issue-list">
                {result.issues.map((it, idx) => (
                  <li key={idx} className="prf-issue">
                    <span className={`tag tag-${(it.type || "OTHER").toLowerCase()}`}>
                      {it.type || "기타"}
                    </span>
                    <div className="issue-text">
                      <div className="from">{it.original}</div>
                      <div className="arrow">→</div>
                      <div className="to">{it.suggestion || "제안 없음"}</div>
                    </div>
                    {it.message && <div className="issue-msg">{it.message}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 로딩 상태 */}
          {loading && (
            <div className="prf-loading">AI가 문장을 분석 중입니다...</div>
          )}
        </section>
      </div>
    </div>
  );
}
