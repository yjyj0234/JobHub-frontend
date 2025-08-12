import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/ResumeEditorPage.css';
import { Briefcase, GraduationCap, Award, Languages, Star, Link as LinkIcon, Trash2, Eye, Server, Save } from 'lucide-react';
import { ExperienceForm, EducationForm, ActivityForm, AwardForm, CertificationForm, LanguageForm, PortfolioForm, ProjectForm, ResumePreviewModal } from './';
import { useAuth } from '../context/AuthContext.jsx';

const ResumeStatusPalette = ({ completeness, isRepresentative, onRepChange, isPublic, onPublicChange }) => {
    return (
        <aside className="resume-status-palette">
            <div className="completeness-meter">
                <div className="meter-header">
                    <span>완성도</span>
                    <span>{completeness}%</span>
                </div>
                <div className="meter-bar-background">
                    <div className="meter-bar-foreground" style={{ width: `${completeness}%` }}></div>
                </div>
            </div>
            <div className="status-toggles">
                <div className="toggle-item">
                    <label>대표 이력서</label>
                    <div className="toggle-switch">
                        <input type="checkbox" id="rep-switch" checked={isRepresentative} onChange={onRepChange} />
                        <label htmlFor="rep-switch"></label>
                    </div>
                </div>
                <div className="toggle-item">
                    <label>공개 여부</label>
                     <div className="toggle-switch">
                        <input type="checkbox" id="public-switch" checked={isPublic} onChange={onPublicChange} />
                        <label htmlFor="public-switch"></label>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const EditorSection = ({ title, onRemove, children }) => (
    <section className="editor-section">
      <div className="section-header"><h2>{title}</h2><button className="delete-item-btn" onClick={onRemove}><Trash2 size={16} /> 삭제</button></div>
      <div className="section-content">{children}</div>
    </section>
);

const EditorPalette = ({ onAddItem, addedSections }) => {
  const allItems = [
    { id: 'experiences', name: '경력', icon: <Briefcase size={20} /> },
    { id: 'educations', name: '학력', icon: <GraduationCap size={20} /> },
    { id: 'projects', name: '프로젝트', icon: <Server size={20} /> },
    { id: 'activities', name: '활동', icon: <Star size={20} /> },
    { id: 'awards', name: '수상', icon: <Award size={20} /> },
    { id: 'certifications', name: '자격증', icon: <Award size={20} /> },
    { id: 'languages', name: '언어', icon: <Languages size={20} /> },
    { id: 'portfolios', name: '포트폴리오', icon: <LinkIcon size={20} /> },
  ];

  return (
    <aside className="editor-palette">
      <h3>항목 추가</h3>
      <div className="palette-grid">
        {allItems.map(item => {
          const isAdded = addedSections.includes(item.id);
          return (
            <button key={item.id} className={`palette-item ${isAdded ? 'disabled' : ''}`} onClick={() => onAddItem(item.id)} disabled={isAdded}>
              {item.icon}<span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

function ResumeEditorPage() {
  const navigate = useNavigate();
  const { id: resumeId } = useParams();
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [resumeTitle, setResumeTitle] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRepresentative, setIsRepresentative] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const sectionComponents = {
    experiences: { title: '경력', component: ExperienceForm },
    educations: { title: '학력', component: EducationForm },
    activities: { title: '대외활동', component: ActivityForm },
    awards: { title: '수상 경력', component: AwardForm },
    certifications: { title: '자격증', component: CertificationForm },
    languages: { title: '외국어', component: LanguageForm },
    portfolios: { title: '포트폴리오', component: PortfolioForm },
    projects: { title: '프로젝트', component: ProjectForm },
  };
  
  useEffect(() => {
    if (resumeId) {
      const allResumes = JSON.parse(localStorage.getItem('resumes') || '[]');
      const resumeToEdit = allResumes.find(r => r.id === parseInt(resumeId));
      if (resumeToEdit) {
        setResumeTitle(resumeToEdit.title);
        setSections(resumeToEdit.sections);
        setIsRepresentative(resumeToEdit.isRepresentative || false);
        setIsPublic(resumeToEdit.isPublic !== undefined ? resumeToEdit.isPublic : true);
      }
    }
  }, [resumeId]);

  // 이력서 완성도 계산
  const completeness = useMemo(() => {
    const totalPossibleSections = Object.keys(sectionComponents).length;
    const addedCount = sections.length;
    // 각 섹션 데이터가 채워졌는지 여부도 체크 (간단한 예시)
    const filledCount = sections.filter(s => Object.values(s.data).some(val => val)).length;
    const titleBonus = resumeTitle.trim() !== '' ? 10 : 0;
    const sectionBonus = Math.round((filledCount / (addedCount || 1)) * 90);
    return Math.min(100, titleBonus + sectionBonus);
  }, [sections, resumeTitle, sectionComponents]);


  const handleAddItem = (itemType) => {
    if (sections.some(s => s.type === itemType)) {
        alert("이미 추가된 항목입니다.");
        return;
    }
    const newSection = { id: `${itemType}-${Date.now()}`, type: itemType, data: {} };
    setSections(prev => [...prev, newSection]);
  };

  const handleRemoveItem = (sectionId) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const handleSectionChange = (sectionId, updatedData) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, data: updatedData } : section
      )
    );
  };

  const performSave = (status) => {
    if (!user) { alert("로그인이 필요합니다."); return false; }
    if (!resumeTitle.trim()) { alert("이력서 제목을 입력해주세요."); return false; }

    setIsSaving(true);
    let allResumes = JSON.parse(localStorage.getItem('resumes') || '[]');
    const lastModified = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const currentId = resumeId ? parseInt(resumeId) : Date.now();

    // 대표 이력서 설정 시 다른 이력서들은 대표에서 해제
    if (isRepresentative) {
        allResumes = allResumes.map(r => 
            r.userId === user.userId ? { ...r, isRepresentative: false } : r
        );
    }

    const newResumeData = {
        id: currentId,
        userId: user.userId,
        title: resumeTitle,
        sections,
        isRepresentative,
        isPublic,
        lastModified,
        status,
        type: 'written',
    };

    const existingIndex = allResumes.findIndex(r => r.id === currentId);
    if (existingIndex > -1) {
        allResumes[existingIndex] = newResumeData;
    } else {
        allResumes.push(newResumeData);
    }
    
    localStorage.setItem('resumes', JSON.stringify(allResumes));
    
    setTimeout(() => setIsSaving(false), 1000);
    return true;
  };

  const handleTemporarySave = () => {
    if (performSave('작성 중')) alert("이력서가 임시 저장되었습니다.");
  };

  const handleFinalSave = () => {
    if (performSave('작성 완료')) {
      alert("이력서 작성이 완료되었습니다!");
      navigate('/resumes');
    }
  };

  return (
    <>
      <ResumePreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={resumeTitle} user={user} sections={sections} sectionComponents={sectionComponents} />
      <div className="resume-editor-page">
        <main className="editor-main">
          <div className="editor-header">
            <input type="text" className="resume-title-input" placeholder="이력서 제목 입력" value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} />
            <div className="editor-actions">
              <button className="action-btn" onClick={() => setIsPreviewOpen(true)}><Eye size={16} /> 미리보기</button>
              <button className="action-btn" onClick={handleTemporarySave} disabled={isSaving}><Save size={16} /> 임시저장</button>
              <button className="action-btn primary" onClick={handleFinalSave} disabled={isSaving}>{isSaving ? '저장 중...' : '작성 완료'}</button>
            </div>
          </div>
          <div className="editor-content">
            {sections.length === 0 && <div className="editor-placeholder">오른쪽 팔레트에서 추가할 항목을 클릭하여 이력서 작성을 시작하세요.</div>}
            {sections.map(section => {
              const Comp = sectionComponents[section.type]?.component;
              const title = sectionComponents[section.type]?.title;
              if (!Comp) return null;
              return (
                <EditorSection key={section.id} title={title} onRemove={() => handleRemoveItem(section.id)}>
                  <Comp data={section.data} onUpdate={(updatedData) => handleSectionChange(section.id, updatedData)} />
                </EditorSection>
              );
            })}
          </div>
        </main>
        <div className="editor-sidebar">
            <ResumeStatusPalette 
                completeness={completeness}
                isRepresentative={isRepresentative}
                onRepChange={() => setIsRepresentative(prev => !prev)}
                isPublic={isPublic}
                onPublicChange={() => setIsPublic(prev => !prev)}
            />
            <EditorPalette onAddItem={handleAddItem} addedSections={sections.map(s => s.type)} />
        </div>
      </div>
    </>
  );
}

export default ResumeEditorPage;

