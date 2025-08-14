import React, { useState } from 'react';
import '../css/Form.css';
import '../css/Card.css';
import '../css/Modal.css';
import '../css/CoachingAI.css';

const CoachingAI = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetCompany: '',
    targetPosition: '',
    experience: '',
    strengths: '',
    weaknesses: '',
    motivation: ''
  });
  const [coachingResult, setCoachingResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // AI 코칭 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
      const mockResult = {
        analysis: {
          strengths: ['강력한 문제 해결 능력', '팀워크와 협업 능력', '지속적인 학습 의지'],
          improvements: ['구체적인 성과 수치 추가', '리더십 경험 강화', '기술적 전문성 부각'],
          keywords: ['문제해결', '협업', '혁신', '성과지향', '학습능력']
        },
        suggestions: [
          '각 경험에 구체적인 수치와 성과를 포함하세요 (예: 매출 20% 증가, 프로젝트 완료율 95%)',
          '리더십 경험을 더 구체적으로 기술하고, 팀 규모와 성과를 명시하세요',
          '기술적 전문성을 보여주는 구체적인 프로젝트나 기술 스택을 추가하세요',
          '지원 회사의 문화와 가치관에 맞는 경험을 강조하세요',
          '자기소개서 전체적인 흐름을 개선하여 일관성 있는 스토리를 만들어보세요'
        ],
        sampleAnswer: `저는 [회사명]에서 [직무]로 일하면서 [구체적인 성과]를 달성했습니다. 특히 [프로젝트명]에서 [구체적인 역할과 성과]를 통해 [기술/역량]을 향상시켰습니다. 이러한 경험을 바탕으로 [지원동기]를 가지고 귀사에 기여하고 싶습니다.`
      };
      
      setCoachingResult(mockResult);
      setIsLoading(false);
      setIsModalOpen(true);
    }, 2000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetCompany: '',
      targetPosition: '',
      experience: '',
      strengths: '',
      weaknesses: '',
      motivation: ''
    });
    setCoachingResult(null);
  };

  return (
    <div className="coaching-ai-container">
      <div className="coaching-header">
        <div className="coaching-icon-wrapper">
          <i className="coaching-icon">🤖</i>
        </div>
        <h1>AI 자소서 코칭</h1>
        <p>인공지능이 당신의 자소서를 분석하고 개선 방향을 제시합니다</p>
      </div>

      <div className="coaching-content">
        <div className="coaching-form-section">
          <div className="form-card">
            <h2>자소서 정보 입력</h2>
            <form onSubmit={handleSubmit} className="item-form">
              <div className="grid-layout">
                <div className="form-field">
                  <label htmlFor="name">이름</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="홍길동"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="targetCompany">지원 회사</label>
                  <input
                    type="text"
                    id="targetCompany"
                    name="targetCompany"
                    value={formData.targetCompany}
                    onChange={handleInputChange}
                    placeholder="예: 삼성전자"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="targetPosition">지원 직무</label>
                  <input
                    type="text"
                    id="targetPosition"
                    name="targetPosition"
                    value={formData.targetPosition}
                    onChange={handleInputChange}
                    placeholder="예: 프론트엔드 개발자"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="experience">주요 경험 및 성과</label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="지원 직무와 관련된 주요 경험, 프로젝트, 성과를 구체적으로 작성해주세요."
                    required
                  />
                  <div className="form-guide">
                    💡 구체적인 수치와 성과를 포함하면 더 좋은 분석 결과를 얻을 수 있습니다.
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="strengths">강점</label>
                  <textarea
                    id="strengths"
                    name="strengths"
                    value={formData.strengths}
                    onChange={handleInputChange}
                    placeholder="자신의 주요 강점을 작성해주세요."
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="weaknesses">개선하고 싶은 부분</label>
                  <textarea
                    id="weaknesses"
                    name="weaknesses"
                    value={formData.weaknesses}
                    onChange={handleInputChange}
                    placeholder="개선하고 싶은 부분이나 보완하고 싶은 역량을 작성해주세요."
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="motivation">지원 동기</label>
                  <textarea
                    id="motivation"
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    placeholder="해당 회사와 직무에 지원하게 된 동기를 작성해주세요."
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="reset-btn">
                  초기화
                </button>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? 'AI 분석 중...' : 'AI 코칭 시작'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="coaching-info-section">
          <div className="info-card">
            <h3>AI 코칭이 도와드릴 수 있는 것</h3>
            <ul>
              <li>✅ 자소서 내용 분석 및 강점 파악</li>
              <li>✅ 개선이 필요한 부분 식별</li>
              <li>✅ 효과적인 키워드 추천</li>
              <li>✅ 구체적인 개선 방향 제시</li>
              <li>✅ 지원 직무에 맞는 맞춤형 조언</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>좋은 자소서 작성 팁</h3>
            <div className="tip-item">
              <strong>구체적인 성과</strong>
              <p>수치와 결과를 포함하여 구체적으로 작성하세요</p>
            </div>
            <div className="tip-item">
              <strong>일관성 있는 스토리</strong>
              <p>전체적인 흐름이 자연스럽게 연결되도록 구성하세요</p>
            </div>
            <div className="tip-item">
              <strong>회사 맞춤형</strong>
              <p>지원 회사의 문화와 가치관을 반영하세요</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI 코칭 결과 모달 */}
      {isModalOpen && coachingResult && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content coaching-result-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setIsModalOpen(false)}>
              ×
            </button>
            
            <div className="result-header">
              <h2>AI 코칭 결과</h2>
              <p>{formData.name}님의 자소서 분석 결과입니다</p>
            </div>

            <div className="result-content">
              <div className="analysis-section">
                <h3>📊 분석 결과</h3>
                <div className="analysis-grid">
                  <div className="analysis-item">
                    <h4>강점</h4>
                    <div className="skill-tags">
                      {coachingResult.analysis.strengths.map((strength, index) => (
                        <span key={index} className="skill-tag strength-tag">{strength}</span>
                      ))}
                    </div>
                  </div>
                  <div className="analysis-item">
                    <h4>개선점</h4>
                    <div className="skill-tags">
                      {coachingResult.analysis.improvements.map((improvement, index) => (
                        <span key={index} className="skill-tag improvement-tag">{improvement}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="suggestions-section">
                <h3>💡 개선 제안</h3>
                <ol className="suggestions-list">
                  {coachingResult.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ol>
              </div>

              <div className="keywords-section">
                <h3>🔑 추천 키워드</h3>
                <div className="skill-tags">
                  {coachingResult.analysis.keywords.map((keyword, index) => (
                    <span key={index} className="skill-tag keyword-tag">{keyword}</span>
                  ))}
                </div>
              </div>

              <div className="sample-section">
                <h3>📝 예시 답안</h3>
                <div className="sample-answer">
                  {coachingResult.sampleAnswer}
                </div>
              </div>
            </div>

            <div className="result-actions">
              <button onClick={() => setIsModalOpen(false)} className="close-btn">
                닫기
              </button>
              <button onClick={resetForm} className="new-analysis-btn">
                새로운 분석 시작
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachingAI;
