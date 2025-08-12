import React, { useState } from 'react';
import '../css/Form.css';
import { PlusCircle, XCircle } from 'lucide-react';

function SkillForm({ data, onUpdate }) {
  const [skills, setSkills] = useState(Array.isArray(data.skills) ? data.skills : [{ name: '', category: '' }]);
  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSkills = [...skills];
    updatedSkills[index] = { ...updatedSkills[index], [name]: value };
    setSkills(updatedSkills);
    onUpdate({ skills: updatedSkills });
  };

  const addSkill = () => {
    const newSkills = [...skills, { name: '', category: '' }];
    setSkills(newSkills);
    onUpdate({ skills: newSkills });
  };

  // 특정 스킬을 삭제하는 함수
  const removeSkill = (index) => {
    // 최소 1개의 입력 필드는 유지
    if (skills.length <= 1) {
        alert("최소 1개의 스킬 항목은 유지해야 합니다.");
        return;
    }
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
    onUpdate({ skills: updatedSkills });
  };

  return (
    <div className="item-form">
      <p className="form-guide">보유한 기술 스택이나 능력을 자유롭게 입력해주세요. (예: Python, Java, AWS, Photoshop)</p>
      
      {skills.map((skill, index) => (
        <div key={index} className="skill-item-container">
          <div className="grid-layout">
            <div className="form-field">
              <label htmlFor={`skillName-${index}`}>기술명</label>
              <input
                type="text"
                id={`skillName-${index}`}
                name="name"
                value={skill.name || ''}
                onChange={(e) => handleChange(index, e)}
                placeholder="예: React"
              />
            </div>
            <div className="form-field">
              <label htmlFor={`skillCategory-${index}`}>기술 카테고리 (선택)</label>
              <input
                type="text"
                id={`skillCategory-${index}`}
                name="category"
                value={skill.category || ''}
                onChange={(e) => handleChange(index, e)}
                placeholder="예: 프론트엔드"
              />
            </div>
          </div>
          <button type="button" className="remove-skill-btn" onClick={() => removeSkill(index)}>
            <XCircle size={18} />
          </button>
        </div>
      ))}
      
      <button type="button" className="add-item-btn" onClick={addSkill}>
        <PlusCircle size={16} /> 스킬 추가
      </button>
    </div>
  );
}

export default SkillForm;