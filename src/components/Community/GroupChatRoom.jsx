import React, { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs.js";
import { useNavigate, useParams } from "react-router-dom";
import '../css/GroupChatRoom.css';

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
  const [roomName, setRoomName] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [myUid, setMyUid] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const stompRef = useRef(null);
  const lastIdRef = useRef(null);
  const scrollBoxRef = useRef(null);
  const lastSentRef = useRef({ text: null, ts: 0 });

  // 내 uid ref
  const myUidRef = useRef(myUid);
  useEffect(() => { myUidRef.current = myUid; }, [myUid]);

  // 히스토리 + (선행) join
  useEffect(() => {
    if (!roomId) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data: joinRes } = await axios.post(`http://localhost:8080/group-chat/rooms/${roomId}/join`);
        if (joinRes.userId) setMyUid(joinRes.userId);
        if (joinRes.roomName) setRoomName(joinRes.roomName);
        
        const { data } = await axios.get(
          `http://localhost:8080/group-chat/rooms/${roomId}/messages`
        );
        const normalized = (Array.isArray(data) ? data : []).map((m) => ({
          ...m,
          // 서버가 mine을 안 세팅해줬을 경우 대비
          mine: m.mine ?? (myUid != null && String(m.senderId) === String(myUid)),
          senderName: (m.mine ?? (myUid != null && String(m.senderId) === String(myUid))) ? "나" : m.senderName,
        }));
        setMessages(normalized);
        if (normalized.length) lastIdRef.current = normalized[normalized.length - 1].id;
      } catch (e) {
        console.error(e);
        if (e?.response?.status === 401) setError("로그인이 필요합니다.");
        else if (e?.response?.status === 403) setError("이 방에 접근 권한이 없습니다.");
        else setError("메시지 로딩에 실패했습니다.");
      } finally {
        setLoading(false);
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
            console.log({myUid, msg})
            const mine = myUidRef.current != null && String(msg.senderId) === String(myUidRef.current);

            if (mine) {
              const { text, ts } = lastSentRef.current || {};
              if (text && text === msg.message && Date.now() - ts < 800) {
                return; // 무시
              }
            }
            setMessages((prev) => [...prev, {...msg, mine}]);
            lastIdRef.current = msg.id;
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

    //낙관적 업데이트 (채팅이 서버에 전송되기 전에 UI에 반영)
    const temp = {
      id: `local-${Date.now()}`,
      senderId: myUid,
      senderName: "나",
      sentAt: new Date().toISOString(),
      message: text,
      mine: true,
    };
    setMessages(prev => [...prev, temp]);

    lastSentRef.current = { text, ts: Date.now() };

    // 컨트롤러 @MessageMapping("/rooms/{roomId}/send")에 매핑됨
    // 서버에서 URL의 {roomId}를 쓰고, 바디는 message만 있어도 충분함
    stompRef.current.publish({
      destination: `/app/rooms/${roomId}/send`,
      body: JSON.stringify({ message: text }),
    });
    setInput("");
  };

  const goBack = () => navigate('/group-chat');

  if (!roomId) return (
    <div className="gcr-page">
      <div className="gcr-container">
        <div className="gcr-error">잘못된 경로입니다.</div>
      </div>
    </div>
  );

  return (
    <div className="gcr-page">
      <div className="gcr-container">
        <header className="gcr-header">
          <div className="gcr-header-left">
            <h1 className="gcr-title">{roomName || `Room #${roomId}`}</h1>
            <span className="gcr-room-id">#{roomId}</span>
          </div>
          <button type="button" className="gcr-back-btn" onClick={goBack}>
            목록으로
          </button>
        </header>

        {error && <div className="gcr-error" role="alert">{error}</div>}

        {loading ? (
          <div className="gcr-loading" aria-live="polite">채팅방을 불러오는 중…</div>
        ) : (
          <>
            <div className="gcr-messages-container" ref={scrollBoxRef}>
              {messages.length === 0 ? (
                <div className="gcr-empty">
                  <p>아직 메시지가 없습니다</p>
                  <p>첫 메시지를 보내보세요!</p>
                </div>
              ) : (
                <div className="gcr-messages">
                  {messages.map((m) => {
                    const mine = m.mine ?? (myUid != null && String(m.senderId) === String(myUid));
                    return (
                      <div key={m.id ?? `${m.senderId}-${m.sentAt}-${Math.random()}`} className={`gcr-message ${mine ? 'gcr-message-mine' : 'gcr-message-other'}`}>
                        <div className="gcr-message-header">
                          <span className="gcr-sender-name">{m.senderName}</span>
                          <span className="gcr-message-time">
                            {m.sentAt ? new Date(m.sentAt).toLocaleString() : ""}
                          </span>
                        </div>
                        <div className="gcr-message-content">
                          {m.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="gcr-input-section">
              <div className="gcr-input-container">
                <input
                  className="gcr-message-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="메시지를 입력하세요..."
                  disabled={!stompRef.current?.connected}
                />
                <button 
                  type="button"
                  className="gcr-send-btn" 
                  onClick={send} 
                  disabled={!input.trim() || !stompRef.current?.connected}
                >
                  전송
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
