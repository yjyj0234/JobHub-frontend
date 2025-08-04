import React from 'react';
import './Card.css';

function Card({ data }) {
  return (
    <div className="card-container">
      <div className="card-inner">
        <div className="card-front">
          <div className="card-icon-wrapper">
            <span className="card-icon">{data.icon}</span>
          </div>
          <h3 className="card-name">{data.name}</h3>
          <p className="card-desc">{data.desc}</p>
        </div>
        <div className="card-back">
          <h3 className="card-name-back">{data.name}</h3>
          <p className="card-back-title">원하는 기술</p>
          <div className="skill-tags">
            {data.skills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
          <button className="apply-button">지원하기</button>
        </div>
      </div>
    </div>
  );
}

export default Card;