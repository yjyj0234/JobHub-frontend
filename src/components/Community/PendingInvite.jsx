import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/PendingInvite.css";

axios.defaults.withCredentials = true;
const API = "http://localhost:8080";

export default function PendingInvites() {
  const navigate = useNavigate();
  const [list, setList]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]     = useState(null);
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await axios.get(`${API}/chat/invites/me/pending`, {
        withCredentials: true,
      });
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || e.message;
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const accept = async (roomId) => {
    setActing(true);
    try {
      const { data } = await axios.post(
        `${API}/chat/invites/accept`,
        { roomId, accept: true },
        { withCredentials: true }
      );
      // 목록에서 제거
      setList((prev) => prev.filter((x) => x.roomId !== roomId));
      // 필요 시 방으로 이동
      // navigate(`/group-chat/rooms/${roomId}`);
      alert("초대 수락 이제 대화 시작할 수 있습니다.");
    } catch (e) {
      alert(e.response?.data?.message || e.response?.data || e.message);
    } finally {
      setActing(false);
    }
  };

  const decline = async (roomId) => {
    setActing(true);
    try {
      const { data } = await axios.post(
        `${API}/chat/invites/decline`,
        { roomId, accept: false },
        { withCredentials: true }
      );
      setList((prev) => prev.filter((x) => x.roomId !== roomId));
      alert("초대를 거절하였습니다.");
    } catch (e) {
      alert(e.response?.data?.message || e.response?.data || e.message);
    } finally {
      setActing(false);
    }
  };

  const goBack = () => navigate('/postlist');

  if (loading) return <div className="loading-message">불러오는 중...</div>;
  if (err) return <div className="error-message">에러: {err}</div>;

  return (
    <div className="pending-invite-container">
      <div style={{position: 'relative'}}>
        <h3 className="pending-invite-title">내가 받은 면접제의</h3>
        <button type="button" className="goback-btn" onClick={goBack}>뒤로가기</button>
      </div>
      
      {list.length === 0 && (
        <div className="empty-message">
          대기중 초대가 없습니다.
        </div>
      )}

      <ul className="invite-list">
        {list.map((inv) => (
          <li key={inv.roomId} className="invite-item">
            <div className="invite-info">
              <div className="invite-info-row">
                <span className="invite-label">방 ID:</span>
                <span className="invite-value">{inv.roomId}</span>
              </div>
              <div className="invite-info-row">
                <span className="invite-label">초대자:</span>
                <span className="invite-value">  {(inv.inviterName || inv.inviterId)}</span>
              </div>
              <div className="invite-info-row">
                <span className="invite-label">상태:</span>
                <span className="invite-status">{inv.status}</span>
              </div>
              <div className="invite-info-row">
                <span className="invite-label">생성일:</span>
                <span className="invite-value">{new Date(inv.createdAt).toLocaleString('ko-KR')}</span>
              </div>
            </div>
            <div className="invite-actions">
              <button 
                className="accept-button"
                onClick={() => accept(inv.roomId)} 
                disabled={acting}
              >
                수락
              </button>
              <button
                className="decline-button"
                onClick={() => decline(inv.roomId)}
                disabled={acting}
              >
                거절
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}