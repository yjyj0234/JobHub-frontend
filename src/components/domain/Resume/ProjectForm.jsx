import React from 'react';
import '../../../css/Form.css';

function ProjectForm() {
  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width"><label>프로젝트명</label><input type="text" placeholder="프로젝트명을 입력하세요"/></div>
        <div className="form-field"><label>수행 기관/회사</label><input type="text" placeholder="예) 개인 프로젝트"/></div>
        <div className="form-field"><label>역할</label><input type="text" placeholder="예) 프론트엔드 개발 리드"/></div>
        <div className="form-field"><label>시작일</label><input type="date"/></div>
        <div className="form-field"><label>종료일</label><input type="date"/></div>
        <div className="form-field full-width"><label>URL</label><input type="url" placeholder="프로젝트 결과물을 확인할 수 있는 링크 (GitHub, 배포 링크 등)"/></div>
        <div className="form-field full-width"><label>프로젝트 설명</label><textarea placeholder="프로젝트의 주요 기능, 구현 방식, 기여한 부분 등을 상세히 작성해주세요."/></div>
        <div className="form-field full-width"><label>사용 기술 스택</label><input type="text" placeholder="예) React, TypeScript, Recoil"/></div>
      </div>
    </div>
  );
}
export default ProjectForm;