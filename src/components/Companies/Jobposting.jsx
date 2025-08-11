import React, { useState, useRef, useEffect } from 'react';
import "../css/Jobposting.css"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Jobposting = () => {
  axios.defaults.baseURL = 'http://localhost:8080';
  const navigate = useNavigate();
  
  //지역코드
  const [locations, setLocations] = useState([]);
  const [selectedLocation,setSelectedLocation]=useState('');
  const [subLocations,setSubLocations]=useState([]);
  const [selectedSubLocation,setSelectedSubLocation]=useState('');

  //직무코드(DB)
  const [jobCategories, setJobCategories] = useState([]); // DB에서 받은 대분류
  const [jobKeywords, setJobKeywords] = useState([]);     // DB에서 받은 세부분류
  const [selectedJobMid, setSelectedJobMid] = useState("");   // 1Depth(대분류) 코드
  const [selectedJobCode, setSelectedJobCode] = useState(""); // 3Depth 코드

  //2. 상세 설명을 위한 state
  const [description,setDescription]=useState('');
  const textareaRef = useRef(null);

//초기 로딩 : 직무 , 지역 분류
useEffect(()=>{
  axios.get('/api/search/job-categories')
    .then(res => 
      setJobCategories(res.data?.categories||[]))
    .catch(console.error);
  axios.get('/api/search/regions')
  .then(res=>setLocations(res.data?.regions||[]))
  .catch(console.error);
},[]);

  // 직업 대분류 변경시
  const handleJobMidChange = (e) => {
    const parentId = e.target.value;
    setSelectedJobMid(parentId);
    setSelectedJobCode('');
    setJobKeywords([]);

    if(!parentId) return;

    axios.get('/api/search/job-categories',{params:{parentId}})
    .then(res => {
      const list = res.data?.categories || [];
      setJobKeywords(list);
      setSelectedJobCode(list[0]?.id ? String(list[0].id): '');
    })
    .catch(console.error);
  };


   //지역변경
   const handleLocationChange = (e) => {
    const parentId=e.target.value;
    setSelectedLocation(parentId);
    setSelectedSubLocation('');
    setSubLocations([]);

    if(!parentId) return;
      axios.get('/api/search/regions', { params: { parentId } })
        .then(res => {
          const list=res.data?.regions||[];
          setSubLocations(list);
          setSelectedSubLocation(list[0]?.id? String(list[0].id): '');
        })
        .catch(console.error);  
  };

  // 텍스트 스타일링
  const formatText = (command, value = null) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    let formattedText = '';

    switch (command) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'fontSize':
        textarea.focus();
        document.execCommand('fontSize', false, value);
        return;
      case 'hr':
        formattedText = '\n---\n';
        break;
      default:
        return;
    }

    const newText = description.substring(0, start) + formattedText + description.substring(end);
    setDescription(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const handleSubmit = (e)=>{
   e.preventDefault();
    console.log('직무 대분류 id:', selectedJobMid);
    console.log('직무 소분류 id:', selectedJobCode);
    console.log('시/도 id:', selectedLocation);
    console.log('시/군/구 id:', selectedSubLocation);
    console.log('description:', description);
  
  }
  return (
    <div className="jobposting-container large">
      <h2 className="jobposting-title">채용공고 등록</h2>
      <form className="jobposting-form" onSubmit={handleSubmit} >

        {/* 🔹 직무 분류 (GET /api/search/job-categories, ?parentId=) */}
        <fieldset className="form-section">
          <legend>직무 분류</legend>
          <div className="form-group-inline" style={{ gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="job_mid_cd">직무 대분류</label>
              <select
                id="job_mid_cd"
                value={selectedJobMid}
                onChange={handleJobMidChange}
              >
                <option value="">대분류 선택</option>
                {jobCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="job_cd">세부 직무/키워드</label>
              <select
                id="job_cd"
                value={selectedJobCode}
                onChange={(e) => setSelectedJobCode(e.target.value)}
                disabled={!selectedJobMid}
              >
                <option value="">세부 직무 선택</option>
                {jobKeywords.map(k => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>


        {/* 기본 정보 */}
        <fieldset className="form-section">
          <legend>기본 정보</legend>
          <div className="form-group">
            <label htmlFor="title">공고 제목</label>
            <input type="text" id="title" name="title" placeholder="예: 프론트엔드 개발자" />
          </div>
          <div className="form-group">
            <label htmlFor="description">상세 설명</label>
            <div className='form-group-inline' style={{ gap: '20px', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input type="radio" name="descriptionType" value="template" />
                JobHub 템플릿 사용
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input type="radio" name="descriptionType" value="direct" />
                직접 작성
              </label>
            </div>
            
            {/* 텍스트 스타일링 툴바 */}
            <div className="text-editor-toolbar">
              <button 
                type="button" 
                className="toolbar-btn" 
                onClick={() => formatText('bold')}
                title="굵게"
              >
                <strong>B</strong>
              </button>
              <button 
                type="button" 
                className="toolbar-btn" 
                onClick={() => formatText('underline')}
                title="밑줄"
              >
                <u>U</u>
              </button>
              <select 
                className="toolbar-select"
                onChange={(e) => formatText('fontSize', e.target.value)}
                title="글자 크기"
              >
                <option value="">크기</option>
                <option value="12">12px</option>
                <option value="14">14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
                <option value="20">20px</option>
              </select>
              <button 
                type="button" 
                className="toolbar-btn" 
                onClick={() => formatText('hr')}
                title="구분선"
              >
                ───
              </button>
            </div>
            
            <textarea 
              ref={textareaRef}
              id="description" 
              name="description" 
              rows="12" 
              placeholder="업무 내용, 자격 요건 등을 입력하세요. 위의 버튼들을 사용하여 텍스트를 꾸밀 수 있습니다."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="styled-textarea"
            />
          </div>
          {/* 🔹 근무 지역 (GET /api/search/regions, ?parentId=) */}
          <div className="form-group">
            <label>근무 지역</label>
            <div className='form-group-inline' style={{ gap: '10px' }}>
              <select
                value={selectedLocation}
                onChange={handleLocationChange}
                style={{ flex: 1 }}
              >
                <option value="">시/도 선택</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedSubLocation}
                onChange={(e) => setSelectedSubLocation(e.target.value)}
                disabled={!selectedLocation}
                style={{ flex: 1 }}
              >
                <option value="">시/군/구 선택</option>
                {subLocations.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
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