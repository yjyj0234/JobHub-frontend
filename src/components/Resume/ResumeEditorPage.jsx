import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/ResumeEditorPage.css';
import {
  Briefcase, GraduationCap, Award, Languages, Star, Link as LinkIcon,
  Trash2, Eye, Server, Save, User, Phone, MapPin, Calendar, Heart, PlusCircle, X, Camera
} from 'lucide-react';
import {
  ExperienceForm, EducationForm, ActivityForm, AwardForm, CertificationForm,
  LanguageForm, PortfolioForm, SkillForm, ProjectForm, ResumePreviewModal
} from './index.js';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

// 1. 개인정보를 표시하고 수정할 헤더 컴포넌트
const ProfileHeader = ({ profile, onUpdate }) => {
  const fileInputRef = useRef(null);

  if (!profile) {
    return <div className="profile-header loading">프로필 정보 로딩 중...</div>;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate({ ...profile, [name]: value });
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...profile, profileImageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-header">
      <div className="profile-photo-edit-wrapper" onClick={handlePhotoClick}>
        <div className="profile-photo-wrapper">
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt={profile.name} className="profile-photo" />
          ) : (
            <div className="profile-photo-placeholder"><User size={40} /></div>
          )}
          <div className="photo-edit-icon">
            <Camera size={16} />
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handlePhotoChange}
          accept="image/*"
        />
      </div>
      <div className="profile-details">
        <input 
          type="text"
          name="name"
          className="profile-name-input"
          value={profile.name || ''}
          onChange={handleChange}
          placeholder="이름"
        />
        <input
          type="text"
          name="headline"
          className="profile-headline-input"
          value={profile.headline || ''}
          onChange={handleChange}
          placeholder="한 줄 소개를 작성해주세요."
        />
        <div className="profile-info-grid">
            <div className="profile-info-item">
                <Phone size={14} />
                <input type="text" name="phone" value={profile.phone || ''} onChange={handleChange} placeholder="연락처"/>
            </div>
            <div className="profile-info-item">
                <MapPin size={14} />
                <input type="text" name="address" value={profile.address || ''} onChange={handleChange} placeholder="주소"/>
            </div>
            <div className="profile-info-item">
                <Heart size={14} />
                <input type="text" name="gender" value={profile.gender || ''} onChange={handleChange} placeholder="성별"/>
            </div>
            <div className="profile-info-item">
                <Calendar size={14} />
                <input type="number" name="age" value={profile.age || ''} onChange={handleChange} placeholder="나이" className="age-input"/>
            </div>
        </div>
      </div>
    </div>
  );
};

// 2. 이력서 상태를 보여주는 오른쪽 팔레트
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

