// src/components/resume/ResumePreviewModal.jsx
import React, { useRef } from "react";
import { User, Phone, MapPin, Calendar, Printer, FileDown } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../css/ResumePreviewModal.css";

/* -------------------- 프로필 헤더 (읽기 전용) -------------------- */
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

/* -------------------- 섹션 뷰 -------------------- */
const SectionView = ({ section }) => {
  if (!section.data || section.data.length === 0) {
    return (
      <div className="preview-data-item empty">작성된 내용이 없습니다.</div>
    );
  }
  return section.data.map((item, index) => (
    <div key={item.subId || index} className="preview-data-item">
      {renderItem(section.type, item)}
    </div>
  ));
};

/* -------------------- 타입별 렌더 -------------------- */
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

/* -------------------- 모달 -------------------- */
function ResumePreviewModal({
  isOpen,
  onClose,
  title,
  profile, // 있으면 프로필 헤더를 보여줌(없으면 생략)
  sections,
  sectionComponents,
}) {
  const contentRef = useRef(null);

  if (!isOpen) return null;

  // 인쇄: 미리보기 DOM을 캡처 → 새 창에 A4 한 장짜리 문서로 띄워 인쇄
  const handlePrint = async () => {
    const el = contentRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, {
      scale: 3, // 선명도(2~3 권장)
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const dataUrl = canvas.toDataURL("image/png");

    const marginMm = 12; // A4 여백(인쇄/PDF 동일)
    const win = window.open("", "_blank");
    if (!win) {
      alert("팝업이 차단되었어요. 브라우저 팝업 허용 후 다시 시도해주세요.");
      return;
    }

    const html = `
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>${(title || "resume").replace(/\s+/g, "_")}</title>
          <style>
            @page { size: A4; margin: ${marginMm}mm; }
            html, body { margin: 0; padding: 0; background: #fff; }
            .page {
              width: ${210 - marginMm * 2}mm;
              height: ${297 - marginMm * 2}mm;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: ${marginMm}mm;
            }
            img { max-width: 100%; max-height: 100%; display: block; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="page"><img id="shot" src="${dataUrl}" /></div>
          <script>
            const go = () => { window.focus(); window.print(); };
            const img = document.getElementById('shot');
            if (img.complete) go(); else img.onload = go;
          </script>
        </body>
      </html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  // PDF 저장: 미리보기 DOM을 캡처 → A4 한 장에 비율 유지해 맞춤
  const handleSavePdf = async () => {
    const el = contentRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfW = pdf.internal.pageSize.getWidth(); // 210
    const pdfH = pdf.internal.pageSize.getHeight(); // 297
    const margin = 12;
    const maxW = pdfW - margin * 2;
    const maxH = pdfH - margin * 2;

    const pxToMm = (px) => px * 0.264583; // px → mm
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

        {/* ⬇ 인쇄/캡처 대상 */}
        <div className="preview-body print-root" ref={contentRef}>
          {/* profile prop을 넘기면 프로필 헤더 출력 (넘기지 않으면 생략) */}
          <ProfileHeaderPreview profile={profile} />

          {sections.length > 0 ? (
            sections.map((section) => {
              const sectionInfo = sectionComponents[section.type];
              if (!sectionInfo) return null;

              return (
                <div key={section.id} className="preview-section">
                  <h2>{sectionInfo.title}</h2>
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
