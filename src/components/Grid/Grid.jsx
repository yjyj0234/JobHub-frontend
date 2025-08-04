import React from 'react';
import Card from '../Card/Card.jsx';
import './Grid.css';

const companyData = [
  { icon: '🏢', name: 'JobHub 솔루션', desc: '클라우드 기반 채용 솔루션', skills: ['React', 'Node.js', 'AWS', 'Docker'] },
  { icon: '🚀', name: '스페이스로직', desc: 'AI 우주 탐사 데이터 분석', skills: ['Python', 'TensorFlow', 'Kubernetes'] },
  { icon: '🎨', name: '크리에이티브 디자인', desc: '사용자 경험 중심 에이전시', skills: ['UI/UX Design', 'Figma', 'Sketch'] },
  { icon: '🔒', name: '시큐어테크', desc: '차세대 사이버 보안 기술', skills: ['C++', 'Rust', 'Cryptography'] },
  { icon: '🎮', name: '플레이게임즈', desc: '몰입형 모바일 게임 개발', skills: ['Unity', 'C#', 'Mobile Dev'] },
  { icon: '📊', name: '데이터 인사이트', desc: '빅데이터 분석 및 시각화', skills: ['Python', 'SQL', 'Tableau'] },
];

function Grid({ sectionRef }) {
  return (
    <section ref={sectionRef} className="grid-section">
      <h2 className="grid-title">✨ 추천 기업</h2>
      <div className="grid">
        {companyData.map((company, index) => (
          <Card key={index} data={company} />
        ))}
      </div>
    </section>
  );
}

export default Grid;