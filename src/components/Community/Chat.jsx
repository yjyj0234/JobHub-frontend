// src/Chat.js
import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client/dist/sockjs.js";
import "../css/Chat.css";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  // 데모용 하드코딩(실제론 로그인/프로필에서 받아와)
  const USER_ID = 1;
  const ROOM_KEY = "u1-u2";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    // roomKey, userId 쿼리로 전달
    ws.current = new SockJS(`http://localhost:8080/ws/chat?roomKey=${encodeURIComponent(ROOM_KEY)}&userId=${USER_ID}`);

    ws.current.onopen = () => console.log("✅ SockJS 연결됨");
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data); // 서버에서 ChatMessageDto JSON 브로드캐스트
        setMessages((prev) => [
          ...prev,
          {
            text: data.message,
            isMe: data.userId === USER_ID,
            time: new Date(data.sentAt),
          },
        ]);
      } catch {
        // 혹시 문자열로 오면(백이 바뀌기 전 대비)
        setMessages((prev) => [...prev, { text: event.data, isMe: false, time: new Date() }]);
      }
    };
    ws.current.onclose = () => console.log("❌ SockJS 연결 종료");

    return () => ws.current?.close();
  }, []); // ROOM_KEY/USER_ID 바뀌면 재연결하도록 의존성에 넣어도 됨

  const sendMessage = () => {
    if (!input.trim()) return;
    // 서버가 JSON 파싱해서 DB 저장 → 같은 포맷으로 다시 브로드캐스트
    ws.current?.send(JSON.stringify({ userId: USER_ID, roomKey: ROOM_KEY, message: input }));
    setInput(""); // 내 메시지는 서버 에코를 받아서 렌더(중복 방지)
  };

  const formatTime = (date) =>
    date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-title">채팅방</div>
          <div className="chat-status">실시간 채팅</div>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-wrapper">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.isMe ? "my-message" : "other-message"}`}>
              <div className="message-bubble">
                <div className="message-text">{msg.text}</div>
                <div className="message-time">{formatTime(msg.time)}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="메시지를 입력하세요..."
            className="message-input"
          />
          <button onClick={sendMessage} className="send-button">전송</button>
        </div>
      </div>
    </div>
  );
}
export default Chat;
