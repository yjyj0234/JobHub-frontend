import React from 'react';
import './Jobposting.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Jobposting = () => {
  const navigate = useNavigate();
  const handleSubmit = (e)=>{
    e.preventDefault();
    
  }

  return (
    <div className="jobposting-container large">
      <h2 className="jobposting-title">채용공고 등록</h2>
      <form className="jobposting-form" onSubmit={handleSubmit} >
        {/* 기본 정보 */}
        <fieldset className="form-section">
          <legend>기본 정보</legend>
          <div className="form-group">
            <label htmlFor="title">공고 제목</label>
            <input type="text" id="title" name="title" placeholder="예: 프론트엔드 개발자" />
          </div>
          <div className="form-group">
            <label htmlFor="description">상세 설명</label>
            <textarea id="description" name="description" rows="8" placeholder="업무 내용, 자격 요건 등"></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="location">근무 지역</label>
            <input type="text" id="location" name="location" placeholder="예: 서울, 재택" />
          </div>
          <div className="form-group">
            <label htmlFor="is_remote">
              <input type="checkbox" id="is_remote" name="is_remote" /> 재택근무 가능
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="status">공고 상태</label>
            <select id="status" name="status">
              <option value="DRAFT">임시저장</option>
              <option value="OPEN">공개</option>
              <option value="CLOSED">마감</option>
              <option value="EXPIRED">만료</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="close_type">마감 유형</label>
            <select id="close_type" name="close_type">
              <option value="DEADLINE">마감일</option>
              <option value="UNTIL_FILLED">채용 시 마감</option>
              <option value="CONTINUOUS">상시채용</option>
              <option value="PERIODIC">정기채용</option>
            </select>
          </div>
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="open_date">공고 시작일시</label>
              <input type="datetime-local" id="open_date" name="open_date" />
            </div>
            <div className="form-group">
              <label htmlFor="close_date">공고 마감일시</label>
              <input type="datetime-local" id="close_date" name="close_date" />
            </div>
          </div>
        </fieldset>

        {/* 조건 정보 */}
        <fieldset className="form-section">
          <legend>채용 조건</legend>
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="min_experience_years">최소 경력 (년)</label>
              <input type="number" id="min_experience_years" name="min_experience_years" min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="max_experience_years">최대 경력 (년)</label>
              <input type="number" id="max_experience_years" name="max_experience_years" min="0" />
            </div>
          </div>
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="min_salary">최소 연봉 (만원)</label>
              <input type="number" id="min_salary" name="min_salary" min="0" />
            </div>
            <div className="form-group">
              <label htmlFor="max_salary">최대 연봉 (만원)</label>
              <input type="number" id="max_salary" name="max_salary" min="0" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="salary_type">급여 유형</label>
            <select id="salary_type" name="salary_type">
              <option value="ANNUAL">연봉</option>
              <option value="MONTHLY">월급</option>
              <option value="HOURLY">시급</option>
              <option value="NEGOTIABLE">협의</option>
              <option value="UNDISCLOSED">비공개</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="employment_type">고용 형태</label>
            <select id="employment_type" name="employment_type">
              <option value="FULL_TIME">정규직</option>
              <option value="PART_TIME">파트타임</option>
              <option value="CONTRACT">계약직</option>
              <option value="INTERN">인턴</option>
              <option value="FREELANCE">프리랜서</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="experience_level">경력 레벨</label>
            <select id="experience_level" name="experience_level">
              <option value="ENTRY">신입</option>
              <option value="JUNIOR">주니어</option>
              <option value="MID">미드</option>
              <option value="SENIOR">시니어</option>
              <option value="LEAD">리드</option>
              <option value="EXECUTIVE">임원</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="education_level">학력</label>
            <select id="education_level" name="education_level">
              <option value="ANY">무관</option>
              <option value="HIGH_SCHOOL">고졸</option>
              <option value="UNIVERSITY">대졸</option>
              <option value="COLLEGE">전문대졸</option>
              <option value="MASTER">석사</option>
              <option value="PHD">박사</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="work_schedule">근무 형태/스케줄</label>
            <input type="text" id="work_schedule" name="work_schedule" placeholder="예: 주 5일, 탄력근무제 등" />
          </div>
          <div className="form-group">
            <label htmlFor="etc">우대사항</label>
            <input type="text" id="etc" name="etc" placeholder="예: 관련 자격증, 외국어 능력 등" />
          </div>
        </fieldset>

        <button type="submit" className="cta-button large">등록하기</button>
      </form>
    </div>
  );
};

export default Jobposting;