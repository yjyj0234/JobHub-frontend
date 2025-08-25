// src/components/resume/ResumePreviewModal.jsx
import React, { useRef } from "react";
import { User, Phone, MapPin, Calendar, Printer, FileDown } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../css/ResumePreviewModal.css";

/* ================= 프로필 (읽기 전용) ================= */
const ProfileHeaderPreview = ({ profile }) => {
  if (!profile) return null;
  return (
    <div className="profile-header preview-mode">
      <div className="profile-main-info">
        <div className="profile-photo-wrapper">
          {profile.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt={profile.name || "프로필"}
              className="profile-photo"
            />
          ) : (
            <div className="profile-photo-placeholder">
              <User size={40} />
            </div>
          )}
        </div>
        <div className="profile-details">
          <h2 className="profile-name-display">{profile.name || "이름"}</h2>
          <p className="profile-headline-display">
            {profile.headline || "한 줄 소개"}
          </p>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <Phone size={14} />
              <span>{profile.phone || "-"}</span>
            </div>
            <div className="profile-info-item">
              <MapPin size={14} />
              <span>{profile.regionName || "-"}</span>
            </div>
            <div className="profile-info-item">
              <Calendar size={14} />
              <span>{profile.birthDate || "-"}</span>
            </div>
          </div>
        </div>
      </div>
      {profile.summary && (
        <div className="profile-info-wide">
          <label>자기소개</label>
          <div className="summary-display">{profile.summary}</div>
        </div>
      )}
    </div>
  );
};

/* ================= 섹션 뷰 ================= */
const SectionView = ({ section }) => {
  if (!section.data || section.data.length === 0) {
    return (
      <div className="preview-data-item empty">작성된 내용이 없습니다.</div>
    );
  }
  return section.data.map((item, idx) => (
    <div key={item.subId || idx} className="preview-data-item">
      {renderItem(section.type, item)}
    </div>
  ));
};

