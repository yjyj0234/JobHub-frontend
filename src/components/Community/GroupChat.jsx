import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../css/GroupChat.css';
axios.defaults.withCredentials = true;

export default function GroupChat() {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMyRooms, setShowMyRooms] = useState(false);
  const navigate = useNavigate();

  //전체 방목록 불러오기
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get("http://localhost:8080/group-chat/rooms/explore");
        setRooms(data ?? []);
      } catch (err) {
        setError('채팅방 목록을 불러오지 못했습니다.');
        console.error('채팅방 목록 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  //채팅방 목록 토글 불러오기(내가 참여한 방, 전체 방)
  const handleToggleRooms = async () => {
  setShowMyRooms(true);
  setLoading(true);
   try {
    if (showMyRooms) {
      // 현재 "내 방" → 전체 방으로 전환
      const { data } = await axios.get("http://localhost:8080/group-chat/rooms/explore");
      setRooms(data ?? []);
      setShowMyRooms(false);
    } else {
      // 현재 "전체 방" → 내 방으로 전환
      const { data } = await axios.get("http://localhost:8080/group-chat/rooms/my");
      setRooms(data ?? []);
      setShowMyRooms(true);
    }
  } catch (err) {
    setError(showMyRooms ? "전체 방 목록을 불러오지 못했습니다." : "내 방 목록을 불러오지 못했습니다.");
    console.error("방 목록 불러오기 실패:", err);
  } finally {
    setLoading(false);
  }
};

  const createRoom = async () => {
    if (!name.trim()) return;
    
    try {
      const { data } = await axios.post("http://localhost:8080/group-chat/rooms", {
        roomName: name,
      });
      setRooms(prev => [data, ...prev]);
      setName("");
    } catch (err) {
      alert('채팅방 생성에 실패했습니다.');
      console.error('채팅방 생성 실패:', err);
    }
  };

  const handleEnter = async (id) => {
    try { 
      await axios.post(`http://localhost:8080/group-chat/rooms/${id}/join`); 
    } catch (_) {}
    navigate(`/group-chat/rooms/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      try {
        await axios.delete(`http://localhost:8080/group-chat/rooms/${id}`);
        setRooms(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        alert('채팅방 삭제에 실패했습니다.');
        console.error('채팅방 삭제 실패:', err);
      }
    }
  };

  const goBack = () => navigate('/postlist');

  return (
    <div className="gc-page">
      <div className="gc-container">
        <header className="gc-header">
          <h1 className="gc-title">오픈그룹 채팅방</h1>
          <div className="gc-actions">
            <button type="button" className="gc-back-btn" onClick={goBack}>
              게시판 목록
            </button>
            <button type="button" className="my-room-btn" onClick={handleToggleRooms}>
              {showMyRooms ? "모든 채팅방" : "나의 채팅방"}
            </button>
          </div>
        </header>

        <section className="gc-create-section">
          <div className="gc-create-form">
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="채팅방 이름을 입력하세요" 
              className="gc-room-input"
              onKeyPress={(e) => e.key === 'Enter' && createRoom()}
            />
            <button 
              type="button" 
              onClick={createRoom} 
              disabled={!name.trim()}
              className="gc-create-btn"
            >
              채팅방 생성
            </button>
          </div>
        </section>

        {loading && <div className="gc-loading" aria-live="polite">불러오는 중…</div>}
        {error && <div className="gc-error" role="alert">{error}</div>}

        {!loading && !error && (
          <section className="gc-rooms-section">
            <h2 className="gc-rooms-title">
              {showMyRooms ? "내가 참여하고 있는 채팅방" : "전체 채팅방"}
            </h2>
            {rooms.length === 0 ? (
              <div className="gc-empty">생성된 채팅방이 없습니다</div>
            ) : (
              <ul className="gc-rooms-list">
                {rooms.map(room => (
                  <li key={room.id} className="gc-room-card">
                    <button
                      type="button"
                      onClick={() => handleEnter(room.id)}
                      className="gc-room-content"
                    >
                      <div className="gc-room-header">
                        <h3 className="gc-room-name">{room.roomName}</h3>
                        {room.isOwner && (
                          <span className="gc-owner-badge" style={{backgroundColor: '#6c757d', color: '#f8f9fa'}}>방장</span>
                        )}
                      </div>
                      <div className="gc-room-info">
                        <span className="gc-member-count">멤버 {room.memberCount}명</span>
                        {room.lastMessage && (
                          <p className="gc-last-message">{room.lastMessage}</p>
                        )}
                      </div>
                    </button>
                    {room.isOwner && (
                      <button
                        type="button"
                        className="gc-delete-btn"
                        style={{backgroundColor: '#6c757d', color: '#f8f9fa'}}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(room.id);
                        }}
                      >
                        삭제
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
