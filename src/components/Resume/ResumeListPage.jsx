import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Link, FileText, MoreVertical, Trash2, Copy } from 'lucide-react';
import '../css/ResumeListPage.css';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../UI'; // 재사용 Modal 컴포넌트 임포트

// 파일 업로드 모달에 들어갈 내용
const FileUploadForm = () => (
  <>
    <h2>파일 업로드</h2>
    <p>이력서 파일을 이곳에 올려주세요.</p>
    <div className="upload-area">파일을 드래그하거나 클릭하여 업로드</div>
  </>
);

// URL 등록 모달에 들어갈 내용
const UrlUploadForm = () => (
  <>
    <h2>URL로 등록</h2>
    <p>Notion, GitHub 등 이력서 URL을 입력해주세요.</p>
    <input type="url" placeholder="https://..." className="url-input" />
    <button className="action-button primary url-submit-btn">등록</button>
  </>
);


function ResumeListPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [modalContent, setModalContent] = useState(null); // 'file', 'url', 또는 null

  const openModal = (type) => setModalContent(type);
  const closeModal = () => setModalContent(null);

  useEffect(() => {
    if (isLoggedIn) {
      const allResumes = JSON.parse(localStorage.getItem('resumes') || '[]');
      const userResumes = allResumes.filter(r => r.userId === user.userId);
      const sortedResumes = userResumes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      setResumes(sortedResumes);
    } else {
      setResumes([]);
    }
  }, [isLoggedIn, user]);

  const handleDeleteResume = (resumeId) => {
     if (window.confirm("정말로 이 이력서를 삭제하시겠습니까?")) {
        const updatedResumes = resumes.filter(r => r.id !== resumeId);
        setResumes(updatedResumes);
        const allResumes = JSON.parse(localStorage.getItem('resumes') || '[]');
        const otherUserResumes = allResumes.filter(r => r.userId !== user.userId);
        localStorage.setItem('resumes', JSON.stringify([...otherUserResumes, ...updatedResumes]));
        alert('이력서가 삭제되었습니다.');
    }
  };
  
    const handleCopyResume = (resumeId) => {
    alert('이력서 복사 기능은 구현이 필요합니다.');
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
      <Modal isOpen={!!modalContent} onClose={closeModal}>
        {modalContent === 'file' && <FileUploadForm />}
        {modalContent === 'url' && <UrlUploadForm />}
      </Modal>

      <div className="resume-list-page">
        <div className="list-page-header">
          <h1>나의 이력서</h1>
          <div className="new-resume-buttons">
            <button className="new-resume-btn" onClick={() => openModal('file')}><FilePlus size={16} /> 파일 등록</button>
            <button className="new-resume-btn" onClick={() => openModal('url')}><Link size={16} /> URL 등록</button>
            <button className="new-resume-btn primary" onClick={() => navigate('/resumes/new')}><FileText size={16} /> 이력서 새로 작성</button>
          </div>
        </div>

        <div className="resume-grid-container">
           {isLoggedIn ? (
              resumes.length > 0 ? (
                resumes.map(resume => <ResumeCard key={resume.id} resume={resume} />)
              ) : (
                <div className="empty-list-message">작성된 이력서가 없습니다. 새 이력서를 작성해보세요.</div>
              )
            ) : (
              <div className="empty-list-message">로그인 후 이력서를 관리할 수 있습니다.</div>
            )}
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