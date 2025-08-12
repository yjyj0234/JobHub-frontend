// src/pages/Jobposting.jsx
import React, { useState, useRef, useEffect } from 'react';
import "../css/Jobposting.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SelectedJobTags from '../Companies/SelectedJobTags.jsx';
import AttachmentUploader from './AttachmentUploader.jsx';


// ✅ 전역에서 한 번만 설정 (렌더마다 재설정 방지)
axios.defaults.baseURL = 'http://localhost:8080';

const Jobposting = () => {
  const navigate = useNavigate();

  // 주 직무 체크 박스(새로 추가할 직무를 대표로 지정할지)
  const [isPrimary, setIsPrimary] = useState(true);

  // 지역
  const [locations, setLocations] = useState([]);       // 시/도
  const [selectedLocation, setSelectedLocation] = useState(''); // 시/도 id (string)
  const [subLocations, setSubLocations] = useState([]); // 시/군/구
  const [selectedSubLocation, setSelectedSubLocation] = useState(''); // 시/군/구 id (string)

  // 직무
  const [jobCategories, setJobCategories] = useState([]); // 대분류 [{id,name}]
  const [jobKeywords, setJobKeywords] = useState([]);     // 소분류 [{id,name}]
  const [selectedJobMid, setSelectedJobMid] = useState('');   // 대분류 id (string)
  const [selectedJobCode, setSelectedJobCode] = useState(''); // 소분류 id (string)

  // 선택된 직무(여러 개) 저장
  const [selectedJobs, setSelectedJobs] = useState([]);

  // 상세 설명 에디터
  const [description, setDescription] = useState('');
  const textareaRef = useRef(null);
  const uploaderRef = useRef(null);
  const [attachments, setAttachments] = useState([]); // 업로드된 첨부 파일들 (payload에 포함하려면 필요)

  // ====== 초기 로딩: 직무 대분류, 시/도 ======
  useEffect(() => {
    // 직무 대분류
    axios.get('/api/search/job-categories')
      .then(res => {
        const list = (res.data?.categories || []).map(c => ({ ...c, id: String(c.id) }));
        setJobCategories(list);
      })
      .catch(console.error);

    // 시/도
    axios.get('/api/search/regions')
      .then(res => {
        const list = (res.data?.regions || []).map(r => ({ ...r, id: String(r.id) }));
        setLocations(list);
      })
      .catch(console.error);
  }, []);

  // ====== 대분류 선택 시: 소분류 로딩 ======
  const handleJobMidChange = (e) => {
    const parentId = e.target.value; // 문자열
    setSelectedJobMid(parentId);
    setSelectedJobCode('');
    setJobKeywords([]);

    if (!parentId) return;

    axios.get('/api/search/job-categories', { params: { parentId } })
      .then(res => {
        const list = (res.data?.categories || []).map(c => ({ ...c, id: String(c.id) }));
        setJobKeywords(list);
        setSelectedJobCode(list[0]?.id || '');
      })
      .catch(console.error);
  };

  // ====== 직무 추가 (대표 유일성 보장) ======
  const addJob = () => {
    if (!selectedJobMid || !selectedJobCode) return;

    const mainCategory = jobCategories.find(c => c.id === selectedJobMid);
    const subCategory  = jobKeywords.find(k => k.id === selectedJobCode);
    if (!mainCategory || !subCategory) return;

    const newJob = {
      id: `${selectedJobMid}-${selectedJobCode}`, // 프론트 전용 유니크 키
      mainCategory: mainCategory.name,
      subCategory: subCategory.name,
      mainCategoryId: selectedJobMid, // 문자열로 보관(전송 시 숫자 변환)
      subCategoryId: selectedJobCode,
      isPrimary: isPrimary, // 체크박스 상태 그대로
    };

    setSelectedJobs(prev => {
      // 중복 방지
      if (prev.some(j => j.id === newJob.id)) return prev;

      let next = [...prev, newJob];

      // 방금 추가한 걸 대표로 체크했다면 나머지는 false
      if (newJob.isPrimary) {
        next = next.map(j => ({ ...j, isPrimary: j.id === newJob.id }));
      }

      // 대표가 하나도 없다면 첫 항목을 대표로(안전장치)
      if (!next.some(j => j.isPrimary)) {
        next = next.map((j, idx) => ({ ...j, isPrimary: idx === 0 }));
      }

      return next;
    });

    // 다음 추가엔 기본값을 '보조'로 바꿔줌 (대표는 하나만)
    if (isPrimary) setIsPrimary(false);

    // 선택 초기화
    setSelectedJobMid('');
    setSelectedJobCode('');
    setJobKeywords([]);
  };

  // ====== 대표(주 직무) 라디오로 변경 ======
  const setPrimaryJob = (jobId) => {
    setSelectedJobs(prev => prev.map(j => ({ ...j, isPrimary: j.id === jobId })));
  };

  // ====== 직무 제거 (대표 제거 시 자동 재지정) ======
  const removeJob = (jobId) => {
    setSelectedJobs(prev => {
      const removed = prev.find(j => j.id === jobId);
      let next = prev.filter(j => j.id !== jobId);
      if (removed?.isPrimary && next.length > 0) {
        next = next.map((j, idx) => ({ ...j, isPrimary: idx === 0 }));
      }
      return next;
    });
  };

  // ====== 지역 변경: 시/군/구 로딩 ======
  const handleLocationChange = (e) => {
    const parentId = e.target.value;
    setSelectedLocation(parentId);
    setSelectedSubLocation('');
    setSubLocations([]);

    if (!parentId) return;

    axios.get('/api/search/regions', { params: { parentId } })
      .then(res => {
        const list = (res.data?.regions || []).map(r => ({ ...r, id: String(r.id) }));
        setSubLocations(list);
        setSelectedSubLocation(list[0]?.id || '');
      })
      .catch(console.error);
  };

  // ====== 간단 텍스트 스타일 ======
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
        formattedText = '\n------------------------\n';
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
// ====== 마크다운을 커서 위치에 삽입 ======
  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? description.length;
    const end   = textarea.selectionEnd ?? description.length;
    const next  = description.slice(0, start) + text + description.slice(end);
    setDescription(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + text.length;
      textarea.setSelectionRange(pos, pos);
    });
  };

  // (선택) 드래그&드롭 / 붙여넣기로 업로더 호출
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) {
      uploaderRef.current?.uploadFromExternal(files, { autoInsert: files.length === 1 });
    }
  };
  const handleDragOver = (e) => e.preventDefault();
  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const files = items.filter(it => it.kind === 'file').map(it => it.getAsFile()).filter(Boolean);
    if (files.length) {
      e.preventDefault();
      uploaderRef.current?.uploadFromExternal(files, { autoInsert: files.length === 1 });
    }
  };
  // ====== 제출: isPrimary를 BIT(1) => 1/0으로 변환 ======
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 대표가 하나도 없다면 첫 항목을 대표로 지정(마지막 안전장치)
    let jobs = selectedJobs;
    if (!jobs.some(j => j.isPrimary) && jobs.length > 0) {
      jobs = jobs.map((j, idx) => ({ ...j, isPrimary: idx === 0 }));
    }

    // 서버에서 기대하는 형태로 변환
    const categoriesPayload = jobs.map(j => ({
      categoryId: Number(j.subCategoryId), // 실제 저장은 소분류 id 기준이라면 이렇게
      isPrimary: j.isPrimary ? 1 : 0       // ✅ BIT(1) 맞춤
    }));

    const payload = {
      title: document.getElementById('title')?.value || '',
      description,
      regions: {
        sidoId: selectedLocation ? Number(selectedLocation) : null,
        sigunguId: selectedSubLocation ? Number(selectedSubLocation) : null,
      },
      categories: categoriesPayload
    };

    console.log('▶ 전송 payload', payload);

    try {
      // 실제 엔드포인트로 교체하세요.
      // const res = await axios.post('/api/postings', payload);
      // console.log('등록 성공:', res.data);
      // navigate('/postings'); // 성공 페이지 등으로 이동

      alert('콘솔의 payload를 확인하세요!\n(실제 등록 POST는 주석을 해제하고 엔드포인트를 맞추세요)');
    } catch (err) {
      console.error(err);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="jobposting-container large">
      <h2 className="jobposting-title">채용공고 등록</h2>

      <form className="jobposting-form" onSubmit={handleSubmit}>

        {/* 직무 분류 */}
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
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: 8 }}>
              <label>
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                />
                &nbsp;이 직무를 대표(주 직무)로 사용
              </label>
            </div>
          </div>
        
                  {/* 직무 추가 버튼 */}
          <div className="form-group" style={{ marginTop: '10px' }}>
            <button
              type="button"
              onClick={addJob}
              disabled={!selectedJobMid || !selectedJobCode}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              직무 추가
            </button>
          </div>

          {/* 선택된 직무 태그들 (분리 컴포넌트) */}
          <SelectedJobTags
            selectedJobs={selectedJobs}
            onSetPrimary={setPrimaryJob}
            onRemove={removeJob}
          />

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
            <div className='form-group-inline' style={{ gap: 20, alignItems: 'center', marginBottom: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <input type="radio" name="descriptionType" value="template" />
                JobHub 템플릿 사용
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <input type="radio" name="descriptionType" value="direct" />
                직접 작성
              </label>
            </div>

            {/* 간단 에디터 */}
            <div className="text-editor-toolbar">
              <button type="button" className="toolbar-btn" onClick={() => formatText('bold')} title="굵게">
                <strong>B</strong>
              </button>
              <button type="button" className="toolbar-btn" onClick={() => formatText('underline')} title="밑줄">
                <u>U</u>
              </button>
              <select className="toolbar-select" onChange={(e) => formatText('fontSize', e.target.value)} title="글자 크기">
                <option value="">크기</option>
                <option value="12">12px</option>
                <option value="14">14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
                <option value="20">20px</option>
              </select>
              <button type="button" className="toolbar-btn" onClick={() => formatText('hr')} title="구분선">
                ───
              </button>
               {/* (선택) 파일 업로더: 만들었으면 활성화 */}
              <AttachmentUploader
                ref={uploaderRef}
                value={attachments}
                onChange={setAttachments}
                onInsertMarkdown={(md) => insertAtCursor(md)}
                uploadUrl="/api/uploads"
                maxSizeMB={20}
              />
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

          {/* 근무 지역 */}
          <div className="form-group">
            <label>근무 지역</label>
            <div className='form-group-inline' style={{ gap: 10 }}>
              <select
                value={selectedLocation}
                onChange={handleLocationChange}
                style={{ flex: 1 }}
              >
                <option value="">시/도 선택</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
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
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
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

        {/* 조건 정보 (그대로 유지) */}
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
