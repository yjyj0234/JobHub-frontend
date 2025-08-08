import React, { useMemo, useState } from 'react'
import '../css/PostList.css';
import { useNavigate } from 'react-router-dom';

const formatDate = (isoString) => {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

const PostList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [posts] = useState([
     {
    id: '1',
    title: '첫 번째 글입니다',
    content: '이건 예시 게시글의 내용 미리보기입니다.',
    userName: '홍길동',
    createdAt: '2025-08-08T12:00:00Z',
    comments: 0,
    viewCount: 350
  }
  ])
  const [popularPosts] = useState([
    {
      id: 'p1',
      title: '테스트',
      content:
        '',
      comments: 0,
      views: 0,
    },
    {
      id: 'p2',
      title: '',
      preview:
        '',
      comments: 2,
      views: 275,
    },
    {
      id: 'p3',
      title: '이직 하는게 맞겠죠?',
      preview:
        '대기업 자회사 정규직으로 근무 중인데, 커리어 성장 측면에서 이직을 고민하고 있습니다...',
      comments: 8,
      views: 207,
    },
  ])
  //네이게이트
  const navigate = useNavigate();

  const addPost = () =>{
    navigate('/postlist/addpost');
  }

  const filteredPosts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return posts
    return posts.filter((p) =>
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query) ||
      p.userName.toLowerCase().includes(query)
    )
  }, [posts, searchTerm])

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
              <a key={item.id} href="#" className="pl-popular-item">
                <span className="pl-badge">인기글</span>
                <h3 className="pl-popular-item-title">{item.title}</h3>
                <p className="pl-popular-item-preview">{item.preview}</p>
                <div className="pl-popular-meta">
                  <span>댓글 {item.comments}</span>
                  <span className="pl-meta-sep">|</span>
                  <span>조회 {item.views}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <header className="pl-header">
          <h1 className="pl-title">커리어피드 게시판</h1>
          
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
          {filteredPosts.map((post) => (
            <li key={post.id} className="pl-card">
              <a href="#" className="pl-card-title">{post.title}</a>
              <p className="pl-card-preview">{post.content}</p>
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
      </div>
    </div>
  )
}

export default PostList
