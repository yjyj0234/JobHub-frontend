// src/components/GroupChatRoom.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs.js";
import { useParams } from "react-router-dom";

axios.defaults.withCredentials = true;

// === helpers ===
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function GroupChatRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [myUid, setMyUid] = useState(null);

  const stompRef = useRef(null);
  const lastIdRef = useRef(null);
  const scrollBoxRef = useRef(null);

  // 내 uid 파싱 (JWT 쿠키나 localStorage)
  useEffect(() => {
    const tok = getCookie("JWT") || localStorage.getItem("JWT");
    const payload = tok ? parseJwt(tok) : null;
    setMyUid(payload?.uid ?? null);
  }, []);

  // 히스토리 + (선행) join
  useEffect(() => {
    if (!roomId) return;
    (async () => {
      try {
        await axios.post(`http://localhost:8080/group-chat/rooms/${roomId}/join`);
        const { data } = await axios.get(
          `http://localhost:8080/group-chat/rooms/${roomId}/messages`
        );
        const normalized = (Array.isArray(data) ? data : []).map((m) => ({
          ...m,
          // 서버가 mine을 안 세팅해줬을 경우 대비
          mine: m.mine ?? (myUid != null && m.senderId === myUid),
        }));
        setMessages(normalized);
        if (normalized.length) lastIdRef.current = normalized[normalized.length - 1].id;
      } catch (e) {
        console.error(e);
        if (e?.response?.status === 401) setError("로그인이 필요합니다.");
        else if (e?.response?.status === 403) setError("이 방에 접근 권한이 없습니다.");
        else setError("메시지 로딩에 실패했습니다.");
      }
    })();
    // myUid가 바뀌면 mine 계산이 달라지므로 의존성 포함
  }, [roomId, myUid]);

  // STOMP 연결
  useEffect(() => {
    if (!roomId) return;

    const token = getCookie("JWT") || localStorage.getItem("JWT");
    // SockJS (XHR 핸드셰이크가 쿠키를 써야 하면 withCredentials 옵션 유지)
    const sock = new SockJS("http://localhost:8080/ws", null, {
      transportOptions: {
        xhrStream: { withCredentials: true },
        xhrPolling: { withCredentials: true },
      },
    });

    const client = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 3000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {}, // ✅ CONNECT 헤더에 JWT
      debug: (s) => console.log("[STOMP]", s),
      onConnect: () => {
        // 구독 경로는 서버 설정(enableSimpleBroker("/topic"))과 맞춰야 함
        client.subscribe(`/topic/rooms/${roomId}`, (frame) => {
          try {
            const msg = JSON.parse(frame.body);
            const normalized = {
              ...msg,
              mine: msg.mine ?? (myUid != null && msg.senderId === myUid),
            };
            setMessages((prev) => [...prev, normalized]);
            lastIdRef.current = normalized.id;
          } catch (err) {
            console.error("parse error:", err);
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker error:", frame.headers["message"], frame.body);
        setError("채팅 서버 오류가 발생했습니다.");
      },
      onWebSocketClose: (evt) => {
        console.warn("WebSocket closed:", evt);
      },
    });

    stompRef.current = client;
    client.activate();

    return () => {
      // deactivate는 Promise지만, 여기선 fire-and-forget으로 충분
      try {
        client.deactivate();
      } catch {}
    };
  }, [roomId, myUid]); // 내 uid도 의존 (mine 판단용)

  // 새 메시지 오면 스크롤 최하단으로
  useEffect(() => {
    const box = scrollBoxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text || !stompRef.current || !stompRef.current.connected) return;

    // 컨트롤러 @MessageMapping("/rooms/{roomId}/send")에 매핑됨
    // 서버에서 URL의 {roomId}를 쓰고, 바디는 message만 있어도 충분함
    stompRef.current.publish({
      destination: `/app/rooms/${roomId}/send`,
      body: JSON.stringify({ message: text }),
    });
    setInput("");
  };

  if (!roomId) return <div>잘못된 경로입니다.</div>;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h3>Room #{roomId}</h3>
      {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}

      <div
        ref={scrollBoxRef}
        style={{ border: "1px solid #ddd", padding: 12, height: 360, overflowY: "auto" }}
      >
        {messages.map((m) => {
          const mine = m.mine ?? (myUid != null && m.senderId === myUid);
          return (
            <div key={m.id ?? `${m.senderId}-${m.sentAt}-${Math.random()}`} style={{ textAlign: mine ? "right" : "left", margin: "6px 0" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {m.senderName} · {m.sentAt ? new Date(m.sentAt).toLocaleString() : ""}
              </div>
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: mine ? "#dedffd" : "#f1f1f1",
                }}
              >
                {m.message}
              </div>
            </div>
          );
        })}
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
