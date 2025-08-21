// src/components/resume/forms/EducationForm.jsx
import React, { useState, useEffect } from "react";
import "../css/Form.css";

/**
 * DB 컬럼 매핑
 * - school_name           ⇄ schoolName (text)
 * - school_type           ⇄ schoolType (text/select)
 * - major                 ⇄ major (text)
 * - minor                 ⇄ minor (text)
 * - degree                ⇄ degree (text)
 * - admission_date        ⇄ admissionDate (date)
 * - graduation_date       ⇄ graduationDate (date)
 * - graduation_status     ⇄ graduationStatus (text/select)
 * - gpa                   ⇄ gpa (number)
 * - max_gpa               ⇄ maxGpa (number)
 *
 * 부모로 올리는 객체의 키를 위 camelCase로 유지하세요.
 * (SECTION_API.educations.toPayload(stripMeta(it)) 그대로 사용 가능)
 */
function EducationForm({ data, onUpdate }) {
  // 들어온 data를 폼 초기값으로 동기화
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
    ...data, // 이미 값이 있으면 덮어쓰기
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 숫자 필드는 숫자/빈값만 허용(문자 입력 방지)
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
          />
          {/* 필요하면 select로 전환
          <select id="schoolType" name="schoolType" value={formData.schoolType || ""} onChange={handleChange}>
            <option value="">선택</option>
            <option value="HIGH_SCHOOL">고등학교</option>
            <option value="UNIVERSITY">대학교</option>
            <option value="GRAD_SCHOOL">대학원</option>
          </select>
          */}
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
          />
        </div>

        {/* 졸업 상태 */}
        <div className="form-field">
          <label htmlFor="graduationStatus">졸업 상태</label>
          {/* <input
            type="text"
            id="graduationStatus"
            name="graduationStatus"
            value={formData.graduationStatus || ""}
            onChange={handleChange}
            placeholder="예) 재학 / 휴학 / 졸업 / 중퇴"
          /> */}
          {/* 필요하면 select로 전환 */}
          <select
            id="graduationStatus"
            name="graduationStatus"
            value={formData.graduationStatus || ""}
            onChange={handleChange}
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
          />
        </div>
      </div>
    </div>
  );
}

export default EducationForm;
