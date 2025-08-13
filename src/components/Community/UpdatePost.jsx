import React, { useEffect, useMemo, useRef, useState } from 'react'
import '../css/AddPost.css'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'




const UpdatePost = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isBold, setIsBold] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
 const [loading, setLoading] = useState(false)     // ✅ 추가
  const [error, setError] = useState(null)  

  //내용 bold 적용 버튼이벤트
  const handleBoldClick = () => {
  document.execCommand('bold');
  setIsBold(document.queryCommandState('bold'));
}
//내용 underline
 const handleUlineClick = () => {
  document.execCommand('underline');
  setIsUnderline(document.queryCommandState('underline'))
}

  useEffect(() => {
    const handleSelectionChange = () => {
      setIsBold(document.queryCommandState('bold'))
      setIsUnderline(document.queryCommandState('underline'))
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, []);

  //초기 데이터 불러오기
  useEffect(() => {
    if (!id) { alert('잘못된 접근이야'); navigate(-1); return; }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`http://localhost:8080/community/detail/${id}`);
        setTitle(data.title ?? '');
        setContent(data.content ?? '');
        if (editorRef.current) {
          editorRef.current.innerHTML = data.content ?? '';
        }
      } catch (e) {
        setError(e.response?.data?.message ?? e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleTitleChange = (e) => {
    const value = e.target.value
    if (value.length <= 50) {
      setTitle(value)
    }
  }

  
   const handleUpdate = async (e) => {
    e.preventDefault()
    const html = editorRef.current?.innerHTML ?? content;
    
    const data = { userId: 12, title, content: html}

    try {
     await axios.put(`http://localhost:8080/community/edit/${id}`, data)
      alert('수정 완료')
      setTitle('')
      setContent('')
      navigate(`/postlist/detail/${id}`) // 수정 후 상세 페이지로 이동
    } catch (err) {
      console.error(err)
      alert('수정 실패')
    }
  }

  //html -> 텍스트로
  const htmlToText = (html) => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || '')
    .replace(/\u00A0/g, ' ')  // NBSP 제거
    .replace(/\u200B/g, '')   // zero-width 제거
    .trim();
};
const textLen = useMemo(() => htmlToText(content).length, [content]);

  return (
    <div className="add-post-container">
      {/* 헤더 섹션 */}
        <form onSubmit={handleUpdate}>
      <div className="header-section">
        <h1 className="main-title">글 수정</h1>
        <p className="subtitle"></p>
      </div>
      
      {/* 제목 입력 필드 */}
      <div className="title-input-section">
        <input
          type="text"
          className="title-input"
          placeholder="질문 제목을 입력해주세요(최대 50자)"
          value={title}
          onChange={handleTitleChange}
          maxLength={50}
          required
        />
      </div>

      {/* 텍스트 에디터 툴바 */}
      <div className="editor-toolbar">
        <button 
          type='button'
          className={`toolbar-btn ${isBold ? 'active' : ''}`}
          onClick={handleBoldClick} //bold적용버튼
        >
          B
        </button>
        <button 
          type='button'
          className={`toolbar-btn ${isUnderline ? 'active' : ''}`}
          onClick={handleUlineClick}
        >
          U
        </button>
      </div>

      {/* 내용 입력 영역 */}
      <div className="content-section">
        <p className="content-tip">구체적으로 작성하면 현직자의 답변률이 높아져요</p>
        <div className="content-input-container">
          <div
              ref={editorRef}
              contentEditable
              className="editor"
                 onInput={(e) => setContent(e.currentTarget.innerHTML)}
                 
            ></div>
          <div className="character-counter">
            {textLen}/5000자
          </div>
        </div>
      </div>
        
      {/* 가이드라인 */}
      <div className="guidelines">
        <ul className="guidelines-list">
          <li>저작권 침해, 음란, 청소년 유해물, 기타 위법자료 등을 게시할 경우 게시물은 경고 없이 삭제 됩니다.</li>
          <li>답변이 등록되면 게시글 삭제가 불가합니다.</li>
        </ul>
      </div>

      <div className="submit-section">
        <button type='submit' className="submit-btn">
           게시글 수정하기
        </button>
      </div>
      </form>
    </div>

    
  )
}

export default UpdatePost
