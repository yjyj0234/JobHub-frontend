import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, ChevronDown, ChevronUp, Edit2, Trash2, Save, X, Loader } from 'lucide-react';
import '../css/FaqAdminPage.css';
import { useAuth } from '../context/AuthContext'; // 1. useAuth 훅 가져오기
import { useNavigate } from 'react-router-dom';   // 2. useNavigate 훅 가져오기

const API_BASE_URL = 'http://localhost:8080/api/service';

const FaqAdminPage = () => {
  const { user } = useAuth();       // 3. 로그인한 사용자 정보 가져오기
  const navigate = useNavigate(); // 4. 페이지 이동을 위한 navigate 함수 가져오기
  
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({ category: '', question: '', answer: '' });

  const newFaqFormRef = useRef(null);

  // --- 5. 사용자 권한 확인 로직 추가 ---
  useEffect(() => {
    // 로딩이 끝나고 사용자 정보가 확인되었을 때,
    // 만약 사용자의 role이 'ADMIN'이 아니면 접근을 차단합니다.
    if (user && user.role !== 'ADMIN') {
      alert('관리자만 접근할 수 있는 페이지입니다.');
      navigate('/', { replace: true }); // 홈페이지로 돌려보냅니다.
    }
  }, [user, navigate]);


  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/faqs`);
      setFaqs(response.data);
    } catch (err) {
      setError('FAQ 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 관리자일 경우에만 데이터를 가져옵니다.
    if (user && user.role === 'ADMIN') {
        fetchFaqs();
    } else if (user) {
        // 관리자가 아닌데 접근한 경우 로딩을 멈춥니다. (위의 useEffect가 리디렉션 처리)
        setLoading(false);
    }
  }, [user]);


  const toggleCreateForm = () => {
    setIsCreating(!isCreating);
    setFormData({ category: '', question: '', answer: '' });
    if (!isCreating) {
      setTimeout(() => newFaqFormRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category.trim() || !formData.question.trim() || !formData.answer.trim()) {
      alert('카테고리, 질문, 답변을 모두 입력해주세요.');
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/faqs`, formData);
      setFaqs([...faqs, response.data]);
      toggleCreateForm();
    } catch (err) {
      alert('FAQ 생성에 실패했습니다.');
      console.error(err);
    }
  };
  
  const handleEditStart = (faq) => {
    setEditingId(faq.id);
    setFormData({ category: faq.category, question: faq.question, answer: faq.answer });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setFormData({ category: '', question: '', answer: '' });
  };

  const handleUpdateSubmit = async (e, id) => {
    e.preventDefault();
     if (!formData.category.trim() || !formData.question.trim() || !formData.answer.trim()) {
      alert('카테고리, 질문, 답변을 모두 입력해주세요.');
      return;
    }
    try {
      const response = await axios.put(`${API_BASE_URL}/faqs/${id}`, formData);
      setFaqs(faqs.map(faq => (faq.id === id ? response.data : faq)));
      handleEditCancel();
    } catch (err) {
      alert('FAQ 수정에 실패했습니다.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 FAQ를 삭제하시겠습니까?')) {
      try {
        await axios.delete(`${API_BASE_URL}/faqs/${id}`);
        setFaqs(faqs.filter(faq => faq.id !== id));
      } catch (err) {
        alert('FAQ 삭제에 실패했습니다.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="faq-admin-container"><Loader className="spinner" /></div>;
  }
  
  // 관리자가 아닌 사용자는 아무것도 표시하지 않습니다 (곧 리디렉션될 것이므로).
  if (!user || user.role !== 'ADMIN') {
    return null; 
  }

  if (error) {
    return <div className="faq-admin-container"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="faq-admin-container">
      <header className="faq-admin-header">
        <h1>FAQ 관리</h1>
        <p>사용자들이 자주 묻는 질문을 관리하고 손쉽게 추가하세요.</p>
        <button className="add-faq-btn" onClick={toggleCreateForm}>
          <Plus size={20} /> 새 FAQ 추가하기
        </button>
      </header>

      {isCreating && (
        <div className="faq-create-form" ref={newFaqFormRef}>
          <h2>새 FAQ 작성</h2>
          <form onSubmit={handleCreateSubmit}>
            <div className="form-group">
              <label htmlFor="category">카테고리</label>
              <input
                id="category"
                name="category"
                type="text"
                placeholder="예: 계정, 결제, 이용방법"
                value={formData.category}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="question">질문</label>
              <input
                id="question"
                name="question"
                type="text"
                placeholder="질문을 입력하세요"
                value={formData.question}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="answer">답변</label>
              <textarea
                id="answer"
                name="answer"
                placeholder="답변을 입력하세요"
                value={formData.answer}
                onChange={handleFormChange}
                rows="5"
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={toggleCreateForm}>취소</button>
              <button type="submit" className="btn-submit">저장하기</button>
            </div>
          </form>
        </div>
      )}

      <div className="faq-list-container">
        {faqs.map((faq, index) => (
          <div key={faq.id} className="faq-item-admin">
            {editingId === faq.id ? (
              <form onSubmit={(e) => handleUpdateSubmit(e, faq.id)} className="faq-edit-form">
                <input
                  name="category"
                  type="text"
                  className="edit-input"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                />
                <input
                  name="question"
                  type="text"
                  className="edit-input"
                  value={formData.question}
                  onChange={handleFormChange}
                  required
                />
                <textarea
                  name="answer"
                  className="edit-textarea"
                  value={formData.answer}
                  onChange={handleFormChange}
                  rows="5"
                  required
                />
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={handleEditCancel}><X size={16}/> 취소</button>
                  <button type="submit" className="btn-submit"><Save size={16}/> 저장</button>
                </div>
              </form>
            ) : (
              <>
                <div role="button" tabIndex={0} className="faq-question-admin" onClick={() => setActiveIndex(activeIndex === index ? null : index)} onKeyDown={(e) => e.key === 'Enter' && setActiveIndex(activeIndex === index ? null : index)}>
                  <div className="faq-q-content">
                    <span className="faq-category-badge">{faq.category}</span>
                    <span>{faq.question}</span>
                  </div>
                  <div className="faq-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleEditStart(faq); }} className="action-btn"><Edit2 size={16} /> 수정</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(faq.id); }} className="action-btn btn-delete"><Trash2 size={16} /> 삭제</button>
                    {activeIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                {activeIndex === index && (
                  <div className="faq-answer-admin">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqAdminPage;