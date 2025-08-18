import React, { useEffect, useState } from 'react'
import '../css/AddPost.css'
import axios from 'axios'
axios.defaults.withCredentials = true; // 쿠키 허용 설정
import { useNavigate } from 'react-router-dom'




const AddPost = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isBold, setIsBold] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const navigate = useNavigate();
  
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
  }, [])

  const handleTitleChange = (e) => {
    const value = e.target.value
    if (value.length <= 50) {
      setTitle(value)
    }
  }

  const handleContentChange = (e) => {
    const value = e.target.value
    if (value.length <= 5000) {
      setContent(value)
    }
  }
   const handleSubmit = async (e) => {
    e.preventDefault()

    const data = { title, content}

    try {
     await axios.post('http://localhost:8080/community/addpost', data)
      alert('등록 완료!')
      setTitle('')
      setContent('')
      navigate('/postlist'); // 등록 후 목록으로 이동
    } catch (err) {
      console.error(err)
      alert('등록 실패')
    }
  }

  

  return (
    <div className="add-post-container">
      {/* 헤더 섹션 */}
        <form onSubmit={handleSubmit}>
      <div className="header-section">
        <h1 className="main-title">커뮤니티 글등록</h1>
        <p className="subtitle">
          자유롭게 질문하고 답변을 받아보세요!
           </p>
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
              contentEditable
              className="editor"
                 onInput={(e) => setContent(e.currentTarget.innerHTML)}
                 aria-required
            ></div>
          <div className="character-counter">
            {content.length}/5000자
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
           게시글 등록하기
        </button>
      </div>
      </form>
    </div>

    
  )
}

export default AddPost
