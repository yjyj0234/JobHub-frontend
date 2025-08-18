import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
axios.defaults.withCredentials = true;

export default function GroupChat() {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await axios.get("http://localhost:8080/group-chat/rooms/explore");
      setRooms(data ?? []);
    })();
  }, []);

  const createRoom = async () => {
    const { data } = await axios.post("http://localhost:8080/group-chat/rooms", {
      roomName: name,
    });
    setRooms(prev => [data, ...prev]);
    setName("");
  };

  const handleEnter = async (id) => {
  // 미리 join해서 내 목록에도 바로 반영되게 할 수 있음 (옵션)
  try { await axios.post(`http://localhost:8080/group-chat/rooms/${id}/join`); } catch (_) {}
  navigate(`/group-chat/rooms/${id}`);
};

  return (
    <div>
      <h3>내 채팅방</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="방 이름" />
        <button onClick={createRoom} disabled={!name.trim()}>생성</button>
      </div>
      <ul>
        {rooms.map(r => (
          <li key={r.id} style={{ cursor: "pointer" }} onClick={() => handleEnter(r.id)}>
            {r.roomName} ({r.memberCount}) {r.lastMessage ? `- ${r.lastMessage}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
