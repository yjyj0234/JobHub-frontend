/**
 * src/pages/ResumeListPage.jsx
 * --------------------------------
 * [최종 버전] 이력서 수정, 복사, 삭제 및 파일/URL 등록 기능이 구현된 이력서 관리 페이지
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Link, FileText, Star, MoreVertical, Trash2, Copy, Briefcase, BarChart2, Eye } from 'lucide-react';
import '../css/ResumeListPage.css';

const mockResumes = [
  { id: 1, title: '웹 프론트엔드 개발자 (신입)', isRepresentative: true, type: 'written', lastModified: '2025.08.06', status: '작성 중' },
  { id: 2, title: '백엔드 개발자 포트폴리오 (PDF)', isRepresentative: false, type: 'file', lastModified: '2025.08.05', status: '작성 완료' },
  { id: 3, title: '아주 긴 이력서 제목 테스트입니다. 이력서 제목이 길어지면 어떻게 되는지 확인하기 위한 용도입니다.', isRepresentative: false, type: 'url', lastModified: '2025.08.04', status: '작성 완료' },
];

const FileUploadModal = ({ onClose }) => (
  <div className="upload-modal">
    <h2>파일 업로드</h2>
    <p>이력서 파일을 이곳에 올려주세요.</p>
    <div className="upload-area">파일을 드래그하거나 클릭하여 업로드</div>
    <button onClick={onClose} className="action-button">닫기</button>
  </div>
);

const UrlUploadModal = ({ onClose }) => (
  <div className="upload-modal">
    <h2>URL로 등록</h2>
    <p>Notion, GitHub 등 이력서 URL을 입력해주세요.</p>
    <input type="url" placeholder="https://..." />
    <button onClick={onClose} className="action-button">닫기</button>
  </div>
);

function ResumeListPage() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [isFileModalOpen, setFileModalOpen] = useState(false);
  const [isUrlModalOpen, setUrlModalOpen] = useState(false);

  useEffect(() => {
    const sortedResumes = mockResumes.sort((a, b) => (b.isRepresentative - a.isRepresentative));
    setResumes(sortedResumes);
  }, []);

  const handleCopyResume = (resumeId) => {
    const resumeToCopy = resumes.find(r => r.id === resumeId);
    if (resumeToCopy) {
      const newResume = {
        ...resumeToCopy,
        id: Date.now(),
        title: `${resumeToCopy.title} (복사본)`,
        isRepresentative: false,
      };
      setResumes(prev => [newResume, ...prev]);
      alert('이력서가 복사되었습니다.');
    }
  };

  const handleDeleteResume = (resumeId) => {
    if (window.confirm("정말로 이 이력서를 삭제하시겠습니까?")) {
      setResumes(prev => prev.filter(r => r.id !== resumeId));
      alert('이력서가 삭제되었습니다.');
    }
  };

  const ResumeCard = ({ resume }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
      <div className={`resume-card ${resume.isRepresentative ? 'representative' : ''}`}>
        <div className="card-header">
          <div className="card-title-group">
            {resume.isRepresentative && <span className="rep-badge">대표</span>}
            <h3 className="resume-title">{resume.title}</h3>
          </div>
          <div className="more-button-wrapper" ref={dropdownRef}>
            <button className="more-button" onClick={() => setDropdownOpen(!isDropdownOpen)}>
              <MoreVertical size={20} />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => { handleCopyResume(resume.id); setDropdownOpen(false); }}>
                  <Copy size={14}/> 복사
                </button>
                <button onClick={() => { handleDeleteResume(resume.id); setDropdownOpen(false); }} className="delete">
                  <Trash2 size={14}/> 삭제
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="card-body">
          <span className={`status-tag ${resume.status === '작성 중' ? 'writing' : 'completed'}`}>{resume.status}</span>
          <p className="resume-meta">{resume.lastModified} 수정</p>
        </div>
        <div className="card-footer">
          <button className="action-button main-action" onClick={() => navigate(`/resumes/edit/${resume.id}`)}>
            이력서 수정
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {isFileModalOpen && <FileUploadModal onClose={() => setFileModalOpen(false)} />}
      {isUrlModalOpen && <UrlUploadModal onClose={() => setUrlModalOpen(false)} />}

      <div className="resume-list-page">
        <div className="list-page-header">
          <h1>나의 이력서</h1>
          <div className="new-resume-buttons">
            <button className="new-resume-btn" onClick={() => setFileModalOpen(true)}><FilePlus size={16} /> 파일 등록</button>
            <button className="new-resume-btn" onClick={() => setUrlModalOpen(true)}><Link size={16} /> URL 등록</button>
            <button className="new-resume-btn primary" onClick={() => navigate('/resumes/new')}><FileText size={16} /> 이력서 새로 작성</button>
          </div>
        </div>
        
        <div className="resume-grid-container">
          {resumes.map(resume => <ResumeCard key={resume.id} resume={resume} />)}
        </div>

        <div className="activity-stats-container">
          <h2>나의 활동 현황</h2>
          <div className="stats-grid">
            <div className="stat-item"><span>0</span><p>입사지원</p></div>
            <div className="stat-item"><span>0</span><p>스크랩</p></div>
            <div className="stat-item"><span>0</span><p>받은 제안</p></div>
            <div className="stat-item"><span>0</span><p>이력서 열람</p></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResumeListPage;