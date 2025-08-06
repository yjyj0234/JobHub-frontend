import React, { useState } from 'react'
import './AddPost.css'
import axios from 'axios'



const AddPost = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isBold, setIsBold] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  
  
  

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

    const data = {
      title,
      content,
      id: {
        user_id : 3
      }
    }

    try {
     await axios.post('http://localhost:8080/community/addpost', data)
      alert('등록 완료!')
      setTitle('')
      setContent('')
    } catch (err) {
      console.error(err)
      alert('등록 실패')
    }
  }

  return (
    <div className="add-post-container">
      {/* 헤더 섹션 */}
      <div className="header-section">
        <h1 className="main-title">내용</h1>
        <p className="subtitle">실제 현직자 멘토들이 직접 답변해줘요</p>
      </div>
        <form onSubmit={handleSubmit}>
      {/* 제목 입력 필드 */}
      <div className="title-input-section">
        <input
          type="text"
          className="title-input"
          placeholder="질문 제목을 입력해주세요(최대 50자)"
          value={title}
          onChange={handleTitleChange}
          maxLength={50}
        />
      </div>

      {/* 텍스트 에디터 툴바 */}
      <div className="editor-toolbar">
        <button 
          className={`toolbar-btn ${isBold ? 'active' : ''}`}
          onClick={() => setIsBold(!isBold)}
        >
          B
        </button>
        <button 
          className={`toolbar-btn ${isUnderline ? 'active' : ''}`}
          onClick={() => setIsUnderline(!isUnderline)}
        >
          U
        </button>
      </div>

      {/* 내용 입력 영역 */}
      <div className="content-section">
        <p className="content-tip">구체적으로 작성하면 현직자의 답변률이 높아져요</p>
        <div className="content-input-container">
          <textarea
            className="content-input"
            placeholder="질문 내용을 자세히 작성해주세요..."
            value={content}
            onChange={handleContentChange}
            maxLength={5000}
          />
          <div className="character-counter">
            {content.length}/5000자
          </div>
        </div>
      </div>
        
      {/* 가이드라인 */}
      <div className="guidelines">
        <ul className="guidelines-list">
          <li>등록한 글은 커리어피드에서 사용중인 닉네임으로 등록됩니다.</li>
          <li>저작권 침해, 음란, 청소년 유해물, 기타 위법자료 등을 게시할 경우 게시물은 경고 없이 삭제 됩니다.</li>
          <li>답변이 등록되면 게시글 삭제가 불가합니다.</li>
        </ul>
      </div>

      <div>
        <button type='submit' >
           게시글 등록하기
        </button>
      </div>
      </form>
    </div>

    
  )
}

export default AddPost