// 3. 항목을 추가하는 오른쪽 팔레트
const EditorPalette = ({ onAddItem }) => {
  const allItems = [
    { id: "experiences", name: "경력", icon: <Briefcase size={20} /> },
    { id: "educations", name: "학력", icon: <GraduationCap size={20} /> },
    { id: "skills", name: "기술", icon: <Server size={20} /> },
    { id: "projects", name: "프로젝트", icon: <Server size={20} /> },
    { id: "activities", name: "대외활동", icon: <Award size={20} /> },
    { id: "awards", name: "수상", icon: <Award size={20} /> },
    { id: "certifications", name: "자격증", icon: <Award size={20} /> },
    { id: "languages", name: "외국어", icon: <Languages size={20} /> },
    { id: "portfolios", name: "포트폴리오", icon: <LinkIcon size={20} /> },
  ];

  return (
    <aside className="editor-palette">
      <h3>항목 추가</h3>
      <div className="palette-grid">
        {allItems.map((item) => {
          const isAdded = addedSections.includes(item.id);
          return (
            <button
              key={item.id}
              className={`palette-item ${isAdded ? "disabled" : ""}`}
              onClick={() => onAddItem(item.id)}
              disabled={isAdded}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
        ))}
      </div>
    </aside>
  );
};

function ResumeEditorPage() {
  const navigate = useNavigate();
  const { resumeId: resumeParam } = useParams(); // ✅ 라우트에서만 ID 읽기
  const resumeId = resumeParam ? Number(resumeParam) : null; // 숫자화
  const { user } = useAuth();
  
  const [userProfile, setUserProfile] = useState(null);
  const [sections, setSections] = useState([]);
  const [resumeTitle, setResumeTitle] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRepresentative, setIsRepresentative] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const sectionComponents = {
    experiences: { title: "경력", component: ExperienceForm },
    educations: { title: "학력", component: EducationForm },
    skills: { title: "기술", component: SkillForm },
    activities: { title: "대외활동", component: ActivityForm }, // 서버 CRUD 폼 (편집 모드에서만 서버)
    awards: { title: "수상 경력", component: AwardForm },
    certifications: { title: "자격증", component: CertificationForm },
    languages: { title: "외국어", component: LanguageForm },
    portfolios: { title: "포트폴리오", component: PortfolioForm },
    projects: { title: "프로젝트", component: ProjectForm },
  };

  // (선택) 로컬 초안 복원: 새로운 작성에도 계속 이어서 쓸 수 있게
  useEffect(() => {
    if (user && user.userId) {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/profile/${user.userId}`);
                setUserProfile(response.data);
            } catch (error) {
                console.error("사용자 프로필을 불러오는 데 실패했습니다.", error);
                setUserProfile({ name: user.email, headline: '프로필 정보 없음' });
            }
        };
        fetchUserProfile();
    }
  }, [user]);

  const completeness = useMemo(() => 50, []); // 임시 완성도

  const handleAddItem = (sectionType) => {
    const existingSection = sections.find(s => s.type === sectionType);
    if (existingSection) {
      handleAddItemToSection(existingSection.id, sectionType);
    } else {
      setSections(prev => [
        ...prev,
        {
          id: `${sectionType}-${Date.now()}`,
          type: sectionType,
          data: [{ subId: `${sectionType}-item-${Date.now()}` }] 
        }
      ]);
    }
  };

  const handleRemoveSection = (sectionId) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const handleAddItemToSection = (sectionId, sectionType) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, data: [...s.data, { subId: `${sectionType}-item-${Date.now()}` }] };
      }
      return s;
    }));
  };

  const handleRemoveItemFromSection = (sectionId, subId) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        if (s.data.length === 1) return null;
        return { ...s, data: s.data.filter(item => item.subId !== subId) };
      }
      return s;
    }).filter(Boolean));
  };

  const handleItemChange = (sectionId, subId, updatedData) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, data: s.data.map(item => item.subId === subId ? { ...item, ...updatedData } : item) };
      }
      return s;
    }));
  };
  
  const handleProfileChange = (updatedProfile) => {
      setUserProfile(updatedProfile);
  }

  const handleFinalSave = async () => {
    if (!user) return alert("로그인이 필요합니다.");
    if (!resumeTitle.trim()) return alert("이력서 제목을 입력해주세요.");

    setIsSaving(true);
    try {
      if (!resumeId) {
        // (신규 작성) 작성 완료 시에만 INSERT
        const { data } = await axios.post("/resumes", buildResumePayload(), {
          withCredentials: true,
        });
        const createdId = typeof data === "number" ? data : Number(data?.id);
        if (!createdId) throw new Error("생성된 이력서 ID가 없습니다.");

        // 활동 일괄 업로드
        await postActivitiesBulk(createdId);

        // 드래프트 비우고 편집 페이지로 이동
        localStorage.removeItem("resume_draft");
        navigate(`/resumes/${createdId}/edit`);
        alert("이력서 작성이 완료되었습니다!");
      } else {
        // (편집 모드) 기본 정보만 갱신
        await axios.put(`/resumes/${resumeId}`, buildResumePayload(), {
          withCredentials: true,
        });
        alert("이력서가 저장되었습니다.");
      }
    } catch (err) {
      console.error("[FinalSave] error:", err);
      const s = err?.response?.status;
      alert(
        err?.response?.data?.message ||
          (s === 401
            ? "로그인이 필요해요."
            : s === 403
            ? "권한이 없어요."
            : "저장 중 오류가 발생했어요.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ResumePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={resumeTitle}
        user={user}
        sections={sections}
        sectionComponents={sectionComponents}
      />

      <div className="resume-editor-page">
        <main className="editor-main">
          <ProfileHeader profile={userProfile} onUpdate={handleProfileChange} />

          <div className="editor-header">
            <input
              type="text"
              className="resume-title-input"
              placeholder="이력서 제목 입력"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
            />
            <div className="editor-actions">
              <button
                className="action-btn"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye size={16} /> 미리보기
              </button>
              <button
                className="action-btn"
                onClick={handleTemporarySave}
                disabled={isSaving}
              >
                <Save size={16} /> 임시저장
              </button>
              <button
                className="action-btn primary"
                onClick={handleFinalSave}
                disabled={isSaving}
              >
                {isSaving ? "저장 중..." : "작성 완료"}
              </button>
            </div>
          </div>

          <div className="editor-content">
            {sections.length === 0 && <div className="editor-placeholder">오른쪽 팔레트에서 추가할 항목을 클릭하여 이력서 작성을 시작하세요.</div>}
            
            {sections.map(section => {
              const Comp = sectionComponents[section.type]?.component;
              const title = sectionComponents[section.type]?.title;
              if (!Comp) return null;

              return (
                <section key={section.id} className="editor-section">
                  <div className="section-header">
                    <h2>{title}</h2>
                    <button className="delete-item-btn" onClick={() => handleRemoveSection(section.id)}>
                      <Trash2 size={16} /> 항목 전체 삭제
                    </button>
                  </div>
                  <div className="section-content">
                    {section.data.map((item) => (
                      <div key={item.subId} className="item-form-wrapper">
                        <Comp
                          data={item}
                          onUpdate={(updatedData) => handleItemChange(section.id, item.subId, updatedData)}
                        />
                        <button className="remove-item-btn" onClick={() => handleRemoveItemFromSection(section.id, item.subId)}>
                            <X size={16}/>
                        </button>
                      </div>
                    ))}
                    <button className="add-item-btn" onClick={() => handleAddItemToSection(section.id, section.type)}>
                      <PlusCircle size={16} /> {title} 추가
                    </button>
                  </div>
                </section>
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
            <EditorPalette onAddItem={handleAddItem} />
        </div>
      </div>
    </>
  );
}

export default ResumeEditorPage;
