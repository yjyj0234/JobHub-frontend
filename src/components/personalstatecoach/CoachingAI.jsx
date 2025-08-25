import React, { useMemo, useRef, useState } from "react";
import "../css/proofread.css";

/**
 * POST /api/proofread { text }
 * -> { corrected, issues: [{ start, end, original, suggestion, message, type }] }
 */

const MAX_LEN = 10000;
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/").replace(/\/+$/, "");

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

  const ranges = issues
    .filter(
      (it) =>
        Number.isFinite(it.start) &&
        Number.isFinite(it.end) &&
        it.end > it.start
    )
    .sort((a, b) => a.start - b.start);

  let html = "";
  let cursor = 0;

  ranges.forEach((r) => {
    const { start, end, message, type, suggestion } = r;
    if (cursor < start) html += escapeHtml(text.slice(cursor, start));
    const bad = text.slice(start, end);
    const title = escapeHtml(
      [
        type || "ISSUE",
        message ? `: ${message}` : "",
        suggestion ? ` → ${suggestion}` : "",
      ]
        .join("")
        .trim()
    );
    html += `<mark class="hl-bad" title="${title}">${escapeHtml(bad)}</mark>`;
    cursor = end;
  });

  if (cursor < text.length) html += escapeHtml(text.slice(cursor));
  return html;
}

export default function CoachingAI() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const chars = text.length;
  const over = chars > MAX_LEN;
  const canSubmit = !loading && !over && text.trim().length > 0;

  const highlightedOriginal = useMemo(() => {
    return buildHighlightedHtml(text, result?.issues || []);
  }, [text, result]);

  const handleCheck = async () => {
    if (!canSubmit) return;
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {}
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const url =
        API_BASE === "/" ? "/api/proofread" : `${API_BASE}/api/proofread`;
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 401)
          throw new Error("로그인이 필요합니다. 먼저 로그인해 주세요.");
        if (res.status === 403) throw new Error("접근 권한이 없습니다.");
        if (res.status === 404)
          throw new Error("엔드포인트가 없습니다. 프록시/경로 확인!");
        const t = await res.text().catch(() => "");
        throw new Error(
          `HTTP ${res.status} ${res.statusText}${t ? ` - ${t}` : ""}`
        );
      }

      const data = await res.json();
      setResult({
        corrected: typeof data.corrected === "string" ? data.corrected : "",
        issues: Array.isArray(data.issues) ? data.issues : [],
      });
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error(e);
      setError(
        e?.message || "검사 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      );
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
    <div className="prf-container prf-compact">
      <div className="prf-header">
        <div className="prf-icon">✍️</div>
        <div>
          <h1 className="prf-title">맞춤법 · 띄어쓰기 검사</h1>
          <p className="prf-sub">
            자소서·이메일을 붙여넣고 한 번에 교정해 보세요.
          </p>
        </div>
      </div>

      <div className="prf-grid prf-grid-compact">
        {/* 입력 카드 */}
        <section className="prf-card prf-card-compact">
          <div className="prf-card-head prf-card-head-sticky">
            <h2>입력</h2>
            <div className={`prf-counter ${over ? "over" : ""}`}>
              {chars.toLocaleString()} / {MAX_LEN.toLocaleString()}자
            </div>
          </div>

          <div className="prf-card-body prf-scroll">
            <textarea
              className="prf-textarea prf-textarea-compact"
              placeholder="여기에 글을 붙여넣으세요. (최대 10,000자)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_LEN + 2000}
            />
            {error && <div className="prf-error">{error}</div>}
          </div>

          <div className="prf-actions prf-actions-compact">
            <button
              className="btn ghost sm"
              type="button"
              onClick={handleClear}
              disabled={!text}
            >
              비우기
            </button>
            <button
              className="btn primary sm"
              type="button"
              onClick={handleCheck}
              disabled={!canSubmit}
            >
              {loading ? "검사 중..." : "검사하기"}
            </button>
          </div>
        </section>

        {/* 결과 카드 */}
        <section className="prf-card prf-card-compact">
          <div className="prf-card-head prf-card-head-sticky">
            <h2>결과</h2>
            {result?.corrected && (
              <button
                className="btn outline xs"
                onClick={handleCopy}
                aria-label="교정문 복사"
              >
                복사
              </button>
            )}
          </div>

          <div className="prf-card-body prf-scroll">
            {!result && !loading && (
              <div className="prf-placeholder">
                검사 결과가 여기에 표시됩니다.
              </div>
            )}

            {result?.corrected && (
              <>
                <div className="prf-block prf-block-compact">
                  <div className="prf-label sm">교정된 문장</div>
                  <textarea
                    className="prf-textarea small prf-textarea-compact"
                    value={result.corrected}
                    readOnly
                  />
                </div>

                <div className="prf-block prf-block-compact">
                  <div className="prf-label sm">
                    문제 구간(원문 기준 하이라이트)
                  </div>
                  <div
                    className="prf-preview prf-preview-compact"
                    dangerouslySetInnerHTML={{ __html: highlightedOriginal }}
                  />
                </div>

                {result?.issues?.length > 0 && (
                  <div className="prf-issues prf-issues-compact">
                    <div className="prf-issues-head">
                      발견된 항목 <strong>{result.issues.length}</strong>건
                    </div>
                    <ul className="prf-issue-list">
                      {result.issues.map((it, idx) => (
                        <li key={idx} className="prf-issue prf-issue-compact">
                          <span
                            className={`tag tag-${(
                              it.type || "OTHER"
                            ).toLowerCase()}`}
                          >
                            {it.type || "기타"}
                          </span>
                          <div className="issue-text">
                            <div className="from">{it.original}</div>
                            <div className="arrow">→</div>
                            <div className="to">
                              {it.suggestion || "제안 없음"}
                            </div>
                          </div>
                          {it.message && (
                            <div className="issue-msg">{it.message}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {loading && (
              <div className="prf-loading">AI가 문장을 분석 중입니다...</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
