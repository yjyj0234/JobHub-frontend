import React, { useEffect, useMemo, useState } from 'react'
import '../css/PostList.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const formatDate = (isoString) => {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

const PostList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6); // 보여줄 게시글 개수
  

    useEffect(() => {
    axios.get("http://localhost:8080/community/list") // 백엔드 API 주소
      .then(res => {
        setPosts(res.data ?? []); // 전체 게시글
      })
      .catch(err => {
        console.error("게시글 불러오기 실패:", err)
        setPosts([])
      });
      }, []);

   // 조회수,댓글 수에 따라 인기글 정렬   
  const popularPosts = useMemo(() => {
    if (!posts?.length) return []
    return [...posts]
      .map(p => ({ ...p, _score: (p.viewCount ?? 0) + (p.comments ?? 0) * 10 }))
      .sort((a, b) => b._score - a._score) //상위 3개
      .slice(0, 3)
  }, [posts])

  //네비게이트
  const navigate = useNavigate();

  const addPost = () =>{
    navigate('/postlist/addpost');
  }

  const goDetail = (id) =>
  {
    navigate(`/postlist/detail/${id}`);
  }

  // 더보기 버튼 클릭 핸들러
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  }

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

// 보여줄 게시글들 (6개씩)
const visiblePosts = useMemo(() => {
  return filteredPosts.slice(0, visibleCount);
}, [filteredPosts, visibleCount]);

// 더보기 버튼 표시 여부
const hasMorePosts = filteredPosts.length > visibleCount;


  return (
    <div className="pl-page">
      <div className="pl-container">
        <section className="pl-popular" aria-label="인기글 추천">
          <div className="pl-popular-head">
            <h2 className="pl-popular-title">조회수가 많은 글이에요</h2>
            <p><button type='button' onClick={addPost}>글 등록하기</button> </p>          
          </div>

          <div className="pl-popular-grid">
            {popularPosts.map((item) => (
              <a key={item.id} onClick={(e) => {
                e.preventDefault();
                goDetail(item.id);
              }} href="#" className="pl-popular-item">
                <span className="pl-badge">인기글</span>
                <h3 className="pl-popular-item-title">{item.title}</h3>
                <p className="pl-popular-item-preview">{item.content? item.content.replace(/<[^>]+>/g, '').replace(/\n/g, ' '): ''}</p>
                <div className="pl-popular-meta">
                  <span>댓글 {item.comments}</span>
                  <span className="pl-meta-sep">|</span>
                  <span>조회 {item.viewCount}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <header className="pl-header">
          <h1 className="pl-title">자유게시판</h1>
          <p></p>
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

        <ul className="pl-list" role="list">
          {visiblePosts.map((post) => (
            <li key={post.id} className="pl-card">
              <a style={{textDecoration:'none'}} href='#' onClick={(e)=>{
                e.preventDefault();
                goDetail(post.id)
              }} className="pl-card-title">{post.title}</a>
              <p className="pl-card-preview">{post.content? post.content.replace(/<[^>]+>/g, '').replace(/\n/g, ' '): ''}</p>
              <div className="pl-card-footer">
                <div className="pl-card-meta">
                  <span className="pl-meta-author">{post.userName}</span>
                  <span className="pl-meta-sep" aria-hidden="true">·</span>
                  <time className="pl-meta-date" dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                </div>
                <div className="pl-card-stats" aria-label="게시글 통계">
                  <span className="pl-stat">댓글 {post.comments}</span>
                  <span className="pl-stat">조회 {post.viewCount}</span>
                </div>
              </div>
            </li>
          ))}
          {filteredPosts.length === 0 && (
            <li className="pl-empty">등록된 게시글이 없습니다</li> 
          )}
        </ul>

        {/* 더보기 버튼 */}
        {hasMorePosts && (
          <div className="pl-load-more">
            <button 
              type="button" 
              className="pl-load-more-btn"
              onClick={handleLoadMore}
            >
              더보기 
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostList
