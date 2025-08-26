import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/InviteList.css";

axios.defaults.withCredentials = true;
const API = "http://localhost:8080";

function statusFromRoomName(roomName) {
  if (!roomName) return "알 수 없음";
  if (roomName.startsWith("INVITE:")) return "대기중";
  if (roomName.startsWith("DM:")) return "대화중";
  return "알 수 없음";
}

export default function InterviewRooms() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    axios.get(`${API}/chat/invites/my`, { withCredentials: true })
      .then(res => {
        if (!alive) return;
        setList(Array.isArray(res.data) ? res.data : []);
      })
      .catch(e => {
        if (!alive) return;
        setErr(e.response?.data?.message || e.response?.data || e.message);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const enter = (id) => navigate(`/group-chat/rooms/${id}`);
  const goBack = () => navigate(-1);

  if (loading) return <div className="loading-message">불러오는 중…</div>;
  
  if (err) return <div className="error-message">에러: {err}</div>;

  return (
    <div className="invite-list-container">
      <div className="header-section" style={{position: 'relative'}}>
        <h2 className="invite-list-title">면접제의 채팅방 목록</h2>
        <button className="goback-btn" onClick={goBack}>
          뒤로가기
        </button>
      </div>
      
      {list.length === 0 && (
        <div className="empty-message">
          면접 전용 채팅방이 없습니다.
        </div>
      )}
      
      <ul className="room-list">
        {list.map(r => (
          <li key={r.id} className="room-item" onClick={() => enter(r.id)}>
            <div className="room-content">
              <div className="room-info">
                <div className="room-name">
                  면접제의 {r.roomName}
                </div>
                <div className="room-meta">
                  <span className={`status-badge ${statusFromRoomName(r.roomName) === '대기중' ? 'pending' : 'active'}`}>
                    {statusFromRoomName(r.roomName)}
                  </span>
                  <span>•</span>
                  <span>인원 {r.memberCount}명</span>
                </div>
                {r.lastMessage && (
                  <div className="last-message">
                    <span className="last-message-label">최근 메시지:</span> {r.lastMessage}
                  </div>
                )}
              </div>
              <button 
                className="enter-button"
                onClick={(e) => {
                  e.stopPropagation();
                  enter(r.id);
                }}
              >
                입장
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}