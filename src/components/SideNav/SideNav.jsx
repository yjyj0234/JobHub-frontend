import React, { useState, useEffect } from 'react';
import './SideNav.css';

function SideNav({ sections }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = sections.findIndex(sec => sec.ref.current === entry.target);
            setActiveIndex(index);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    sections.forEach(sec => sec.ref.current && observer.observe(sec.ref.current));
    return () => sections.forEach(sec => sec.ref.current && observer.unobserve(sec.ref.current));
  }, [sections]);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  return (
    <nav className="side-nav">
      <div className="side-nav-list">
        {sections.map((sec, index) => (
          <button
            key={sec.name}
            className={`side-nav-item ${activeIndex === index ? 'active' : ''}`}
            onClick={() => scrollToSection(sec.ref)}>
            {sec.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default SideNav;
