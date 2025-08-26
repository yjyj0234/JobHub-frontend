import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/LegalPages.css';

const NoticePage = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await axios.get('/api/announcements');
                setNotices(response.data);
            } catch (error) {
                console.error("공지사항 로드 실패", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, []);

    return (
        <div className="legal-page-container">
            <div className="legal-header">
                <h1>공지사항</h1>
                <p>JobHub의 새로운 소식을 확인하세요.</p>
            </div>
            <div className="legal-content">
                {loading ? (
                    <p>공지사항을 불러오는 중입니다...</p>
                ) : (
                    <div className="notice-list">
                        {notices.map(notice => (
                            <div key={notice.id} className="notice-item">
                                <h2>{notice.title}</h2>
                                <p className="notice-date">{new Date(notice.createdAt).toLocaleDateString()}</p>
                                <div className="notice-content" dangerouslySetInnerHTML={{ __html: notice.content.replace(/\n/g, '<br />') }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoticePage;