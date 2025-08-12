import React from 'react';
import '../css/Form.css';

function ActivityForm() {
  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width"><label htmlFor="activityName">활동명</label><input type="text" id="activityName" name="activityName" placeholder="예) 잡Hub 개발 동아리"/></div>
        <div className="form-field"><label htmlFor="activityOrg">활동 기관/단체</label><input type="text" id="activityOrg" name="activityOrg" placeholder="예) 잡Hub대학교"/></div>
        <div className="form-field"><label htmlFor="activityRole">역할</label><input type="text" id="activityRole" name="activityRole" placeholder="예) 팀장"/></div>
        <div className="form-field"><label htmlFor="activityStartDate">시작일</label><input type="date" id="activityStartDate" name="activityStartDate"/></div>
        <div className="form-field"><label htmlFor="activityEndDate">종료일</label><input type="date" id="activityEndDate" name="activityEndDate"/></div>
        <div className="form-field full-width"><label htmlFor="activityDesc">활동 설명</label><textarea id="activityDesc" name="activityDesc" placeholder="어떤 활동이었고, 본인의 역할은 무엇이었는지 구체적으로 작성해주세요."/></div>
      </div>
    </div>
  );
}
export default ActivityForm;