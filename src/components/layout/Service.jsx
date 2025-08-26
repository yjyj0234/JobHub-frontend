import React, { useState, useEffect } from 'react';
import '../css/Service.css'; 
import { Search, ChevronDown, ChevronUp, Phone, MessageSquare, Building } from 'lucide-react';
import axios from 'axios'; // axios를 임포트합니다.

const FaqItem = ({ faq, index, activeIndex, setActiveIndex }) => {
  const isActive = index === activeIndex;

  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setActiveIndex(isActive ? null : index)}>
        <span>{faq.question}</span>
        {isActive ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isActive && (
        <div className="faq-answer">
          <p>{faq.answer}</p>
        </div>
      )}
    </div>
  );
};

function Service() { 
  const [activeIndex, setActiveIndex] = useState(null);
  const [faqs, setFaqs] = useState([]); // FAQ 데이터를 저장할 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  // 컴포넌트가 처음 렌더링될 때 API를 호출합니다.
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 2단계에서 만든 백엔드 API 주소로 GET 요청을 보냅니다.
        const response = await axios.get('http://localhost:8080/api/service/faqs');
        
        // 성공적으로 데이터를 받아오면 faqs 상태를 업데이트합니다.
        setFaqs(response.data);

      } catch (e) {
        console.error('FAQ 데이터를 불러오는 데 실패했습니다.', e);
        setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchFaqs();
  }, []); // 빈 배열을 전달하여 한 번만 실행되도록 합니다.

  return (
    <div className="service-page">
      <div className="service-hero">
        {/* 히어로 섹션은 동일 */}
        <div className="service-hero-content">
          <h1>무엇을 도와드릴까요?</h1>
          <p>JobHub 이용에 궁금한 점이 있다면 언제든지 찾아주세요.</p>
          <div className="service-search-wrapper">
            <Search className="service-search-icon" size={22}/>
            <input type="text" placeholder="궁금한 점을 검색해보세요." />
          </div>
        </div>
      </div>
      <div className="service-container">
        <div className="service-main-content">
          <div className="service-section">
            <h2 className="service-section-title">자주 묻는 질문 (FAQ)</h2>
            <div className="faq-list">
              {/* 로딩 및 에러 상태에 따라 다른 UI를 보여줍니다. */}
              {loading && <p>데이터를 불러오는 중...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {!loading && !error && (
                faqs.map((faq, index) => (
                  <FaqItem
                    key={faq.id} // key는 DB의 고유 id를 사용합니다.
                    faq={faq}
                    index={index}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                  />
                ))
              )}
            </div>
          </div>
          {/* 이하 다른 섹션은 동일 */}
          <div className="service-section">
            <h2 className="service-section-title">다른 도움이 필요하신가요?</h2>
            <div className="service-help-grid">
              <div className="service-help-card">
                <MessageSquare size={32} />
                <h3>1:1 문의하기</h3>
                <p>답변까지 최대 24시간이 소요될 수 있습니다.</p>
                <button className="service-button">문의 접수</button>
              </div>
              <div className="service-help-card">
                <Phone size={32} />
                <h3>전화 상담</h3>
                <p>평일 10:00 ~ 18:00 (주말, 공휴일 제외)</p>
                <span className="service-phone-number">1588-1234</span>
              </div>
               <div className="service-help-card">
                <Building size={32} />
                <h3>공지사항</h3>
                <p>JobHub의 새로운 소식과 업데이트를 확인하세요.</p>
                <button className="service-button secondary">바로가기</button>
              </div>
            </div>
          </div>
           <div className="service-section service-company-info">
             <h2 className="service-section-title">JobHub 정보</h2>
             <ul>
                 <li><strong>대표자:</strong> 손현정</li>
                 <li><strong>사업자 등록번호:</strong> 010-7777-7777</li>
                 <li><strong>주소:</strong> 서울특별시 강남구 역삼동 테헤란로 132 한독약품빌딩 8층</li>
                 <li><strong>이메일:</strong> SonKing@jobhub.com</li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
}

export default Service;