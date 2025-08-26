// src/components/resume/forms/EducationForm.jsx
import React, { useState, useEffect } from "react";
import "../css/Form.css";

/**
 * DB 컬럼 매핑
 * - school_name  ⇄ schoolName
 * - school_type  ⇄ schoolType
 * - major        ⇄ major
 * - minor        ⇄ minor
 * - degree       ⇄ degree
 * - admission_date    ⇄ admissionDate
 * - graduation_date   ⇄ graduationDate
 * - graduation_status ⇄ graduationStatus
 * - gpa         ⇄ gpa
 * - max_gpa     ⇄ maxGpa
 */
function EducationForm({ data, onUpdate, isEditing = false }) {
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolType: "",
    major: "",
    minor: "",
    degree: "",
    admissionDate: "",
    graduationDate: "",
    graduationStatus: "",
    gpa: "",
    maxGpa: "",
    ...data,
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, [data]);

  const handleChange = (e) => {
    if (!isEditing) return; // 편집 불가 상태에서는 무시

    const { name, value } = e.target;

    // 숫자 필드는 숫자/빈값만 허용
    if (name === "gpa" || name === "maxGpa") {
      const v = value;
      if (v === "" || /^(\d+(\.\d{0,2})?)?$/.test(v)) {
        const updated = { ...formData, [name]: v };
        setFormData(updated);
        onUpdate?.(updated);
      }
      return;
    }

    const updated = { ...formData, [name]: value };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const dis = !isEditing;

  return (
    <div className="item-form">
      <div className="grid-layout">
        {/* 학교명 */}
        <div className="form-field full-width">
          <label htmlFor="schoolName">학교명</label>
          <input
            type="text"
            id="schoolName"
            name="schoolName"
            value={formData.schoolName || ""}
            onChange={handleChange}
            placeholder="예) 잡Hub대학교"
            disabled={dis}
          />
        </div>

        {/* 학교 유형 */}
        <div className="form-field">
          <label htmlFor="schoolType">학교 유형</label>
          <input
            type="text"
            id="schoolType"
            name="schoolType"
            value={formData.schoolType || ""}
            onChange={handleChange}
            placeholder="예) 대학교 / 대학원 / 고등학교"
            disabled={dis}
          />
        </div>

        {/* 전공 */}
        <div className="form-field">
          <label htmlFor="major">전공</label>
          <input
            type="text"
            id="major"
            name="major"
            value={formData.major || ""}
            onChange={handleChange}
            placeholder="예) 컴퓨터공학과"
            disabled={dis}
          />
        </div>

        {/* 부전공 */}
        <div className="form-field">
          <label htmlFor="minor">부전공</label>
          <input
            type="text"
            id="minor"
            name="minor"
            value={formData.minor || ""}
            onChange={handleChange}
            placeholder="예) 데이터사이언스"
            disabled={dis}
          />
        </div>

        {/* 학위 */}
        <div className="form-field">
          <label htmlFor="degree">학위</label>
          <input
            type="text"
            id="degree"
            name="degree"
            value={formData.degree || ""}
            onChange={handleChange}
            placeholder="예) 학사 / 석사 / 박사"
            disabled={dis}
          />
        </div>

        {/* 입학일 */}
        <div className="form-field">
          <label htmlFor="admissionDate">입학일</label>
          <input
            type="date"
            id="admissionDate"
            name="admissionDate"
            value={formData.admissionDate || ""}
            onChange={handleChange}
            disabled={dis}
          />
        </div>

        {/* 졸업일 */}
        <div className="form-field">
          <label htmlFor="graduationDate">졸업일</label>
          <input
            type="date"
            id="graduationDate"
            name="graduationDate"
            value={formData.graduationDate || ""}
            onChange={handleChange}
            disabled={dis}
          />
        </div>

        {/* 졸업 상태 */}
        <div className="form-field">
          <label htmlFor="graduationStatus">졸업 상태</label>
          <select
            id="graduationStatus"
            name="graduationStatus"
            value={formData.graduationStatus || ""}
            onChange={handleChange}
            disabled={dis}
          >
            <option value="">선택</option>
            <option value="재학">재학</option>
            <option value="휴학">휴학</option>
            <option value="졸업">졸업</option>
            <option value="중퇴">중퇴</option>
          </select>
        </div>

        {/* GPA */}
        <div className="form-field">
          <label htmlFor="gpa">학점</label>
          <input
            type="text"
            inputMode="decimal"
            id="gpa"
            name="gpa"
            value={formData.gpa ?? ""}
            onChange={handleChange}
            placeholder="예) 3.80"
            disabled={dis}
          />
        </div>

        {/* 최대 GPA */}
        <div className="form-field">
          <label htmlFor="maxGpa">최대학점</label>
          <input
            type="text"
            inputMode="decimal"
            id="maxGpa"
            name="maxGpa"
            value={formData.maxGpa ?? ""}
            onChange={handleChange}
            placeholder="예) 4.50"
            disabled={dis}
          />
        </div>
      </div>
    </div>
  );
}

export default EducationForm;
