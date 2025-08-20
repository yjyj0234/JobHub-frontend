import React, { useEffect, useMemo, useState } from 'react'
import '../css/PostList.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/** 서버 포맷("yyyy-MM-dd HH:mm:ss")/ISO 모두 대응해서 yyyy.MM.dd 출력 */
const formatDate = (v) => {
  if (!v) return '';
  if (typeof v === 'string') {
    // "yyyy-MM-dd HH:mm:ss"
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v)) {
      const [d] = v.split(' ');
      const [y, m, d2] = d.split('-');
      return `${y}.${m}.${d2}`;
    }
    // ISO 시도
    const dt = new Date(v);
    if (!Number.isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d2 = String(dt.getDate()).padStart(2, '0');
      return `${y}.${m}.${d2}`;
    }
    return v; // 최후의 폴백
  }
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d2 = String(v.getDate()).padStart(2, '0');
    return `${y}.${m}.${d2}`;
  }
  return '';
};

/** <time dateTime="...">에 넣기 위한 값 (서버 포맷 -> ISO 유사) */
const toDateTimeAttr = (v) => {
  if (!v || typeof v !== 'string') return '';
  // "yyyy-MM-dd HH:mm:ss" -> "yyyy-MM-ddTHH:mm:ss"
  if (v.includes(' ') && !v.includes('T')) return v.replace(' ', 'T');
  return v;
};

/** HTML 제거 + 공백 정리 */
const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
};

const PostList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setErrMsg('');

    axios.get('http://localhost:8080/community/list', {
      withCredentials: false,                        // 쿠키 미전송
      headers: { Authorization: undefined },         // 인터셉터 무력화
      signal: controller.signal                      // 언마운트 시 취소
    })
      .then(res => {
        const arr = Array.isArray(res.data) ? res.data : [];
        setPosts(arr);
      })
      .catch(err => {
        if (axios.isCancel(err)) return;
        console.error('게시글 불러오기 실패:', err);
        setErrMsg('게시글을 불러오지 못했어.');
        setPosts([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  // 검색어 바뀌면 목록을 다시 6개부터 보여주자
  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm]);

  const lower = (v) => (v ?? '').toString().toLowerCase();

  const filteredPosts = useMemo(() => {
    const q = lower(searchTerm.trim());
    if (!q) return posts;
    return posts.filter(p =>
      lower(p.title).includes(q) ||
      lower(p.content).includes(q) ||
      lower(p.userName).includes(q)
    );
  }, [posts, searchTerm]);

  // 목록 축소(검색 등)로 길이가 줄면 visibleCount도 보정
 useEffect(() => {
  if (posts.length > 0) setVisibleCount(5);
}, [posts.length]);

  // 인기글 (조회수 + 댓글*10) Top3
  const popularPosts = useMemo(() => {
    if (!posts?.length) return [];
    return [...posts]
      .map(p => ({ ...p, _score: (p.viewCount ?? 0) + (p.commentCount ?? 0) * 10 }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 3);
  }, [posts]);

  // 6개씩 잘라서 보여줄 목록
  const visiblePosts = useMemo(() => filteredPosts.slice(0, visibleCount), [filteredPosts, visibleCount]);

  const hasMorePosts = filteredPosts.length > 5; // 더보기 버튼 노출 조건(기존 로직 유지)

  const handleLoadMore = () => {
    if (visibleCount >= filteredPosts.length) {
      setVisibleCount(5); // 접기
    } else {
      setVisibleCount(prev => Math.min(prev + 5, filteredPosts.length));
    }
  };

  const addPost = () => navigate('/postlist/addpost');
  const goDetail = (id) => navigate(`/postlist/detail/${id}`);
  const goGroupChat = () => navigate('/group-chat');

  return (
    <div className="pl-page">
      <div className="pl-container">
        <section className="pl-popular" aria-label="인기글 추천">
          <div className="pl-popular-head">
            <h2 className="pl-popular-title">조회수가 많은 글이에요</h2>
            <div className="pl-popular-buttons">
              <button type="button" onClick={addPost}>글 등록하기</button>
              <button type="button" className="group-chat-btn" onClick={goGroupChat}>그룹 채팅방</button>
            </div>
          </div>

          <div className="pl-popular-grid">
            {popularPosts.map(item => (
              <button
                type="button"
                key={item.id}
                onClick={() => goDetail(item.id)}
                className="pl-popular-item"
              >
                <span className="pl-badge">인기글</span>
                <h3 className="pl-popular-item-title">{item.title}</h3>
                <p className="pl-popular-item-preview">{stripHtml(item.content)}</p>
                <div className="pl-popular-meta">
                  <span>댓글 {item.commentCount ?? 0}</span>
                  <span className="pl-meta-sep">|</span>
                  <span>조회 {item.viewCount ?? 0}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <header className="pl-header">
          <h1 className="pl-title">자유게시판</h1>
          <div className="pl-actions">
            <input
              type="text"
              className="pl-search-input"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="게시글 검색"
            />
          </div>
        </header>

        {loading && <div className="pl-loading" aria-live="polite">불러오는 중…</div>}
        {!loading && errMsg && <div className="pl-error" role="alert">{errMsg}</div>}

        {!loading && !errMsg && (
          <>
            <ul className="pl-list" role="list">
              {visiblePosts.map(post => (
                <li key={post.id} className="pl-card">
                  <button
                    type="button"
                    onClick={() => goDetail(post.id)}
                    className="pl-card-title pl-as-link"
                    title={post.title}
                  >
                    {post.title}
                  </button>
                  <p className="pl-card-preview">{stripHtml(post.content)}</p>
                  <div className="pl-card-footer">
                    <div className="pl-card-meta">
                      <span className="pl-meta-author">{post.userName ?? '탈퇴회원'}</span>
                      <span className="pl-meta-sep" aria-hidden="true">·</span>
                      <time className="pl-meta-date" dateTime={toDateTimeAttr(post.createdAt)}>
                        {formatDate(post.createdAt)}
                      </time>
                    </div>
                    <div className="pl-card-stats" aria-label="게시글 통계">
                      <span className="pl-stat">댓글 {post.commentCount ?? 0}</span>
                      <span className="pl-stat">조회 {post.viewCount ?? 0}</span>
                    </div>
                  </div>
                </li>
              ))}

              {filteredPosts.length === 0 && (
                <li className="pl-empty">등록된 게시글이 없습니다</li>
              )}
            </ul>

            {hasMorePosts && (
              <div className="pl-load-more">
                <button
                  type="button"
                  className="pl-load-more-btn"
                  onClick={handleLoadMore}
                >
                  {visibleCount >= filteredPosts.length ? '접기' : '더보기'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};


export default PostList;
