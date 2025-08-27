import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true; // 쿠키 인증을 위해 설정 
import humanIcon from '../../assets/img/human.png';
import { data } from 'react-router-dom';


export default function Comments({ postId }) {
  const [list, setList] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const API = '';

  // 댓글 목록 불러오기
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/community/${postId}/comments`, {
        withCredentials: true,
      });
      setList(res.data ?? []); // ✅ 서버 응답 사용
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [postId]);

  // 댓글 작성
  const onSubmit = async (e) => {
    e.preventDefault();
    
    
    setSending(true);
    try {
      const {data:dto} = await axios.post(`${API}/community/${postId}/comments`, {content:text}, { withCredentials: true });
      // 낙관적 갱신
      setList((prev) => [{
        ...dto
        
      },...prev]);
      setText('');
      inputRef.current?.focus();
    } catch (e) {
      const status = e.response?.status;
      if (status === 401 || status === 403) alert('로그인이 필요하거나 권한이 없습니다.');
      else alert(e.response?.data?.message ?? e.message);
    } finally {
      setSending(false);
    }
  };

  //삭제
  const onDelete = async (commentId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API}/community/comments/${commentId}`);
      // 서버는 soft delete(내용을 빈 문자열로 변경) → 프론트에서도 반영
      setList((prev) => prev.map(c => c.id === commentId ? { ...c, content: '' } : c));
    } catch (e) {
      const status = e.response?.status;
      if (status === 403) alert('본인 또는 관리자만 삭제할 수 있습니다.');
      else alert(e.response?.data?.message ?? e.message);
    }
  };

  const fmt = (iso) => {
    try { return new Date(iso).toLocaleString('ko-KR'); } catch { return iso; }
  };

  const visibleCount = list.filter(c => c.content && c.content.trim().length > 0).length;
  return (
    <section className="comments-wrap">
      <h2 className="comments-title">댓글 {visibleCount}</h2>

      <form className="comment-form" onSubmit={onSubmit}>
        <textarea
        style={{"width": "100%", "height": "100px"}}
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="댓글을 입력해주세요"
          maxLength={1000}
          disabled={sending}
        />
        <div className="comment-form-actions">
          <span className="len">{text.trim().length} / 1000</span>
          <button type='submit' className="btn" disabled={sending || !text.trim()} style={{"float": "right"}}>
            {sending ? '등록 중…' : '등록'}
          </button>
        </div>
      </form>
      <br />
      {loading ? (
        <div className="comment-skeleton">댓글 불러오는 중…</div>
      ) : error ? (
        <div className="comment-error">댓글을 불러오지 못했습니다: {String(error)}</div>
      ) : list.length === 0 ? (
        <div className="comment-empty">첫 댓글을 남겨주세요!</div>
      ) : (
        <ul className="comment-list">
          {list.map((c,idx) => (
            <li key={c.id ?? c.tempId ?? idx} className="comment-item">
              <img className="avatar" src={humanIcon} width={32} height={32} />
              <div className="body">
                <div className="meta">
                  <span className="name">{c.userName ?? '알 수 없음'}</span>
                    &nbsp;&nbsp;&nbsp;
                  <span className="time">{fmt(c.createdAt)}</span>
                </div>
                <br /><br />
                <div className={`content ${!c.content ? 'deleted' : ''}`}>
                  {c.content && c.content.trim().length > 0 ? c.content : '(삭제된 댓글)'}
                </div>
                {/* 서버에서 권한 체크하니까 버튼은 일단 노출 → 실패 시 403 안내 */}
                {c.content && c.content.trim().length > 0 && c.isOwner &&(
                  <div className="actions">
                    <button type="button" className="link-btn" onClick={() => onDelete(c.id)}>
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
