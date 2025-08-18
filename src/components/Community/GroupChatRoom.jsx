// src/components/GroupChatRoom.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs.js";
import { useParams } from "react-router-dom";

axios.defaults.withCredentials = true;

export default function GroupChatRoom() {
  const { roomId } = useParams();            // ✅ 라우트 파라미터로 받기
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const stompRef = useRef(null);
  const lastIdRef = useRef(null);

  // 히스토리 + (선행) join
  useEffect(() => {
    if (!roomId) return;
    (async () => {
      try {
        // ✅ 먼저 방 참가 (403 방지)
        await axios.post(`http://localhost:8080/group-chat/rooms/${roomId}/join`);
        const { data } = await axios.get(
          `http://localhost:8080/group-chat/rooms/${roomId}/messages`
        );
        setMessages(data ?? []);
        if (data?.length) lastIdRef.current = data[data.length - 1].id;
      } catch (e) {
        console.error(e);
        if (e?.response?.status === 401) setError("로그인이 필요합니다.");
        else if (e?.response?.status === 403) setError("이 방에 접근 권한이 없습니다.");
        else setError("메시지 로딩에 실패했습니다.");
      }
    })();
  }, [roomId]);

  // STOMP 연결
  useEffect(() => {
    if (!roomId) return;

    // ✅ (옵션) 쿠키 전달이 필요한 환경이면 transportOptions로 withCredentials 지정
    const sock = new SockJS("http://localhost:8080/ws", null, {
      transportOptions: {
        xhrStream: { withCredentials: true },
        xhrPolling: { withCredentials: true },
      },
    });

    const client = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 3000,
      // (옵션) heartbeat도 필요하면 설정
      // heartbeatIncoming: 10000,
      // heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe(`/topic/rooms/${roomId}`, (frame) => {
          const msg = JSON.parse(frame.body);
          setMessages((prev) => [...prev, msg]);
          lastIdRef.current = msg.id;
        });
      },
      onStompError: (frame) => {
        console.error("Broker error:", frame.headers["message"], frame.body);
      },
    });

    client.activate();
    stompRef.current = client;
    return () => client.deactivate();
  }, [roomId]);

  const send = () => {
    const text = input.trim();
    if (!text || !stompRef.current || !stompRef.current.connected) return;

    const body = JSON.stringify({ roomId: Number(roomId), message: text });

    // ✅ 목적지는 /app (컨트롤러 @MessageMapping에 매핑됨)
    stompRef.current.publish({
      destination: `/app/rooms/${roomId}/send`,
      body,
    });
    setInput("");
  };

  if (!roomId) return <div>잘못된 경로입니다.</div>;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h3>Room #{roomId}</h3>
      {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
      <div style={{ border: "1px solid #ddd", padding: 12, height: 360, overflowY: "auto" }}>
        {messages.map((m) => (
          <div key={m.id} style={{ textAlign: m.mine ? "right" : "left", margin: "6px 0" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {m.senderName} · {new Date(m.sentAt).toLocaleString()}
            </div>
            <div
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 12,
                background: m.mine ? "#dedffd" : "#f1f1f1",
              }}
            >
              {m.message}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          style={{ flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="메시지 입력…"
        />
        <button onClick={send} disabled={!input.trim()}>
          전송
        </button>
      </div>
    </div>
  );
}
