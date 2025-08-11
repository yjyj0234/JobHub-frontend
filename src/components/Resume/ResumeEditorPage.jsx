import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ResumeEditorPage.css';
import { Briefcase, GraduationCap, Award, Languages, Star, Link as LinkIcon, Trash2, Eye, Server, Save } from 'lucide-react';
import {ExperienceForm,EducationForm,ActivityForm,AwardForm,CertificationForm
  ,LanguageForm,PortfolioForm,ProjectForm,ResumePreviewModal} from './';
import { useAuth } from '../context/AuthContext.jsx';


const EditorSection = ({ title, onRemove, children }) => (
    <section className="editor-section">
      <div className="section-header">
        <h2>{title}</h2>
        <button className="delete-item-btn" onClick={onRemove}><Trash2 size={16} /> 삭제</button>
      </div>
      <div className="section-content">{children}</div>
    </section>
);

const EditorPalette = ({ onAddItem }) => {
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
        {allItems.map(item => (
          <button key={item.id} className="palette-item" onClick={() => onAddItem(item.id)}>
            {item.icon}<span>{item.name}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

function ResumeEditorPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // AuthContext에서 사용자 정보 가져오기
  const [sections, setSections] = useState([]);
  const [resume, setResume] = useState({ title: '' });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sectionComponents = {
    experiences: { title: '경력', component: ExperienceForm },
    educations: { title: '학력', component: EducationForm },
    activities: { title: '활동', component: ActivityForm },
    awards: { title: '수상', component: AwardForm },
    certifications: { title: '자격증', component: CertificationForm },
    languages: { title: '언어', component: LanguageForm },
    portfolios: { title: '포트폴리오', component: PortfolioForm },
    projects: { title: '프로젝트', component: ProjectForm },
  };

  const handleAddItem = (itemType) => {
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

  const handleSave = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
     if (!resume.title.trim()) {
        alert("이력서 제목을 입력해주세요.");
        return;
    }

    setIsSaving(true);

    // localStorage에서 기존 이력서 목록을 가져옵니다.
    const allResumes = JSON.parse(localStorage.getItem('resumes') || '[]');

    const newResume = {
      id: Date.now(),
      userId: user.userId, // 현재 사용자 ID 추가
      title: resume.title,
      sections,
      isRepresentative: false,
      lastModified: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      status: '작성 완료',
      type: 'written',
    };

    // 새로운 이력서를 추가하여 다시 저장합니다.
    localStorage.setItem('resumes', JSON.stringify([...allResumes, newResume]));

    setTimeout(() => {
        setIsSaving(false);
        alert("이력서가 성공적으로 저장되었습니다!");
        navigate('/resumes');
    }, 1000);
  };

  return (
    <>
      <ResumePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={resume.title}
        sections={sections}
        sectionComponents={sectionComponents}
      />
      <div className="resume-editor-page">
        <main className="editor-main">
          <div className="editor-header">
            <input
              type="text"
              className="resume-title-input"
              placeholder="이력서 제목 입력"
              value={resume.title}
              onChange={(e) => setResume(prev => ({ ...prev, title: e.target.value }))}
            />
            <div className="editor-actions">
              <button className="action-btn" onClick={() => setIsPreviewOpen(true)}><Eye size={16} /> 미리보기</button>
              <button className="action-btn primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? '저장 중...' : <><Save size={16} /> 작성 완료</>}
              </button>
            </div>
          </div>
          <div className="editor-content">
            <section className="editor-section"><h2>기본 정보</h2></section>
            {sections.map(section => {
              const Comp = sectionComponents[section.type]?.component;
              const title = sectionComponents[section.type]?.title;
              if (!Comp) return null;
              return (
                <EditorSection key={section.id} title={title} onRemove={() => handleRemoveItem(section.id)}>
                  <Comp
                    data={section.data}
                    onUpdate={(updatedData) => handleSectionChange(section.id, updatedData)}
                  />
                </EditorSection>
              );
            })}
          </div>
        </main>
        <EditorPalette onAddItem={handleAddItem} />
      </div>
    </>
  );
}

export default ResumeEditorPage;