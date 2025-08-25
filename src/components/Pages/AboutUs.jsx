import React from 'react';
import '../css/AboutUs.css';
import { Building, MapPin, Users, Target } from 'lucide-react';

const AboutUs = () => {

  return (
    <div className="about-us-page">
      <header className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">WE ARE JOBHUB</h1>
          <p className="hero-subtitle">가능성을 연결하여 미래의 일자리를 만듭니다.</p>
        </div>
      </header>

      <main className="about-content">
        <section className="about-section vision-section">
          <div className="vision-card">
            <Target size={48} className="vision-icon" />
            <h2 className="section-title-special">우리의 비전</h2>
            <p className="section-text-special">
              JobHub는 단순한 채용 플랫폼을 넘어, 개인과 기업이 함께 성장하는 커리어 생태계를 구축합니다. 우리는 기술을 통해 모든 사람이 자신의 잠재력을 최대한 발휘할 수 있는 기회를 제공하고, 기업이 최고의 인재를 만나 혁신을 이룰 수 있도록 돕습니다.
            </p>
          </div>
        </section>

        <section className="about-section values-section">
           <h2 className="section-title">핵심 가치</h2>
           <div className="values-grid">
               <div className="value-item">
                   <Users size={32} />
                   <h3>사람 중심</h3>
                   <p>모든 결정의 중심에는 사람이 있습니다.</p>
               </div>
               <div className="value-item">
                   <Building size={32} />
                   <h3>끊임없는 혁신</h3>
                   <p>현실에 안주하지 않고 더 나은 방식을 찾습니다.</p>
               </div>
               <div className="value-item">
                   <MapPin size={32} />
                   <h3>투명한 소통</h3>
                   <p>신뢰를 바탕으로 솔직하고 개방적으로 소통합니다.</p>
               </div>
           </div>
        </section>
        
        <section className="about-section location-section">
          <h2 className="section-title">오시는 길</h2>
          <div className="location-card">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3165.233250882964!2d127.03702137644918!3d37.50122942800366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca3f70e7a2a7d%3A0x1d702d6b3346d1b7!2z7ZWc65-s7JWZ7J2M!5e0!3m2!1sko!2skr!4v1692791838122!5m2!1sko!2skr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="JobHub Location"
              ></iframe>
            </div>
            <div className="map-info">
              <h3>JobHub 오피스</h3>
              <p><MapPin size={16} /> 서울특별시 강남구 역삼동 테헤란로 132 한독약품빌딩 8층</p>
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=%ED%95%9C%EB%8F%85%EC%95%BD%ED%92%88%EB%B9%8C%EB%94%A9"
                target="_blank" 
                rel="noopener noreferrer" 
                className="map-link-button"
              >
                Google Maps로 길찾기
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutUs;