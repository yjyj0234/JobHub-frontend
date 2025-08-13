import React, { useEffect, useState, useMemo, useRef } from 'react';

import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/PostDetail.css';
import humanIcon from '../../assets/img/human.png';

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
        //조회수 증가
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

  const handleDelete = async () => {
  if (!window.confirm('정말 삭제하시겠습니까?')) return;
  try {
    await axios.delete(`http://localhost:8080/community/${id}`);
    alert('삭제 완료!');
    // 목록 경로로 이동(프로젝트 라우팅에 맞춰 수정)
    navigate('/postlist');
  } catch (e) {
    console.error(e);
    alert(`삭제 실패: ${e.response?.data?.message ?? e.message}`);
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
      {/* 기존 map 방식 전체를 아래로 교체 */}
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
        <button className="btn edit" onClick={handleEdit}>수정</button>
        <button className='btn delete' onClick={handleDelete}>삭제</button>
      </div>

      {/* 댓글 영역(추후 API 붙이면 사용) */}
      <section className="comments">
        <h2 className="comments-title">댓글</h2>
        <div className="comment-empty">댓글 리스트</div>
      </section>
    </div>
  );
}
