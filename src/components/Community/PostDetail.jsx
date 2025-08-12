// PostDetail.jsx (깨끗한 버전)
import React, { useEffect, useState } from 'react';
import './PostDetail.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PostDetail = () => {
  const { id } = useParams();              // ✅ 파라미터만 사용
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) { navigate(-1); return; }
    (async () => {
      try {
        const { data } = await axios.get(`http://localhost:8080/community/detail/${id}`);
        setPost(data);
        setComments([]); // 댓글 API 생기면 여기서 세팅
      } catch (e) {
        console.error('상세 불러오기 실패:', e);
        setError({
          status: e.response?.status,
          data: e.response?.data,
          message: e.message,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) return <div className="post-detail-container">로딩중…</div>;
  if (error)   return (
    <div className="post-detail-container">
      에러가 발생했어<br/>
      <code>status: {String(error.status)} | msg: {error.message}</code>
      <div><button onClick={() => navigate(-1)}>뒤로</button></div>
    </div>
  );
  if (!post)   return <div className="post-detail-container">게시글을 찾을 수 없어</div>;

  return (
    <div className="post-detail-container">
      <div className="post-header">
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          <div className="author-info">
            <img src="https://via.placeholder.com/32" alt="작성자" className="author-avatar" />
            {/* <span className="author-name">{post.user?.name ?? post.userName ?? ''}</span> */}
          </div>
          <div className="post-stats">
            <span className="post-date">{post.createdAt}</span>
            <span className="post-views">조회 {post.viewCount ?? 0}</span>
            <span className="post-likes">좋아요 {post.likes ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="post-content">
        <div className="content-text">
          {(post.content ?? '').split('\n').map((line, idx) => <p key={idx}>{line}</p>)}
        </div>
      </div>

      {/* 댓글 렌더는 그대로 */}
    </div>
  );
};

export default PostDetail;
