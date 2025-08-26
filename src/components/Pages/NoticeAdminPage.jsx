import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/FaqAdminPage.css';

const NoticeAdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingNotice, setEditingNotice] = useState(null);

  return (
    <div className="faq-admin-container">
      <h1>공지사항 관리</h1>
    </div>
  )
}

export default NoticeAdminPage;