import React, { useEffect, useState } from "react";
import "../css/Form.css";

/**
 * 이 컴포넌트는 "스킬 1개"만 다룹니다.
 * - 새 스킬 생성: name만 입력하면 됨  → { name, categoryId: null } 로 저장
 * - 기존 스킬 연결: 자동완성/선택 UI가 있다면 onUpdate({ skillId, name?, categoryId? })로 보내면 됨
 */
function SkillForm({ data = {}, onUpdate, isEditing }) {
  const [name, setName] = useState(data.name || "");
  const [categoryId, setCategoryId] = useState(
    typeof data.categoryId === "number" ? data.categoryId : null
  );

  // 외부 데이터 변경 시 폼 동기화
  useEffect(() => {
    setName(data.name || "");
  }, [data.name]);

  useEffect(() => {
    setCategoryId(typeof data.categoryId === "number" ? data.categoryId : null);
  }, [data.categoryId]);

  const handleNameChange = (e) => {
    const v = e.target.value;
    setName(v);
    // ★ 저장 로직이 먹히려면 name 또는 skillId가 반드시 올라가야 합니다.
    onUpdate?.({ name: v });
  };

  const handleCategoryChange = (e) => {
    const v = e.target.value === "" ? null : Number(e.target.value);
    setCategoryId(v);
    // categoryId는 선택사항(없어도 저장됨). 있으면 같이 전달.
    onUpdate?.({ categoryId: v });
  };

  return (
    <div className="item-form">
      <p className="form-guide">
        보유한 기술을 한 개 입력하세요. 여러 개를 추가하려면 섹션의 “+ 기술
        추가” 버튼을 사용하세요.
      </p>

      <div className="grid-layout">
        <div className="form-field">
          <label htmlFor="skillName">기술명</label>
          <input
            id="skillName"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="예: React, Java, AWS"
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          {/* <label htmlFor="skillCategoryId">카테고리 ID (선택)</label>
          <input
            id="skillCategoryId"
            type="number"
            value={categoryId ?? ""}
            onChange={handleCategoryChange}
            placeholder="숫자 ID (없으면 비워두기)"
            disabled={!isEditing}
            min="0"
          /> */}
          {/* 실제로 카테고리를 텍스트로 고르고 싶다면 셀렉트 박스로 바꾸고
              onUpdate({ categoryId: 선택된ID })만 넘기면 됩니다. */}
        </div>
      </div>
    </div>
  );
}

export default SkillForm;
