import React from 'react';
import './Hero.css';
import SearchBar from '../SearchBar/SearchBar.jsx';

function Hero({ sectionRef }) {
  return (
    <section ref={sectionRef} className="hero">
      <SearchBar />
      <h1 className="hero-title">
        당신의 가능성이<br />
        새로운 기회와 만나는 곳
      </h1>
      <p className="hero-subtitle">JobHub에서 당신의 커리어 여정을 새롭게 시작하세요.</p>
    </section>
  );
}

export default Hero;
