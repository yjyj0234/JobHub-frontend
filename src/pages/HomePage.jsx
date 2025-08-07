import React, { useRef } from 'react';

// --- 경로 수정 ---
import Hero from '../components/UX/Hero.jsx';
import Grid from '../components/UX/Grid.jsx';
import TopGrid from '../components/UX/TopGrid.jsx';
import SideNav from '../layout/SideNav.jsx';
// --- 경로 수정 끝 ---

function HomePage() {
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const topgridRef = useRef(null);
  const sections = [
    { name: "소개", ref: heroRef },
    { name: "추천 기업", ref: gridRef },
    { name: "TOP10 기업", ref: topgridRef }
  ];

  return (
    <>
      <main>
        <Hero sectionRef={heroRef} />
        <Grid sectionRef={gridRef} />
        <TopGrid sectionRef={topgridRef} />
      </main>
      <SideNav sections={sections} />
    </>
  );
}

export default HomePage;