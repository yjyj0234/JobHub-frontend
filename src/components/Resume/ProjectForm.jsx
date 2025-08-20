import React, { useState } from 'react';
import '../css/Form.css';

function ProjectForm({ data, onUpdate, isEditing }) {
  const [formData, setFormData] = useState(data || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width"><label htmlFor="projectName">프로젝트명</label><input type="text" id="projectName" name="projectName" value={formData.projectName || ''} onChange={handleChange} placeholder="프로젝트명을 입력하세요" disabled={!isEditing}/></div>
        <div className="form-field"><label htmlFor="projectOrg">수행 기관/회사</label><input type="text" id="projectOrg" name="projectOrg" value={formData.projectOrg || ''} onChange={handleChange} placeholder="예) 개인 프로젝트" disabled={!isEditing}/></div>
        <div className="form-field"><label htmlFor="projectRole">역할</label><input type="text" id="projectRole" name="projectRole" value={formData.projectRole || ''} onChange={handleChange} placeholder="예) 프론트엔드 개발 리드" disabled={!isEditing}/></div>
        <div className="form-field"><label htmlFor="projectStartDate">시작일</label><input type="date" id="projectStartDate" name="startDate" value={formData.startDate || ''} onChange={handleChange} disabled={!isEditing}/></div>
        <div className="form-field"><label htmlFor="projectEndDate">종료일</label><input type="date" id="projectEndDate" name="endDate" value={formData.endDate || ''} onChange={handleChange} disabled={!isEditing}/></div>
        <div className="form-field full-width"><label htmlFor="projectUrl">URL</label><input type="url" id="projectUrl" name="url" value={formData.url || ''} onChange={handleChange} placeholder="프로젝트 결과물을 확인할 수 있는 링크 (GitHub, 배포 링크 등)" disabled={!isEditing}/></div>
        <div className="form-field full-width"><label htmlFor="projectDesc">프로젝트 설명</label><textarea id="projectDesc" name="description" value={formData.description || ''} onChange={handleChange} placeholder="프로젝트의 주요 기능, 구현 방식, 기여한 부분 등을 상세히 작성해주세요." disabled={!isEditing}/></div>
        <div className="form-field full-width"><label htmlFor="projectSkills">사용 기술 스택</label><input type="text" id="projectSkills" name="techStack" value={formData.techStack || ''} onChange={handleChange} placeholder="예) React, TypeScript, Recoil" disabled={!isEditing}/></div>
      </div>
    </div>
  );
}
export default ProjectForm;