import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true; // 쿠키 인증을 위해 설정
import { useParams, useNavigate } from 'react-router-dom';
import '../css/PostDetail.css';
import humanIcon from '../../assets/img/human.png';
import Comments from './Comments'; // Comments 컴포넌트 임포트

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const viewed = useRef(false);

 

 

  useEffect(() => {
    if (!id) { navigate(-1); return; }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 조회수 증가
        if (!viewed.current) {
          viewed.current = true;
          await axios.post(`http://localhost:8080/community/${id}/view`).catch(() => {});
        }
        const { data } = await axios.get(`http://localhost:8080/community/detail/${id}`);
        setPost(data);
      } catch (e) {
        setError({
          status: e.response?.status ?? 500,
          message: e.response?.data?.message ?? e.message ?? '에러',
          body: e.response?.data
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  // 글 삭제 및 수정 핸들러
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    console.log('=== 삭제 요청 시작 ===');
    console.log('삭제할 게시글 ID:', id);
    console.log('요청 URL:', `http://localhost:8080/community/${id}`);

    try {
      // FIX: DELETE 메서드로, withCredentials는 옵션 객체에
      const response = await axios.delete(`http://localhost:8080/community/${id}`, {
        withCredentials: true,
      });
      console.log('삭제 성공:', response?.status);
      alert('삭제 완료!');
      navigate('/postlist');
    } catch (e) {
      console.error('=== 삭제 요청 실패 ===');
      console.error('HTTP 상태:', e.response?.status);
      console.error('응답 데이터:', e.response?.data);
      console.error('요청 URL:', e.config?.url);
      console.error('요청 헤더:', e.config?.headers);
      if (e.response?.status === 403) {
        alert('권한이 없습니다. 본인이 작성한 글만 삭제할 수 있습니다.');
      } else {
        alert(`삭제 중 오류가 발생했습니다. ${e.response?.data?.message ?? e.message}`);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/postlist/edit/${id}`);
  };

  const handleList = () => {
    navigate('/postlist');
  };

  if (loading) {
    return (
      <div className="post-detail-container">
        <div className="skeleton header" />
        <div className="skeleton line" />
        <div className="skeleton line" />
        <div className="skeleton block" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-container error">
        <h2>불러오는 중 오류가 발생</h2>
        <code>status: {error.status} / {error.message}</code>
        {error.body && <pre className="error-pre">{JSON.stringify(error.body, null, 2)}</pre>}
        <div className="actions">
          <button className="btn" onClick={() => navigate(-1)}>뒤로</button>
          <button className="btn" onClick={() => window.location.reload()}>새로고침</button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-container empty">
        <p>게시글을 찾을 수 없습니다</p>
        <button className="btn" onClick={() => navigate(-1)}>뒤로</button>
      </div>
    );
  }

  

  return (
    <div className="post-detail-container">
      {/* 헤더 영역 */}
      <header className="post-header">
        <h1 className="post-title">{post.title ?? ''}</h1>

        <div className="post-meta">
          <div className="author">
            <img
              className="avatar"
              src={humanIcon}
              width={40}
              height={40}
            />
            <span className="author-name">{post.userName ?? '알 수 없음'}님</span>
          </div>

          <div className="stats">
            <span className="meta-item">{post.createdAt}</span>
            <span className="dot">•</span>
            <span className="meta-item">조회 {post.viewCount ?? 0}</span>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <article
        className="post-content"
        dangerouslySetInnerHTML={{
          __html: (post.content ?? '').replace(/\n/g, '<br/>')
        }}
      />
      <br /><br />

      {/* 액션 바 */}
      <div className="post-actions">
        <button className="btn list" onClick={handleList}>목록</button>
        <div className="spacer" />
        {/* 로그인한 사용자가 작성자일 때만 수정/삭제 버튼 보이게 */}
        {post.owner && (
          <>
            <button type='button' className="btn edit" onClick={handleEdit}>수정</button>
            <button type='button' className="btn delete" onClick={handleDelete}>삭제</button>
          </>
        )}
      </div>

      <Comments postId={id} />
    </div>
  );
}
