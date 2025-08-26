import React, { useState, useEffect } from "react";
import "../css/Form.css";

function ProjectForm({ data, onUpdate, isEditing }) {
  // props → 내부 상태 정규화
  const buildInitial = (src = {}) => {
    const tech = Array.isArray(src.techStack)
      ? src.techStack
      : String(src.techStack ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    return {
      projectName: src.projectName ?? "",
      organization: src.organization ?? src.projectOrg ?? "",
      role: src.role ?? src.projectRole ?? "",
      startDate: src.startDate ?? "",
      endDate: src.endDate ?? "",
      ongoing: !!src.ongoing,
      projectUrl: src.projectUrl ?? src.url ?? "",
      description: src.description ?? "",
      techStack: tech,
    };
  };

  const [formData, setFormData] = useState(buildInitial(data));
  const [localTech, setLocalTech] = useState(
    Array.isArray(formData.techStack) ? formData.techStack.join(", ") : ""
  );

  useEffect(() => {
    const init = buildInitial(data);
    setFormData(init);
    setLocalTech(init.techStack.join(", "));
  }, [data]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    if (name === "techStack") {
      setLocalTech(value);
      const arr = String(value)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const next = { ...formData, techStack: arr };
      setFormData(next);
      onUpdate(next);
      return;
    }

    const v = type === "checkbox" ? checked : value;
    let next = { ...formData, [name]: v };

    // 진행중 체크 시 종료일 비우기
    if (name === "ongoing" && v) {
      next.endDate = "";
    }

    setFormData(next);
    onUpdate(next);
  };

  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width">
          <label htmlFor="projectName">프로젝트명</label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName || ""}
            onChange={handleChange}
            placeholder="프로젝트명을 입력하세요"
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          <label htmlFor="organization">수행 기관/회사</label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization || ""}
            onChange={handleChange}
            placeholder="예) 개인 프로젝트"
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          <label htmlFor="role">역할</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role || ""}
            onChange={handleChange}
            placeholder="예) 프론트엔드 개발 리드"
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          <label htmlFor="startDate">시작일</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate || ""}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          <label htmlFor="endDate">종료일</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate || ""}
            onChange={handleChange}
            placeholder={formData.ongoing ? "진행중" : ""}
            disabled={!isEditing || !!formData.ongoing}
          />
        </div>

        {/* 👉 진행중 토글 */}
        <div className="form-field toggle-field">
          <span className="toggle-text">
            진행중
            <small className="toggle-subtext">
              {formData.ongoing
                ? "종료일은 비활성화됩니다"
                : "필요 시 종료일을 입력하세요"}
            </small>
          </span>

          <label
            className={[
              "toggle",
              formData.ongoing ? "checked" : "",
              !isEditing ? "readonly" : "",
            ].join(" ")}
            aria-label="진행중"
          >
            <input
              type="checkbox"
              className="toggle-input"
              name="ongoing"
              checked={!!formData.ongoing}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
          </label>
        </div>

        <div className="form-field full-width">
          <label htmlFor="projectUrl">URL</label>
          <input
            type="url"
            id="projectUrl"
            name="projectUrl"
            value={formData.projectUrl || ""}
            onChange={handleChange}
            placeholder="프로젝트 결과물 링크 (GitHub, 배포 링크 등)"
            disabled={!isEditing}
          />
        </div>

        <div className="form-field full-width">
          <label htmlFor="description">프로젝트 설명</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="주요 기능, 구현 방식, 기여한 부분 등을 상세히 작성해주세요."
            disabled={!isEditing}
          />
        </div>

        <div className="form-field full-width">
          <label htmlFor="techStack">사용 기술 스택</label>
          <input
            type="text"
            id="techStack"
            name="techStack"
            value={localTech}
            onChange={handleChange}
            placeholder="예) React, TypeScript, Spring"
            disabled={!isEditing}
          />
          <small className="form-hint">콤마(,)로 여러 개를 구분하세요.</small>
        </div>
      </div>
    </div>
  );
}

export default ProjectForm;
