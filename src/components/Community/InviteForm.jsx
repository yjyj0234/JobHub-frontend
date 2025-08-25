import React, { useState } from "react";
import axios from "axios";
import "../css/InviteForm.css";

axios.defaults.withCredentials = true; // 쿠키 인증 사용
const API = "http://localhost:8080";

export default function InviteFormCompany() {
  const [targetUserId, setTargetUserId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetUserId) {
      setError("지원자의 ID를 입력해주세요");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await axios.post(
        `${API}/chat/invites`,
        { targetUserId: Number(targetUserId), message },
        { withCredentials: true }
      );
      setResult(data);
      setMessage("");
      // 필요 시: 초대 방 상세로 이동하거나, 토스트 띄우기
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || e.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-form-container">
      <h3 className="invite-form-title">면접 제안 보내기</h3>
      
      <form onSubmit={handleSubmit} className="invite-form">
        <div className="form-group">
          <label>대상 USER ID: </label>
          <input
            type="number"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="예: 12"
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>메시지(선택): </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="면접 제안 메시지를 입력해주세요..."
            className="form-textarea"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="submit-button"
        >
          {loading ? "보내는 중..." : "초대 보내기"}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <strong>오류:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="success-message">
          <h4 className="success-title">✅ 초대 생성 완료</h4>
          <div className="result-grid">
            <div><strong>방 ID:</strong> {result.roomId}</div>
            <div><strong>초대자 ID:</strong> {result.inviterId}</div>
            <div><strong>초대받은자 ID:</strong> {result.inviteeId}</div>
            <div><strong>상태:</strong> <span className="status-badge">{result.status}</span></div>
            <div><strong>생성일:</strong> {new Date(result.createdAt).toLocaleString('ko-KR')}</div>
          </div>
        </div>
      )}
    </div>
  );
}