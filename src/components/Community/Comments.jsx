// src/components/Community/Comments.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// 쿠키(JWT) 인증 사용 시 필요
axios.defaults.withCredentials = true;

/**
 * 댓글 컴포넌트
 * @param {Object} props
 * @param {string|number} props.postId - 대상 게시글 ID (필수)
 * @param {boolean} [props.readOnly=false] - 읽기 전용 여부 (등록/수정/삭제 버튼 숨김)
 * @param {function} [props.canModify] - (선택) 외부에서 수정/삭제 노출 규칙 오버라이드 (c) => boolean
 * @param {string} [props.className] - 래퍼 className
 */
export default function Comments({ postId, readOnly = false, canModify, className = '' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // 목록 불러오기
  const fetchList = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      
      const { data } = await axios.get(
        `http://localhost:8080/community/${postId}/comments/list`
        // ← 선택 (SecurityConfig에서 permitAll이면 없어도 됨)
      );
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('댓글 목록 로드 실패:', e);
      alert(`댓글 목록 로드 실패: ${e.response?.data?.message ?? e.message}`);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 등록
  const addComment = async () => {
    const content = newContent.trim();
    if (!content) return alert('댓글 내용을 입력해주세요.');
    try {
      await axios.post(`http://localhost:8080/community/${postId}/comments/add`, { content });
      setNewContent('');
      fetchList();
    } catch (e) {
      console.error('댓글 등록 실패:', e);
      const msg = e.response?.status === 401 || e.response?.status === 403
        ? '로그인이 필요합니다.'
        : (e.response?.data?.message ?? e.message);
      alert(`등록 실패: ${msg}`);
    }
  };

  // 수정 시작/취소/저장
  const startEdit = (c) => {
    setEditingId(c.id);
    setEditContent(c.content ?? '');
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };
  const saveEdit = async (commentId) => {
    const content = editContent.trim();
    if (!content) return alert('수정할 내용을 입력해주세요.');
    try {
      await axios.put(`http://localhost:8080/community/comments/${commentId}`, { content });
      cancelEdit();
      fetchList();
    } catch (e) {
      console.error('댓글 수정 실패:', e);
      const msg = e.response?.status === 403
        ? '수정 권한이 없습니다.'
        : (e.response?.data?.message ?? e.message);
      alert(`수정 실패: ${msg}`);
    }
  };

  // 삭제
  const removeComment = async (commentId) => {
    if (!window.confirm('이 댓글을 삭제할까요?')) return;
    try {
      await axios.delete(`http://localhost:8080/community/comments/${commentId}`);
      fetchList();
    } catch (e) {
      console.error('댓글 삭제 실패:', e);
      const msg = e.response?.status === 403
        ? '삭제 권한이 없습니다.'
        : (e.response?.data?.message ?? e.message);
      alert(`삭제 실패: ${msg}`);
    }
  };

  // 버튼 노출 규칙
  const canModifyFn = canModify; // 있으면 외부 규칙 우선

  return (
    <section className={`comments ${className}`} style={{ marginTop: 24 }}>
      <h3 style={{ marginBottom: 12 }}>댓글</h3>

      {/* 등록 영역 */}
      {!readOnly && (
        <div className="comment-new" style={{ marginBottom: 16 }}>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="댓글을 입력해주세요"
            rows={3}
            style={{ width: '100%', padding: 8, resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ marginTop: 8 }}>
            <button className="btn" onClick={addComment}>등록</button>
          </div>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <p>댓글 로딩 중...</p>
      ) : (
        <ul className="comment-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((c) => {
            const isEditing = editingId === c.id;

            // FIX: 서버 DTO의 권한 플래그 사용 (없으면 false)
            const isOwner = !!c.isOwner;
           

            // FIX: 버튼 노출 규칙 (외부 canModify가 있으면 그 규칙 우선)
            const allowEdit   = !readOnly && (canModifyFn ? !!canModifyFn(c) : isOwner);
            const allowDelete = !readOnly && (canModifyFn ? !!canModifyFn(c) : isOwner);

            return (
              <li key={c.id} className="comment-item" style={{ padding: '12px 0', borderTop: '1px solid #eee' }}>
                <div className="meta" style={{ marginBottom: 6, fontSize: 14 }}>
                  {/* 서버에서 userName을 내려주면 c.userName 사용 */}
                  <span style={{ opacity: 0.8 }}>
                     {c.userName ?? `사용자#${c.userId}`}{isOwner ? ' (내 댓글)' : ''}
                  </span>
                  <span style={{ marginLeft: 8, opacity: 0.6 }}>
                    {c.createdAt} {c.updatedAt ? `(수정: ${c.updatedAt})` : ''}
                  </span>
                </div>

                {/* 내용 or 수정 폼 */}
                {isEditing ? (
                  <div className="edit-area">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: 8, resize: 'vertical', boxSizing: 'border-box' }}
                    />
                    <div className="actions" style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      {/* FIX: 내 댓글이 아니면 저장 비활성화 */}
                      <button className="btn" onClick={() => saveEdit(c.id)} disabled={!allowEdit}>저장</button>
                      <button className="btn" onClick={cancelEdit}>취소</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {c.content}
                  </p>
                )}

                {/* 액션 버튼 */}
                <div className="comment-actions" style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  {/* FIX: 수정/삭제 각각 권한에 맞춰 노출 */}
                  {!isEditing && allowEdit && (
                    <button className="btn" onClick={() => startEdit(c)}>수정</button>
                  )}
                  {allowDelete && (
                    <button className="btn" onClick={() => removeComment(c.id)}>삭제</button>
                  )}
                </div>
              </li>
            );
          })}
          {items.length === 0 && (
            <li style={{ padding: '12px 0', color: '#888' }}>첫 댓글을 남겨주세요!</li>
          )}
        </ul>
      )}
    </section>
  );
}
