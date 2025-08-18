// src/components/Resume/ActivityForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../css/Form.css";

/**
 * props
 * - resumeId?: number
 * - serverMode?: boolean  // true: 서버 CRUD, false: 드래프트(onUpdate만 호출)
 * - activity?: { id?, activityName, organization, role, startDate, endDate, description }
 * - onSaved?: (saved) => void    // 서버모드에서 저장/수정 성공 시 콜백
 * - onUpdate?: (draft) => void   // 드래프트 모드에서 값 변경 시 콜백
 * - onCancel?: () => void
 * - onDelete?: () => void        // 서버모드: 삭제 후 콜백 / 드래프트: 그냥 섹션 제거
 */
function ActivityForm({
  resumeId,
  serverMode, // optional
  activity,
  onSaved,
  onUpdate,
  onCancel,
  onDelete,
}) {
  const isEdit = useMemo(() => !!activity?.id, [activity]);
  // serverMode가 명시되지 않았다면 resumeId 존재 여부로 자동 판정
  const effectiveServerMode = useMemo(
    () => (typeof serverMode === "boolean" ? serverMode : !!resumeId),
    [serverMode, resumeId]
  );

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [formData, setFormData] = useState(() => ({
    activityName: activity?.activityName || "",
    organization: activity?.organization || "",
    role: activity?.role || "",
    startDate: activity?.startDate || "",
    endDate: activity?.endDate || "",
    description: activity?.description || "",
  }));

  // 드래프트 모드에선 resumeId 없어도 정상 동작해야 하므로 경고 금지
  useEffect(() => {
    if (effectiveServerMode && !resumeId) {
      // 서버 저장을 하겠다고 했는데 resumeId가 없다면 사용자에게만 메시지
      setErr("이력서 ID가 없어 서버 저장을 할 수 없어요.");
      console.warn("[ActivityForm] serverMode=true지만 resumeId가 없습니다.");
    }
  }, [effectiveServerMode, resumeId]);

  const validate = () => {
    if (!formData.activityName?.trim()) return "활동명은 필수야.";
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      return "종료일은 시작일 이후여야 해.";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErr("");

    // 드래프트 모드에선 입력 즉시 상위 상태에 반영
    if (!effectiveServerMode) {
      onUpdate?.({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setErr(v);

    // 드래프트 모드: 서버호출 없음
    if (!effectiveServerMode) {
      onUpdate?.(formData);
      return;
    }

    // 서버 모드인데 resumeId가 없으면 저장 불가
    if (!resumeId) {
      return setErr("이력서 ID가 없어 저장할 수 없어요.");
    }

    setSaving(true);
    try {
      const payload = {
        activityName: formData.activityName.trim(),
        organization: formData.organization?.trim() || "",
        role: formData.role?.trim() || "",
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        description: formData.description?.trim() || "",
      };

      const base = `/resumes/${resumeId}/activities`;
      const res = isEdit
        ? await axios.put(`${base}/${activity.id}`, payload, {
            withCredentials: true,
          })
        : await axios.post(base, payload, { withCredentials: true });

      onSaved?.(res.data);
      setErr("");
    } catch (error) {
      const s = error?.response?.status;
      const msg =
        error?.response?.data?.message ||
        (s === 401
          ? "로그인이 필요해."
          : s === 403
          ? "권한이 없어."
          : "저장 중 오류가 발생했어.");
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // 드래프트 모드이거나 신규(아이템 id 없음)면 그냥 상위에서 섹션 제거
    if (!effectiveServerMode || !isEdit) {
      onDelete?.();
      return;
    }
    if (!window.confirm("이 활동을 삭제할까?")) return;

    setSaving(true);
    try {
      await axios.delete(`/resumes/${resumeId}/activities/${activity.id}`, {
        withCredentials: true,
      });
      onDelete?.();
    } catch (error) {
      const s = error?.response?.status;
      const msg =
        error?.response?.data?.message ||
        (s === 401
          ? "로그인이 필요해."
          : s === 403
          ? "권한이 없어."
          : "삭제 중 오류가 발생했어.");
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      {/* 드래프트 안내 배너 */}
      {!effectiveServerMode && (
        <div className="form-tip" style={{ marginBottom: 12 }}>
          초안 모드예요. 여기서 입력한 내용은 화면에만 저장돼요. “작성 완료”를
          누르면 서버에 한 번에 반영돼요.
        </div>
      )}

      <div className="grid-layout">
        <div className="form-field full-width">
          <label htmlFor="activityName">
            활동명<span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            type="text"
            id="activityName"
            name="activityName"
            value={formData.activityName}
            onChange={handleChange}
            placeholder="예) 잡Hub 개발 동아리"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="organization">활동 기관/단체</label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            placeholder="예) 잡Hub대학교"
          />
        </div>

        <div className="form-field">
          <label htmlFor="role">역할</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="예) 팀장"
          />
        </div>

        <div className="form-field">
          <label htmlFor="startDate">시작일</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="endDate">종료일</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-field full-width">
          <label htmlFor="description">활동 설명</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="어떤 활동이었고, 본인의 역할은 무엇이었는지 구체적으로 작성해줘."
          />
        </div>
      </div>

      {err && <div className="form-error">{err}</div>}

      <div className="form-actions">
        {isEdit && (
          <button
            type="button"
            className="btn danger"
            onClick={handleDelete}
            disabled={saving}
          >
            {saving ? "삭제 중..." : "삭제"}
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            className="btn ghost"
            onClick={onCancel}
            disabled={saving}
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={saving || (effectiveServerMode && !resumeId)}
        >
          {saving
            ? "저장 중..."
            : isEdit && effectiveServerMode
            ? "수정 저장"
            : "추가/저장"}
        </button>
      </div>
    </form>
  );
}

export default ActivityForm;
