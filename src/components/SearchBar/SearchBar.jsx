import React from 'react';
import './SearchBar.css';

function SearchBar() {
  return (
    <div className="search-bar">
      <span role="img" aria-label="search-icon" className="search-icon">🔍</span>
      <input type="text" placeholder="어떤 기업을 찾고 계신가요?" />
      <button className="search-button">검색</button>
    </div>
  );
}

export default SearchBar;