const renderItem = (type, data) => {
  switch (type) {
    case "experiences":
      return (
        <>
          <p>
            <strong>{data.companyName || "회사명 미입력"}</strong> |{" "}
            {data.position || "직책 미입력"}
          </p>
          <p className="period">
            {data.startDate || "시작일"} ~ {data.endDate || "종료일"}
          </p>
          {data.description && (
            <p className="description">{data.description}</p>
          )}
        </>
      );
    case "educations":
      return (
        <>
          <p>
            <strong>{data.schoolName || "학교명 미입력"}</strong>
          </p>
          <p>
            {data.major || "전공 미입력"} ({data.degree || "학위 미입력"})
          </p>
          <p className="period">
            {data.admissionDate || "입학일"} ~ {data.graduationDate || "졸업일"}
          </p>
          {data.gpa && (
            <p>
              학점: {data.gpa} / {data.maxGpa || "4.5"}
            </p>
          )}
        </>
      );
    case "skills": {
      const items = Array.isArray(data?.skills) ? data.skills : [data];
      const visible = items
        .map((s) => ({
          name: (s?.name || "").trim(),
          category:
            (typeof s?.category === "string" && s.category.trim()) ||
            (typeof s?.categoryId === "number" ? `#${s.categoryId}` : ""),
          id: s?.id ?? s?.resumeSkillId ?? s?.skillId,
        }))
        .filter((s) => s.name.length > 0);
      if (visible.length === 0) {
        return (
          <div className="preview-data-item empty">작성된 스킬이 없습니다.</div>
        );
      }
      return (
        <div className="skills-preview-container">
          {visible.map((s, idx) => (
            <span key={s.id ?? idx} className="skill-preview-tag">
              {s.name}
              {s.category ? ` (${s.category})` : ""}
            </span>
          ))}
        </div>
      );
    }
    case "projects":
      return (
        <>
          <p>
            <strong>{data.projectName || "프로젝트명 미입력"}</strong> (
            {data.organization || "수행기관 미입력"})
          </p>
          <p className="period">
            {data.startDate || "시작일"} ~{" "}
            {data.ongoing ? "진행중" : data.endDate || "종료일"}
          </p>
          {data.projectUrl && (
            <p>
              <strong>링크:</strong>{" "}
              <a
                href={data.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {data.projectUrl}
              </a>
            </p>
          )}
          {Array.isArray(data.techStack) && data.techStack.length > 0 && (
            <p>
              <strong>사용 기술:</strong> {data.techStack.join(", ")}
            </p>
          )}
          {data.description && (
            <p className="description">{data.description}</p>
          )}
        </>
      );
    case "activities":
      return (
        <>
          <p>
            <strong>{data.activityName || "활동명 미입력"}</strong> (
            {data.organization || "기관/단체 미입력"})
          </p>
          <p className="period">
            {data.startDate || "시작일"} ~ {data.endDate || "종료일"}
          </p>
          {data.description && (
            <p className="description">{data.description}</p>
          )}
        </>
      );
    case "awards":
      return (
        <>
          <p>
            <strong>
              {data.awardTitle || data.awardName || "수상명 미입력"}
            </strong>
          </p>
          <p>
            {data.awardingInstitution || data.organization || "수여기관 미입력"}
          </p>
          <p className="period">{data.awardDate || "수상일 미입력"}</p>
          {data.description && (
            <p className="description">{data.description}</p>
          )}
        </>
      );
    case "certifications":
      return (
        <>
          <p>
            <strong>{data.certificationName || "자격증명 미입력"}</strong>
          </p>
          <p>발급기관: {data.issuingOrganization || "미입력"}</p>
          <p className="period">취득일: {data.issueDate || "미입력"}</p>
          {data.expiryDate && (
            <p className="period">만료일: {data.expiryDate}</p>
          )}
          {data.certificationNumber && (
            <p>자격번호: {data.certificationNumber}</p>
          )}
        </>
      );
    case "languages": {
      const level = data.proficiencyLevel || data.fluency || "미입력";
      return (
        <>
          <p>
            <strong>{data.language || "언어명 미입력"}</strong>
          </p>
          <p>수준: {level}</p>
          {(data.testName || data.testScore) && (
            <p>
              시험: {data.testName || "시험명 미입력"} (
              {data.testScore || "점수 미입력"})
            </p>
          )}
          {data.testDate && <p className="period">시험일: {data.testDate}</p>}
        </>
      );
    }
    case "portfolios":
      return (
        <>
          {data.title && (
            <p>
              <strong>{data.title}</strong>
            </p>
          )}
          <p>
            <strong>링크:</strong>{" "}
            <a href={data.url} target="_blank" rel="noopener noreferrer">
              {data.url || "URL 미입력"}
            </a>
          </p>
          {data.portfolioType && <p>유형: {data.portfolioType}</p>}
          {data.description && (
            <p className="description">{data.description}</p>
          )}
        </>
      );
    default:
      return <div className="preview-data-item">표시할 내용이 없습니다.</div>;
  }
};

/* ================== 캡처 유틸(전체 폭 기준) ================== */
const mmToPx = (mm) => {
  const div = document.createElement("div");
  div.style.height = `${mm}mm`;
  div.style.position = "absolute";
  div.style.left = "-9999px";
  document.body.appendChild(div);
  const px = div.offsetHeight;
  document.body.removeChild(div);
  return px;
};

async function captureFullImage(el, { widthMm = 210, scale = 3 } = {}) {
  // A4 전체 폭(210mm)에 맞추고 스크롤/제한 제거 후 캡처
  const pageWidthPx = mmToPx(widthMm);

  const sandbox = document.createElement("div");
  sandbox.style.position = "fixed";
  sandbox.style.left = "-99999px";
  sandbox.style.top = "0";
  sandbox.style.width = pageWidthPx + "px";
  sandbox.style.background = "#ffffff";
  sandbox.style.padding = "0";
  sandbox.style.margin = "0";
  sandbox.style.zIndex = "-1";

  const clone = el.cloneNode(true);
  clone.style.width = "100%";
  clone.style.maxWidth = "none";
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";
  clone.style.boxShadow = "none";
  clone.style.background = "#ffffff";

  const style = document.createElement("style");
  style.textContent = `
    .preview-modal-content, .preview-modal-overlay, .preview-body, .print-root {
      max-height: none !important;
      height: auto !important;
      overflow: visible !important;
      box-shadow: none !important;
      background: #fff !important;
    }
  `;
  sandbox.appendChild(style);
  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);
  await new Promise((r) => requestAnimationFrame(r));

  const canvas = await html2canvas(clone, {
    scale,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  document.body.removeChild(sandbox);
  return canvas;
}

/* ================== 모달 ================== */
function ResumePreviewModal({
  isOpen,
  onClose,
  title,
  profile,
  sections,
  sectionComponents,
}) {
  const contentRef = useRef(null);
  if (!isOpen) return null;

  // 원하는 인쇄 내부 여백(mm)
  const PADDING = { top: 8, right: 8, bottom: 8, left: 8 }; // ← 여기 숫자만 바꿔도 즉시 반영

  const handlePrint = async () => {
    const el = contentRef.current;
    if (!el) return;

    // A4 내부 여백(mm) — 파일 상단 PADDING과 동일하게 사용
    const PAD = PADDING ?? { top: 6, right: 6, bottom: 6, left: 6 };

    // 1) 한 장 이미지 캡처
    const canvas = await captureFullImage(el, { widthMm: 210, scale: 3 });
    const dataUrl = canvas.toDataURL("image/png");

    // 2) 새 창 없이, 보이지 않는 iframe 문서에 인쇄용 페이지 작성
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>${(title || "resume").replace(/\s+/g, "_")}</title>
      <style>
        @page { size: A4; margin: 0; }
        html, body { margin: 0; padding: 0; background: #fff; }
        .page {
          width: 210mm; height: 297mm;
          padding: ${PAD.top}mm ${PAD.right}mm ${PAD.bottom}mm ${PAD.left}mm;
          box-sizing: border-box;
          display: flex; align-items: center; justify-content: center;
        }
        img { width: 100%; height: 100%; object-fit: contain; display: block; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="page"><img id="shot" alt="resume"/></div>
    </body>
  </html>`);
    doc.close();

    // 3) 이미지 로드 후 인쇄 호출
    const img = doc.getElementById("shot");
    const waitImageLoad = new Promise((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("이미지 로드 실패"));
    });
    img.src = dataUrl;
    await waitImageLoad;

    // 렌더 한 프레임 보장 후 인쇄
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r))
    );
    const cleanup = () => {
      try {
        document.body.removeChild(iframe);
      } catch {}
    };
    iframe.contentWindow.addEventListener("afterprint", cleanup, {
      once: true,
    });
    // 일부 브라우저는 afterprint가 안 올 수도 있어 타임아웃 백업
    setTimeout(cleanup, 2000);
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };

  const handleSavePdf = async () => {
    const el = contentRef.current;
    if (!el) return;

    const canvas = await captureFullImage(el, { widthMm: 210, scale: 3 });

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfW = pdf.internal.pageSize.getWidth(); // 210
    const pdfH = pdf.internal.pageSize.getHeight(); // 297

    // PDF 안쪽 패딩(mm) — 인쇄와 동일하게 사용
    const maxW = pdfW - (PADDING.left + PADDING.right);
    const maxH = pdfH - (PADDING.top + PADDING.bottom);

    const pxToMm = (px) => px * 0.264583;
    const imgWmm = pxToMm(canvas.width);
    const imgHmm = pxToMm(canvas.height);

    const k = Math.min(maxW / imgWmm, maxH / imgHmm);
    const drawW = imgWmm * k;
    const drawH = imgHmm * k;
    const dx = (pdfW - drawW) / 2;
    const dy = (pdfH - drawH) / 2;

    pdf.addImage(canvas.toDataURL("image/png"), "PNG", dx, dy, drawW, drawH);
    pdf.save(`${(title || "resume").replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div
        className="preview-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="preview-header">
          <h1>{title || "이력서 미리보기"}</h1>
          <div className="export-actions">
            <button
              className="export-btn"
              onClick={handlePrint}
              title="한 장으로 인쇄"
            >
              <Printer size={16} /> 인쇄(한 장)
            </button>
            <button
              className="export-btn"
              onClick={handleSavePdf}
              title="한 장 PDF 저장"
            >
              <FileDown size={16} /> PDF 저장(한 장)
            </button>
            <button className="close-btn" onClick={onClose} aria-label="닫기">
              &times;
            </button>
          </div>
        </div>

        {/* 캡처 대상 */}
        <div className="preview-body print-root" ref={contentRef}>
          <ProfileHeaderPreview profile={profile} />
          {sections.length > 0 ? (
            sections.map((section) => {
              const si = sectionComponents[section.type];
              if (!si) return null;
              return (
                <div key={section.id} className="preview-section">
                  <h2>{si.title}</h2>
                  <SectionView section={section} />
                </div>
              );
            })
          ) : (
            <div className="preview-section">
              <p>추가된 항목이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumePreviewModal;
