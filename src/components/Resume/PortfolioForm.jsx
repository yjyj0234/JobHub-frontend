import React, { useState } from 'react';
import '../css/Form.css';

function PortfolioForm({ data, onUpdate }) {
  const [formData, setFormData] = useState(data || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  return (
    <div className="item-form">
      <div className="grid-layout">
        <div className="form-field full-width">
          <label htmlFor="portfolioUrl">URL</label>
          <input
            type="url"
            id="portfolioUrl"
            name="url"
            value={formData.url || ''}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>
        <div className="form-field full-width">
          <label htmlFor="portfolioDesc">설명</label>
          <textarea
            id="portfolioDesc"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="포트폴리오에 대한 간단한 설명을 입력하세요."
          />
        </div>
      </div>
    </div>
  );
}
export default PortfolioForm;