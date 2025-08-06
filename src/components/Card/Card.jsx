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
          <h3 className="card-name">{data.name}</h3>
          <div className="card-details">
            <h4>요구 기술</h4>
            <div className="skills">
              {data.skills.map((skill) => (<span key={skill} className="skill-tag">{skill}</span>))}
            </div>
            <h4>원하는 인재상</h4>
            <p>{data.talent}</p>
          </div>
          <button className="details-button">자세히 보기</button>
        </div>
      </div>
    </div>
  );
}

export default Card;
