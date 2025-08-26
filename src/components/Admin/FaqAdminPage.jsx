import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, ChevronDown, Trash2, Edit, Save, X } from "lucide-react";
import "../css/FaqAdminPage.css";

const API_BASE_URL = "http://3.39.250.64:8080/api/faqs";

// 기본 카테고리 목록을 정의합니다.
const DEFAULT_CATEGORIES = ["계정", "결제", "이용방법", "오류", "기타"];

function FaqAdminPage() {
  const [faqs, setFaqs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newFaq, setNewFaq] = useState({
    category: "",
    title: "",
    content: "",
  });
  // 직접 입력을 위한 상태 추가
  const [customCategory, setCustomCategory] = useState("");
  const [editingFaq, setEditingFaq] = useState(null);

  // 기본 카테고리와 서버에서 불러온 카테고리를 합쳐서 중복을 제거한 목록을 만듭니다.
  const uniqueCategories = [
    ...new Set([...DEFAULT_CATEGORIES, ...faqs.map((faq) => faq.category)]),
  ];

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setFaqs(response.data);
    } catch (error) {
      console.error("FAQ 로딩 실패:", error);
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    // '직접 입력'을 선택하면 customCategory 상태를 초기화합니다.
    if (name === "category" && value !== "custom") {
      setCustomCategory("");
    }
    setNewFaq((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFaq = async () => {
    // '직접 입력'을 선택했는지 확인하고, 입력값이 있는지 검사합니다.
    const finalCategory =
      newFaq.category === "custom" ? customCategory : newFaq.category;

    if (!finalCategory || !newFaq.title || !newFaq.content) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    try {
      const response = await axios.post(API_BASE_URL, {
        ...newFaq,
        category: finalCategory, // 최종 카테고리 값으로 전송
      });
      setFaqs([...faqs, response.data]);
      // 폼 상태 초기화
      setNewFaq({ category: "", title: "", content: "" });
      setCustomCategory("");
      setIsAdding(false);
    } catch (error) {
      console.error("FAQ 추가 실패:", error);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (window.confirm("정말로 이 FAQ를 삭제하시겠습니까?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        setFaqs(faqs.filter((faq) => faq.id !== id));
      } catch (error) {
        console.error("FAQ 삭제 실패:", error);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingFaq((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateFaq = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${editingFaq.id}`,
        editingFaq
      );
      setFaqs(
        faqs.map((faq) => (faq.id === editingFaq.id ? response.data : faq))
      );
      setEditingFaq(null);
    } catch (error) {
      console.error("FAQ 수정 실패:", error);
    }
  };

  return (
    <div className="faq-admin-container">
      <div className="faq-admin-header">
        <h1>FAQ 관리</h1>
        <button onClick={() => setIsAdding(!isAdding)} className="add-faq-btn">
          <Plus size={20} /> 새로운 FAQ 작성
        </button>
      </div>

      {isAdding && (
        <div className="faq-add-form">
          <h3>새로운 FAQ 추가</h3>
          <div className="form-group">
            <label htmlFor="category-select">카테고리</label>
            <select
              id="category-select"
              name="category"
              value={newFaq.category}
              onChange={handleAddFormChange}
            >
              <option value="">-- 카테고리 선택 --</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              {/* 직접 입력을 위한 옵션 추가 */}
              <option value="custom">직접 입력...</option>
            </select>
          </div>

          {/* '직접 입력' 선택 시에만 나타나는 입력창 */}
          {newFaq.category === "custom" && (
            <div className="form-group">
              <label htmlFor="custom-category">새 카테고리명</label>
              <input
                id="custom-category"
                type="text"
                name="customCategory"
                placeholder="새로운 카테고리 이름을 입력하세요"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="faq-title">질문 (Title)</label>
            <input
              id="faq-title"
              type="text"
              name="title"
              placeholder="질문을 입력하세요"
              value={newFaq.title}
              onChange={handleAddFormChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="faq-content">답변 (Content)</label>
            <textarea
              id="faq-content"
              name="content"
              rows="4"
              placeholder="답변을 입력하세요"
              value={newFaq.content}
              onChange={handleAddFormChange}
            />
          </div>
          <div className="form-actions">
            <button onClick={handleAddFaq} className="btn-confirm">
              <Save size={18} /> 추가하기
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="btn-cancel"
            >
              <X size={18} /> 닫기
            </button>
          </div>
        </div>
      )}

      <div className="faq-list">
        {/* ... (FAQ 목록 렌더링 부분은 기존과 동일) ... */}
        {faqs.map((faq) => (
          <div key={faq.id} className="faq-item">
            <div
              className="faq-question"
              onClick={() => setActiveId(activeId === faq.id ? null : faq.id)}
            >
              <span className="faq-category">[{faq.category}]</span>
              <span>{faq.title}</span>
              <ChevronDown
                className={`chevron-icon ${activeId === faq.id ? "open" : ""}`}
              />
            </div>
            {activeId === faq.id && (
              <div className="faq-answer">
                {editingFaq && editingFaq.id === faq.id ? (
                  <div className="faq-edit-form">
                    <select
                      name="category"
                      value={editingFaq.category}
                      onChange={handleEditChange}
                    >
                      {uniqueCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="title"
                      value={editingFaq.title}
                      onChange={handleEditChange}
                    />
                    <textarea
                      name="content"
                      rows="5"
                      value={editingFaq.content}
                      onChange={handleEditChange}
                    />
                    <div className="edit-actions">
                      <button onClick={handleUpdateFaq} className="btn-confirm">
                        <Save size={16} /> 저장
                      </button>
                      <button
                        onClick={() => setEditingFaq(null)}
                        className="btn-cancel"
                      >
                        <X size={16} /> 취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{faq.content}</p>
                    <div className="faq-actions">
                      <button onClick={() => setEditingFaq(faq)}>
                        <Edit size={16} /> 수정
                      </button>
                      <button onClick={() => handleDeleteFaq(faq.id)}>
                        <Trash2 size={16} /> 삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FaqAdminPage;