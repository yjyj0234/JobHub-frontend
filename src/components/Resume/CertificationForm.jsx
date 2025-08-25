import React, { useEffect, useState } from "react";
import "../css/Form.css";

function CertificationForm({ data, onUpdate, isEditing }) {
  const [formData, setFormData] = useState({
    certificationName: "",
    issuingOrganization: "",
    issueDate: null, // "YYYY-MM-DD" or null
    expiryDate: null, // "YYYY-MM-DD" or null
    certificationNumber: "",
    ...(data || {}),
  });

  // expiryDate 가 null/undefined 일 때만 noExpiry=true
  const [noExpiry, setNoExpiry] = useState(data?.expiryDate == null);
  // 체크 해제 시 복구할 만료일 캐시
  const [cachedExpiry, setCachedExpiry] = useState(data?.expiryDate ?? "");

  // 외부 data 동기화
  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...(data || {}) }));
    if (data) {
      setNoExpiry(data.expiryDate == null);
      // 실제 값이 있을 때만 캐시 갱신 (null이면 유지)
      if (data.expiryDate != null) setCachedExpiry(data.expiryDate);
    }
  }, [data]);

  const emit = (updated) => {
    setFormData(updated);
    onUpdate && onUpdate(updated);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "date") {
      // 빈 값("") → null, 그 외 "YYYY-MM-DD"
      emit({ ...formData, [name]: value === "" ? null : value });
      return;
    }
    emit({ ...formData, [name]: value });
  };

  // blur 시 trim + 빈 문자열은 null 처리
  const handleTrimOnBlur = (e) => {
    const { name, value } = e.target;
    const trimmed = (value ?? "").trim();
    emit({ ...formData, [name]: trimmed === "" ? null : trimmed });
  };

  // "만료일 없음" 토글
  const handleNoExpiry = (e) => {
    const checked = e.target.checked;
    setNoExpiry(checked);

    if (checked) {
      // 체크 ON → 현재 값을 캐시해두고 null로 보냄
      setCachedExpiry(formData.expiryDate || "");
      emit({ ...formData, expiryDate: null });
    } else {
      // 체크 OFF → 캐시값 복구(없으면 빈 문자열로 두고 사용자가 선택)
      const restore = cachedExpiry || "";
      emit({ ...formData, expiryDate: restore });
    }
  };

  const v = (x) => x ?? "";

  return (
    <div className="item-form">
      <div className="grid-layout">
        {/* 자격증명 (필수) */}
        <div className="form-field">
          <label htmlFor="certificationName">
            자격증명<span style={{ color: "#d33" }}>*</span>
          </label>
          <input
            type="text"
            id="certificationName"
            name="certificationName"
            value={v(formData.certificationName)}
            onChange={handleChange}
            onBlur={handleTrimOnBlur}
            placeholder="예) 정보처리기사, AWS Certified Solutions Architect 등"
            disabled={!isEditing}
          />
        </div>

        {/* 발급기관 */}
        <div className="form-field">
          <label htmlFor="issuingOrganization">발급기관</label>
          <input
            type="text"
            id="issuingOrganization"
            name="issuingOrganization"
            value={v(formData.issuingOrganization)}
            onChange={handleChange}
            onBlur={handleTrimOnBlur}
            placeholder="예) 한국산업인력공단, AWS, Microsoft"
            disabled={!isEditing}
          />
        </div>

        {/* 발급일 */}
        <div className="form-field">
          <label htmlFor="issueDate">발급일</label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={v(formData.issueDate)}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        {/* 만료일 + 만료일 없음 */}
        <div className="form-field">
          <label htmlFor="expiryDate">만료일</label>
          <input
            type="date"
            id="expiryDate"
            name="expiryDate"
            value={noExpiry ? "" : v(formData.expiryDate)}
            onChange={handleChange}
            disabled={!isEditing || noExpiry}
          />
          <div style={{ marginTop: 6 }}>
            <label style={{ fontSize: 13 }}>
              <input
                type="checkbox"
                checked={noExpiry}
                onChange={handleNoExpiry}
                disabled={!isEditing}
                style={{ marginRight: 6 }}
              />
              만료일 없음
            </label>
          </div>
        </div>

        {/* 자격증 번호(선택) */}
        <div className="form-field">
          <label htmlFor="certificationNumber">자격증 번호</label>
          <input
            type="text"
            id="certificationNumber"
            name="certificationNumber"
            value={v(formData.certificationNumber)}
            onChange={handleChange}
            onBlur={handleTrimOnBlur}
            placeholder="예) A1234567 (없으면 비워두세요)"
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );
}

export default CertificationForm;
