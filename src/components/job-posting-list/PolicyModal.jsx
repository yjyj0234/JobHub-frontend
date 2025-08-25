import React, { useEffect, useRef } from "react";

/**
 * 프론트 전용 개인정보 수집·이용 동의 모달
 * props:
 *  - open: boolean
 *  - onClose: () => void
 *  - type: 'COLLECTION' (추후 확장 가능)
 */
export default function PolicyModal({ open, onClose, type = "COLLECTION" }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        padding: "24px",
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="policy-title"
      aria-describedby="policy-desc"
    >
      <div
        ref={dialogRef}
        onClick={stop}
        style={{
          width: "min(720px, 92vw)",
          maxHeight: "82vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 18px 48px rgba(0,0,0,.2)",
          border: "1px solid #eee",
        }}
      >
        {/* Header */}
        <div style={{ padding: "18px 20px 12px", borderBottom: "1px solid #f0f0f0" }}>
          <h2 id="policy-title" style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>
            개인정보 수집·이용 동의 (필수)
          </h2>
          <div style={{ marginTop: 6, color: "#777", fontSize: ".9rem" }}>
            시행일: 2025-08-01
          </div>
        </div>

        {/* Body */}
        <div id="policy-desc" style={{ padding: 20, lineHeight: 1.7, color: "#222" }}>
          <section style={{ marginBottom: 18 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 800 }}>1. 수집·이용 목적</h3>
            <ul style={{ margin: "0 0 0 18px" }}>
              <li>채용 전형 진행(지원서 접수, 자격요건 확인, 서류/면접 전형 등)</li>
              <li>지원자 식별 및 본인 확인, 합격자 발표 및 연락</li>
              <li>채용 관련 민원 처리 및 분쟁 대응</li>
              <li>향후 동일·유사 포지션 채용 안내(선택 동의 시)</li>
            </ul>
          </section>

          <section style={{ marginBottom: 18 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 800 }}>2. 수집 항목</h3>
            <p style={{ margin: "0 0 6px" }}><strong>필수</strong></p>
            <ul style={{ margin: "0 0 10px 18px" }}>
              <li>이름, 이메일, 연락처</li>
              <li>지원 정보(지원 직무, 지원서 내용, 이력서(파일 또는 등록 이력서 ID))</li>
              <li>접속 로그 등 서비스 이용 기록(부정 이용 방지 목적)</li>
            </ul>
            <p style={{ margin: "0 0 6px" }}><strong>선택</strong></p>
            <ul style={{ margin: "0 0 0 18px" }}>
              <li>포트폴리오/깃허브/링크드인 등 외부 링크, 희망연봉, 입사 가능일</li>
            </ul>
          </section>

          <section style={{ marginBottom: 18 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 800 }}>3. 보유·이용 기간</h3>
            <ul style={{ margin: "0 0 0 18px" }}>
              <li>채용 전형 종료 후 <strong>3년</strong> 간 보관 후 파기(관계 법령에 따른 보존이 필요한 경우 해당 기간 동안 보관)</li>
            </ul>
          </section>

          <section style={{ marginBottom: 18 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 800 }}>4. 제3자 제공</h3>
            <p style={{ margin: 0 }}>
              원칙적으로 제3자에게 제공하지 않습니다. 다만 법령에 근거가 있거나 수사기관의 적법한 요청이 있는 경우 제공될 수 있습니다.
            </p>
          </section>

          <section style={{ marginBottom: 18 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 800 }}>5. 처리위탁</h3>
            <p style={{ margin: 0 }}>
              서비스 운영 및 데이터 보관을 위해 클라우드/알림 전송 등 일부 업무를 외부 전문 업체에 위탁할 수 있습니다. 위탁 시 관련 법령에 따른
              안전성 확보 조치를 준수합니다.
            </p>
          </section>

          <section style={{ marginBottom: 18 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 800 }}>6. 동의 거부 권리 및 불이익</h3>
            <p style={{ margin: 0 }}>
              귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다. 다만 필수 항목 동의를 거부하실 경우 지원서 접수가 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 800 }}>7. 문의</h3>
            <p style={{ margin: 0 }}>
              개인정보보호 담당자: admin@admin.com (예시) / 02-0550-0660
            </p>
          </section>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px 18px", display: "flex", gap: 8, justifyContent: "flex-end", borderTop: "1px solid #f0f0f0" }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              background: "#fff",
              border: "1px solid #e6e6e6",
              color: "#333",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            인쇄
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "var(--c-accent, #FF7D61)",
              color: "#fff",
              border: "1px solid transparent",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
