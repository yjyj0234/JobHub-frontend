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
  const [searchTerm, setSearchTerm] = useState(''); //입력중인 값
  const [committedSearchTerm, setCommittedSearchTerm] = useState(''); // 실제 검색어
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  const [role, setRole] = useState(null); // 로그인한 유저 role 저장용

  const [pendingCount, setPendingCount] = useState(0); // 대기중 초대 수


    // ✅ 대기중 초대 수 불러오기(배지용)
  const fetchPendingInviteCount = async () => {
    try {
      const res = await axios.get('http://localhost:8080/chat/invites/me/pending', {
        withCredentials: true,
        validateStatus: () => true,
      });
      const list = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res.data?.items) ? res.data.items : []);
      setPendingCount(list.length || 0);
    } catch (e) {
      // 실패해도 UI 막진 않도록 조용히 처리
      setPendingCount(0);
    }
  };

    // ✅ 유저가 일반 USER일 때만 주기적으로 카운트 갱신
  useEffect(() => {
    if (role !== 'USER') {
      setPendingCount(0);
      return;
    }
    let alive = true;
    const load = async () => {
      if (!alive) return;
      await fetchPendingInviteCount();
    };
    load();
    // 30초마다 폴링
    const t = setInterval(load, 30000);
    // 탭 재포커스 시 즉시 갱신
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false;
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [role]);

   // ✅ 현재 로그인 사용자 정보 불러오기
  useEffect(() => {
    let mounted = true;
    axios.get(`/api/auth/me`, { withCredentials: true })
      .then(res => {
        if (!mounted) return;
        setRole(res.data?.userType ?? null); // "COMPANY" | "USER" | null
      })
      .catch(() => {
        if (!mounted) return;
        setRole(null);
      });
    return () => { mounted = false; };
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setErrMsg('');

    axios.get('http://localhost:8080/community/list', {
      withCredentials: true,                        // 쿠키 
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

  // 검색어 바뀌면 목록을 다시 6개부터 보여주기
  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm]);

  

  // 검색 실행 함수
const handleSearch = (e) => {
  if (e.key === 'Enter') {
    setCommittedSearchTerm(searchTerm.trim());
    setSearchTerm('');
  }
  else if (e.type === 'click') {
    setCommittedSearchTerm(searchTerm.trim());
    setSearchTerm('');
  }
  
};

//검색함수에 Enter 키 이벤트 추가
  const filteredPosts = useMemo(() => {
  const q = (committedSearchTerm ?? '').toLowerCase();
  if (!q) return posts;
  return posts.filter(p =>
    (p.title ?? '').toLowerCase().includes(q) ||
    (p.content ?? '').toLowerCase().includes(q) ||
    (p.userName ?? '').toLowerCase().includes(q)
  );
}, [posts, committedSearchTerm]);

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
  // const goInviteForm = () => navigate('/chat/invites');
  const goPendingInvite = () => navigate('/chat/invites/pending');
  const goInviteList = () => navigate('/chat/invites/list');

  return (
    <div className="pl-page">
      <div className="pl-container">
        <section className="pl-popular" aria-label="인기글 추천">
          <div className="pl-popular-head">
            <h2 className="pl-popular-title">조회수가 많은 글이에요</h2>
            <p style={{textAlign: 'right'}}><button type="button" className='pl-addbtn' onClick={addPost}>글 등록하기</button></p>
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
              onKeyDown={handleSearch}
              aria-label="게시글 검색"
            />
             <button type='button' className='pl-search-btn' onClick={handleSearch}>검색</button>
          </div>
        </header>

        <div style={{display: 'flex', gap: '20px'}}>
          <div style={{flex: 1}}>
            {loading && <div className="pl-loading" aria-live="polite">불러오는 중…</div>}
            {!loading && errMsg && <div className="pl-error" role="alert">{errMsg}</div>}

            {!loading && !errMsg && (
              <>
                <ul className="pl-list" role="list">
                  {visiblePosts.map(post => (
                    <li key={post.id} className="pl-card">
                      <label>
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
                          <span className="pl-meta-author">{post.userName ?? '탈퇴회원'}
                            <span style={{color:'blue'}}>{post.owner ? '(본인) ' : ''}</span>
                          </span>
                          
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
                      </label>
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

          {/* 사이드바 */}
          <div style={{width: '250px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', height: 'fit-content'}}>
            <h3 style={{marginBottom: '15px', fontSize: '18px', fontWeight: 'bold'}}>채팅</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <button type="button" className='group-chat-btn' onClick={goGroupChat} style={{width: '100%', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                그룹채팅방
              </button>
              <button type='button' className='group-chat-btn' onClick={goInviteList} style={{width: '100%', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                면접제의 채팅방 목록
              </button>
              {/* {role === 'COMPANY' && (
                <button type='button' className='group-chat-btn' onClick={goInviteForm} style={{width: '100%', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                  면접제의 보내기
                  
                </button>
              )} */}
              {role === 'USER' && (
                <button type='button' className='group-chat-btn' onClick={goPendingInvite} style={{position:'relative', width:'100%', padding:'10px', border:'none', borderRadius:'4px', cursor:'pointer'}}>
                  대기중인 면접제의 보기
                  {pendingCount > 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            minWidth: 20,
                            height: 20,
                            padding: '0 6px',
                            borderRadius: 999,
                            background: '#e11d48', // 빨강
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                            boxShadow: '0 2px 6px rgba(0,0,0,.15)',
                          }}
                        >
                          {pendingCount > 99 ? '99+' : pendingCount}
                        </span>
                      )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostList;
