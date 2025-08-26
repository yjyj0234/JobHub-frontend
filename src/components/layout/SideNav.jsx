import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SideNav.css';

function SideNav({ sections }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const scrollableSections = sections.filter(s => s.ref);
    if (!scrollableSections.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = sections.findIndex(sec => sec.ref && sec.ref.current === entry.target);
            if (index > -1) {
                setActiveIndex(index);
            }
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    scrollableSections.forEach(sec => sec.ref.current && observer.observe(sec.ref.current));
    return () => scrollableSections.forEach(sec => sec.ref.current && observer.unobserve(sec.ref.current));
  }, [sections]);

  const handleClick = (section) => {
    if (section.path) {
      navigate(section.path);
    } else if (section.ref) {
      section.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  return (
    <nav className="side-nav">
      <div className="side-nav-list">
        {sections.map((sec, index) => (
          <button
            key={sec.name}
            className={`side-nav-item ${!sec.path && activeIndex === index ? 'active' : ''}`}
            onClick={() => handleClick(sec)}>
            {sec.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default SideNav;