import React from 'react';
import Card from '../UI/Card.jsx';
import '../../css/TopGrid.css';

const top100Data = [
  { icon: '🥇', name: '네이버', desc: '국내 No.1 검색 포털', skills: ['AI', 'Big Data', 'Frontend'], talent: '세상을 바꾸는 인재' },
  { icon: '🥈', name: '카카오', desc: '사람과 기술로 만드는 더 나은 세상', skills: ['Mobile', 'Backend', 'Fintech'], talent: '소통을 중시하는 인재' },
  { icon: '🥉', name: '쿠팡', desc: '고객의 삶을 획기적으로 바꾸는 이커머스', skills: ['Logistics', 'SCM', 'Java'], talent: '문제 해결 능력이 뛰어난 인재' },
  { icon: '🏢', name: '삼성전자', desc: '초일류 기술로 미래를 창조', skills: ['Semiconductor', 'Hardware', 'IoT'], talent: '글로벌 감각을 갖춘 인재' },
  { icon: '🚗', name: '현대자동차', desc: '스마트 모빌리티 솔루션 프로바이더', skills: ['EV', 'Robotics'], talent: '도전 정신이 강한 인재' },
  { icon: '✈️', name: '대한항공', desc: '세계 항공업계를 선도하는 글로벌 항공사', skills: ['Service', 'Global', 'Logistics'], talent: '고객 만족을 최우선으로 하는 인재' },
];

function TopGrid({ sectionRef }) {
  return (
    <section ref={sectionRef} className="top100-grid-section">
      <h2 className="top100-grid-title">🏆 TOP 10</h2>
      <div className="top100-grid">
        {top100Data.map((company, index) => (
          <Card key={index} data={company} />
        ))}
      </div>
    </section>
  );
}

export default TopGrid;
